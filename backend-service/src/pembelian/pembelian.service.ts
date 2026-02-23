import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { PembelianRepository } from "./pembelian.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { Prisma } from "@prisma/client";
import { DetailTransaksiResponse, PembelianQueryOptionsDTO, PembelianResponse, RequestTransaksi, RequestUpdateTransaksi, StatusOrder, TransaksiCreateDTO, TransaksiDetailCreateDTO, TransaksiDetailRequestDTO, TransaksiDetailRequestUpdateDTO } from "./dto/pembelian.model";
import { PrismaService } from "src/common/prisma.service";
import { InventoryService } from "src/inventory/inventory.service";
import { compareArrays } from "src/utils/helper";
import { RallPembelianQuery } from "src/reporting/dto/reporting.model";
import { CalculateFinalTransactionsStateUseCase } from "./use-cases/calculate-final-transaction-state.use-case";
import { FindOrCreateSupplierUseCase } from "./use-cases/find-or-create-supplier.use-case";
import { ProcessPurchaseDetailsUseCase } from "./use-cases/process-purchase-detail.use-case";
import { DeletePurchaseDetailsUseCase } from "./use-cases/delete-purchase-detail.use-case";
import { ValidateFakturOnUpdateUseCase } from "./use-cases/validate-faktur-on-update.use-case";
import { AveragePriceItemUseCase } from "./use-cases/average-price-item.use-case";
import { CashService } from "src/cash/cash.service";
import { CashMutationDTO } from "src/cash/cash.model";
@Injectable()
export class PembelianService {
    private readonly ctx = 'PembelianService';
    constructor(
        private prisma: PrismaService,
        private readonly repo: PembelianRepository,
        private inventoryService: InventoryService,
        private readonly cashService: CashService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        // use case
        private readonly calculateFinal: CalculateFinalTransactionsStateUseCase,
        private readonly findOrCreateSupplier: FindOrCreateSupplierUseCase,
        private readonly processDetail: ProcessPurchaseDetailsUseCase,
        private readonly deletePurchase: DeletePurchaseDetailsUseCase,
        private readonly validateFakturOnUpdate: ValidateFakturOnUpdateUseCase,
        private readonly averagePriceItem: AveragePriceItemUseCase,
    ) {}
    
    private toPembelianResponse(pembelian: any): PembelianResponse {
        return {
            id: pembelian.id,
            tanggal: pembelian.tanggal,
            no_faktur: pembelian.no_faktur,
            supplier: pembelian.supplier,
            tanggal_terima: pembelian.tanggal_terima,
            tanggal_jatuh_tempo: pembelian.tanggal_jatuh_tempo,
            total: pembelian.total,
            sisa_pembayaran: pembelian.sisa_pembayaran,
            status: pembelian.status
        }
    }

    private toDetailTransaksiResponse(detail: any): DetailTransaksiResponse {
        return {
            id: detail.id,
            tanggal: detail.tanggal,
            item: detail.item_satuan.item,
            satuan: detail.item_satuan.satuan,
            item_satuan: detail.item_satuan,
            harga_beli: detail.harga_beli,
            qty: detail.qty,
            total_harga: detail.qty * detail.harga_beli
        }
    }

    async pembelianMustExists(
        id: number
    ): Promise<PembelianResponse>{
        this.logger.debug(`Searching transaksi pembelian with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);

        if(!data){
            this.logger.warn(`Transaksi Pembelian with id: ${id} is not found`, {context: this.ctx});
            throw new HttpException('Transaksi Pembelian is not found', HttpStatus.NOT_FOUND);
        }

        return this.toPembelianResponse(data);
    }

    async createPembelian(
        data: RequestTransaksi,
        penggunaId: number,
    ): Promise<PembelianResponse> {
        this.logger.info(`Starting create pembelian with no faktur: ${data.transaksi.no_faktur}`,{context: this.ctx});

        const { transaksi, detail, shift } = data;
        const today = new Date();
        try {
            const newPembelian = await this.prisma.$transaction(
                async (tx) => {
                    const checkFaktur = await this.repo.findByNoFaktur(transaksi.no_faktur, tx);
                    if(checkFaktur){
                        this.logger.warn(`faktur with no: ${transaksi.no_faktur} has already exists`,{context: this.ctx});
                        throw new HttpException('Faktur has already exists', HttpStatus.BAD_REQUEST);
                    }

                    // supplier find or create
                    const supplier = await this.findOrCreateSupplier.execute(transaksi, tx);

                    // create temporary transaction for init
                    const transaksiTemp = await this.repo.createTransaksi({
                        tanggal: today,
                        no_faktur: transaksi.no_faktur,
                        supplierId: supplier.id,
                        tanggal_terima: new Date(transaksi.tanggal_terima),
                        tanggal_jatuh_tempo: new Date(transaksi.tanggal_jatuh_tempo),
                        sisa_pembayaran: 0,
                        total: 0
                    }, tx);

                    const { detailsToCreate, inventoryToCreate, total } = await this.processDetail.execute(
                        detail, today, transaksiTemp.id, tx
                    );

                    const { sisa_pembayaran, status } = this.calculateFinal.execute(total, transaksi.bayar);

                    await this.repo.createDetailTransaksiMany(detailsToCreate, tx);
                    await this.inventoryService.createInventoryMany(inventoryToCreate, tx);

                    const beforeCash = await this.cashService.cashMustExist(transaksi.cashId);
                    const currentCash = await this.cashService.decreaseCash(transaksi.cashId, transaksi.bayar, tx);
                    const dataMutation: CashMutationDTO = {
                        cashId: transaksi.cashId,
                        type: 'tarik',
                        saldo_awal: beforeCash.values,
                        value: transaksi.bayar,
                        saldo_akhir: currentCash.values,
                        keterangan: 'Pembelian Barang',
                        penggunaId: penggunaId,
                        shift: shift
                    }
                    await this.cashService.createMutationCash(dataMutation, tx);

                    return this.repo.updateAfterCreate(transaksiTemp.id, {
                        total: total,
                        sisa_pembayaran: sisa_pembayaran,
                        status: status
                    }, tx)
                }
            );

            this.logger.info(`transaksi pembelian with no faktur: ${newPembelian.no_faktur} was created successfully`,{context: this.ctx});
            return this.toPembelianResponse(newPembelian);
        } catch (err){
            this.logger.error(`failed to create transaksi pembelian: ${err.message}`,{context: this.ctx});
            throw new HttpException('Failed to create transaksi pembelian, something wrong', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    async updateBilling(
        id: number,
        bayar: number,
        cashId: number,
        penggunaId: number,
        shift: string,
    ): Promise<PembelianResponse>{
        this.logger.info(`starting payment billing pembelian with id: ${id}`,{context: this.ctx});
        const currentData = await this.pembelianMustExists(id);

        const updatedPembelian = await this.repo.updateBilling(currentData.id, bayar);
        const beforeCash = await this.cashService.cashMustExist(cashId);
        const currentCash = await this.cashService.decreaseCash(cashId, bayar);
        const dataMutation: CashMutationDTO = {
            cashId: cashId,
            type: 'tarik',
            saldo_awal: beforeCash.values,
            value: bayar,
            saldo_akhir: currentCash.values,
            keterangan: `Pembayaran cicilan faktur ${currentData.no_faktur}`,
            penggunaId: penggunaId,
            shift: shift
        }

        await this.cashService.createMutationCash(dataMutation)

        return this.toPembelianResponse(updatedPembelian);
    }

    async deleteDetail(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<DetailTransaksiResponse>{
        const deletedDetail = await this.repo.deleteDetail(id, tx);

        return this.toDetailTransaksiResponse(deletedDetail);
    }

    async updatePembelian(
        id: number,
        data: RequestUpdateTransaksi,
    ): Promise<PembelianResponse> {
        this.logger.info(`starting update data pembelian with id pembelian: ${id}`,{context: this.ctx});
        const { transaksi, detail: newDetail } = data;
        const oldDetailTransaksi: TransaksiDetailRequestUpdateDTO[] = [];
        try {
            const updatePembelian = await this.prisma.$transaction(
                async (tx) => {
                    const oldTransaksi = await this.pembelianMustExists(id);
                    await this.validateFakturOnUpdate.execute(oldTransaksi.id, transaksi.no_faktur, tx);

                    const supplier = await this.findOrCreateSupplier.execute(transaksi, tx);

                    const oldDetailData = await this.getDetailByIdPembelian(id, tx);
                    for(const item of oldDetailData){
                        oldDetailTransaksi.push({
                            id: item.id,
                            barcode: item.item.barcode,
                            nama_item: item.item.nama_item,
                            kategoriId: item.item.kategori?.id || 0,
                            tipeId: item.item.tipe?.id || 0,
                            satuanId: item.item_satuan.satuan?.id || 0,
                            convert_qty: item.item_satuan.convert_item,
                            price: item.item_satuan.qty_price,
                            qty: item.qty,
                            harga_beli: item.harga_beli
                        });
                    }
                    const { toCreate, toDelete } = compareArrays(
                        oldDetailTransaksi,
                        newDetail,
                        (item) => item.id
                    );

                    if(toCreate.length > 0){
                        const { detailsToCreate, inventoryToCreate } = await this.processDetail.execute(toCreate, oldTransaksi.tanggal, oldTransaksi.id, tx);
                        await this.repo.createDetailTransaksiMany(detailsToCreate, tx);
                        await this.inventoryService.createInventoryMany(inventoryToCreate, tx);
                    }

                    if(toDelete.length > 0){
                        await this.deletePurchase.execute(toDelete, tx);
                    }

                    const newTotal = (await this.getDetailByIdPembelian(oldTransaksi.id, tx))
                        .reduce((sum, item) => sum + (item.qty * item.harga_beli), 0);

                    const { sisa_pembayaran } = this.calculateFinal.execute(newTotal, transaksi.bayar);

                    return await this.repo.updateAfterCreate(oldTransaksi.id,{
                        no_faktur: transaksi.no_faktur,
                        tanggal_terima: new Date(transaksi.tanggal_terima),
                        tanggal_jatuh_tempo: new Date(transaksi.tanggal_jatuh_tempo),
                        supplierId: supplier.id,
                        total: newTotal,
                        sisa_pembayaran: sisa_pembayaran
                    })
                }
            );

            this.logger.info(`success updated data pembelian with id: ${id}`,{context: this.ctx});
            return this.toPembelianResponse(updatePembelian);
        } catch (err){
            this.logger.error(`Something error ${err.message}`, {context: this.ctx});
            throw new HttpException('Failed to update pembelian, something error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };
    
    async getAll(
        queryOption: PembelianQueryOptionsDTO
    ): Promise<{
        data: PembelianResponse[],
        meta: any
    }>{
        this.logger.debug('Get All data pembelian with dynamic condition',{context: this.ctx});
        const { page, pageSize, keyword, status, orderByField, orderByDirection } = queryOption;

        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const direction = orderByDirection === -1 ? 'desc' : 'asc';
        const orderBy: Prisma.PembelianOrderByWithRelationInput = {
            [orderByField]: direction
        }

        const conditions: Prisma.PembelianWhereInput[] = [
            { deleted_at: null }
        ];

        if(keyword && keyword.trim() !== ''){
            conditions.push({
                OR: [
                    { no_faktur: { contains: keyword, mode: 'insensitive' } },
                    { supplier: { nama_supplier: { contains: keyword, mode: 'insensitive'} } },
                ]
            })
        }

        if(status && status.trim() !== ''){
            if(status === StatusOrder.LUNAS){
                conditions.push({
                    status: true
                })
            } else if (status === StatusOrder.BELUM){
                conditions.push({
                    status: false
                })
            }
        };

        const where: Prisma.PembelianWhereInput = {
            AND: conditions
        };

        const [listData, totalItem] = await Promise.all([
            this.repo.findAllPembelian({
                where,
                take,
                skip,
                orderBy
            }),
            this.repo.countAll(where)
        ]);

        if(listData.length === 0){
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totalPage: 0,
                    currentPage: page
                }
            }
        }

        const totalPage = Math.ceil(totalItem/pageSize);
        
        return {
            data: listData.map((item) => this.toPembelianResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async getDetailByIdPembelian(
        pembelianId: number,
        tx?: Prisma.TransactionClient
    ): Promise<DetailTransaksiResponse[]>{
        this.logger.debug(`Get Detail transaksi with id pembelian: ${pembelianId}`,{context: this.ctx});
        const listData = await this.repo.getDetailById(pembelianId,tx);
        
        return listData.map((item) => this.toDetailTransaksiResponse(item));
    }

    async removePembelianWithArray(
        arraysId: number[]
    ): Promise<void>{
        this.logger.info('starting removing pembelian with list array',{context: this.ctx});
        const deleteList = await this.prisma.$transaction(
            async (tx) => {
                if(arraysId.length <= 0){
                    this.logger.warn(`array for removing pembelia is empty`,{context: this.ctx});
                    throw new HttpException('list to delete pembelian is empty', HttpStatus.BAD_REQUEST)
                }

                for(const item of arraysId){
                    const pembelian = await this.pembelianMustExists(item);
                    const detailPembelian = await this.getDetailByIdPembelian(item, tx);
                    
                    for (const data of detailPembelian){
                        const inventory = await this.inventoryService.getByItemAndTanggal(data.item.id, pembelian.tanggal, tx);
                        
                        await this.inventoryService.removeInventory(inventory.id, tx);
                        await this.deleteDetail(data.id, tx)
                    }

                    await this.repo.removeTransaksi(item, tx);
                }
            }
        )

        this.logger.info(`success deleted data transaksi with list`,{context: this.ctx})
    }

    // for reporting
    async getAllForReporting(
        query: RallPembelianQuery
    ): Promise<PembelianResponse[]>{
        this.logger.debug(`get all data pembelian with dynamic query for reporting`,{context: this.ctx});
        
        const { startDate, endDate, supplier, status } = query;

        const conditions: Prisma.PembelianWhereInput[] = [
            { deleted_at: null }
        ];

        if((startDate && startDate.trim() !== '') && (endDate && endDate.trim() !== '')){
            const start = new Date(startDate);
            const end = new Date(endDate);

            conditions.push({
                tanggal: {
                    gte: start,
                    lte: end
                }
            });
        }

        if(supplier && supplier.trim() !== ''){
            conditions.push({
                supplier: {
                    nama_supplier: supplier
                }
            })
        }

        if(status && status.trim() !== ''){
            if(status === StatusOrder.LUNAS){
                conditions.push({
                    status: true
                })
            } else if (status === StatusOrder.BELUM){
                conditions.push({
                    status: false
                })
            }
        }

        const where: Prisma.PembelianWhereInput = {
            AND: conditions
        };

        const listData = await this.repo.findAllPembelian({where});

        return listData.map((item) => this.toPembelianResponse(item));
    }

    // async getAveragePrice(
    //     itemId: number,
    //     endDate: Date,
    //     tx?: Prisma.TransactionClient
    // ): Promise<number> {
    //     this.logger.info(`Starting get average price from pembelian with itemId: ${itemId}`,{contex: this.ctx});
    //     const rawData = await this.repo.findDetailByItemId(itemId, endDate, tx);
    //     const cleanData = rawData.map((item) => this.toDetailTransaksiResponse(item));
    //     // console.log(cleanData)

    //     return await this.averagePriceItem.execute(cleanData);
    // }
}