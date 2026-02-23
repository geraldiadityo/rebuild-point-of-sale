import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { PenjualanRepository } from "./penjualan.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { KeranjangInsert, KeranjangRequestDTO, KeranjangResponse, NoKeranjangWithItemCount, PenjualanCreate, PenjualanDetailCreate, PenjualanDetailResponse, PenjualanQueryOptionDTO, PenjualanRequestDTO, PenjualanResponse, TransaksiPenjualanResponse } from "./dto/penjualan.dto";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/common/prisma.service";
import { ProcessSaleDetailsUseCase } from "./use-cases/process-sale-details.use-case";
import { CalculateFinalSaleUseCase } from "./use-cases/calculate-final-sale.use-case";
import { RallPenjualanQuery, RlabaKotor } from "src/reporting/dto/reporting.model";
import { PembelianService } from "src/pembelian/pembelian.service";
import { AccumulateSaleUseCase } from "./use-cases/acumulate-sale.use-case";
import { CashService } from "src/cash/cash.service";
import { CashMutationDTO } from "src/cash/cash.model";

@Injectable()
export class PenjualanService {
    private readonly ctx = 'PenjualanService';
    constructor(
        private readonly repo: PenjualanRepository,
        private prisma: PrismaService,
        private readonly pembelianService: PembelianService,
        private readonly cashService: CashService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,

        // usecase
        private readonly processSaleDetail: ProcessSaleDetailsUseCase,
        private readonly calculateFinal: CalculateFinalSaleUseCase,
        private readonly accumulateSale: AccumulateSaleUseCase,
    ) {}

    private toPenjualanResponse(penjualan: any): PenjualanResponse {
        return {
            id: penjualan.id,
            tanggal: penjualan.tanggal,
            invoice: penjualan.invoice,
            total: penjualan.total,
            discount: penjualan.discount,
            grand_total: penjualan.grand_total,
            bayar: penjualan.bayar,
            tipe_pembayaran: penjualan.tipe_pembayaran,
            kembalian: penjualan.kembalian,
            pengguna: penjualan.pengguna
        }
    }

    private toDetailPenjualanResponse(detail: any): PenjualanDetailResponse {
        return {
            id: detail.id,
            item_satuan: detail.item_satuan,
            item: detail.item_satuan.item,
            satuan: detail.item_satuan.item,
            qty: detail.qty,
            harga: detail.harga
        }
    }

    private toKeranjangResponse(keranjang: any): KeranjangResponse {
        return {
            id: keranjang.id,
            no_keranjang: keranjang.no_keranjang,
            item: keranjang.item_satuan.item,
            satuan: keranjang.item_satuan.satuan,
            itemSatuanId: keranjang.item_satuan.id,
            harga: keranjang.harga,
            qty: keranjang.qty
        }
    }

    private toListKeranjangResponse(list: any): NoKeranjangWithItemCount {
        return {
            no_keranjang: list.no_keranjang,
            jumlah_item: Number(list.jumlah_item)
        }
    }

    async penjualanMustExist(
        id: number
    ): Promise<PenjualanResponse>{
        this.logger.debug(`search penjualan with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id);
        if(!data){
            this.logger.warn(`penjualan with id: ${id} is not found`,{context: this.ctx});
            throw new HttpException('Data Penjualan not found!', HttpStatus.NOT_FOUND);
        }

        return this.toPenjualanResponse(data);
    }

    async checkExternalId(
        external_id: string,
        tx?: Prisma.TransactionClient
    ): Promise<PenjualanResponse | null> {
        this.logger.debug(`search penjualan with external id: ${external_id}`,{context: this.ctx});
        const data = await this.repo.findByExternalId(external_id, tx);
        if(!data){
            return null
        }

        return this.toPenjualanResponse(data)
    }

    async generateInvoice(
        date: Date,
        tx?: Prisma.TransactionClient
    ): Promise<string> {
        const year = date.getFullYear();
        const day = String(date.getDate()).padStart(2, '0');
        const mounth = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = 'INV';
        let nextSequence: number = 1;
        const lastPenjualan = await this.repo.findLastInvoiceToday(date, tx);
        
        if(lastPenjualan){
            const lastSequenceStr = lastPenjualan.invoice.split('-')[2];
            const lastSequence = parseInt(lastSequenceStr, 10);
            nextSequence = lastSequence + 1;
        }

        const sequenceStr = String(nextSequence).padStart(4,'0');

        return `${prefix}-${day}${mounth}${year}-${sequenceStr}`;
    }

    async getAll(
        queryOption: PenjualanQueryOptionDTO
    ): Promise<{
        data: PenjualanResponse[],
        meta: any
    }>{
        this.logger.debug('Get All Penjualan by dynamic query',{context: this.ctx});
        const { page, pageSize, keyword, orderByField, orderByDirection } = queryOption;

        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const direction = orderByDirection === -1 ? 'desc' : 'asc';
        const orderBy: Prisma.PenjualanOrderByWithRelationInput = {
            [orderByField]: direction
        }

        const conditions: Prisma.PenjualanWhereInput[] = [
            { delete_at: null }
        ];

        if(keyword && keyword.trim() !== ''){
            conditions.push({
                OR: [
                    { invoice: { contains: keyword, mode: 'insensitive' } },
                    { pengguna: { nama: { contains: keyword, mode: 'insensitive' } } }
                ]
            })
        }

        const where: Prisma.PenjualanWhereInput = {
            AND: conditions
        }

        const [listData, totalItem] = await Promise.all([
            this.repo.findAll({
                where,
                orderBy,
                take,
                skip
            }),
            this.repo.countAll(where)
        ]);

        if(listData.length === 0){
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totaPage: 0,
                    currentPage: page
                }
            }
        }

        const totalPage = Math.ceil(totalItem/pageSize);
        
        return {
            data: listData.map((item) => this.toPenjualanResponse(item)),
            meta: {
                totalItem: totalItem,
                totalPage: totalPage,
                currentPage: page
            }
        }
    }

    async createPenjualan(
        data: PenjualanRequestDTO,
        penggunaId: number
    ): Promise<PenjualanResponse> {
        this.logger.info('Starting create new penjualan',{context: this.ctx});
        const { transaksi, detail, shift } = data;
        if(transaksi.external_id){
            const existPenjualan = await this.checkExternalId(transaksi.external_id);
            if (existPenjualan){
                this.logger.info(`Transaksi dengan external id ${transaksi.external_id} sudah ada. Skip pembuatan`,{context: this.ctx});
            }
        }
        const today = transaksi.tanggal ? new Date(transaksi.tanggal) : new Date();
        try {
            const newPenjualan = await this.prisma.$transaction(
                async (tx) => {
                    const invoice = await this.generateInvoice(today, tx);
                    const dataPenjualan: PenjualanCreate = {
                        invoice: invoice,
                        tanggal: today,
                        total: 0,
                        discount: transaksi.discount,
                        grand_total: 0,
                        bayar: transaksi.bayar,
                        tipe_pembayaran: transaksi.tipe_pembayaran,
                        kembalian: 0,
                        external_id: transaksi.external_id ? transaksi.external_id : undefined,
                        penggunaId: penggunaId
                    };

                    const tempPenjualan = await this.repo.createPenjualan(dataPenjualan, tx);
                    
                    const { detailToCreate, total } = await this.processSaleDetail.execute(detail, tempPenjualan.id, today, tx);

                    await this.repo.createManyPenjualanDetail(detailToCreate, tx);

                    const { grand_total, kembalian } = this.calculateFinal.execute(total, transaksi.discount, transaksi.bayar);
                    
                    let cashCurrentState = await this.cashService.cashMustExist(transaksi.cashId, tx);
                    if(transaksi.tipe_pembayaran === 'cash'){
                        const currentCash = await this.cashService.increaseCash(transaksi.cashId, transaksi.bayar, tx);
                        const dataMutation: CashMutationDTO = {
                            cashId: transaksi.cashId,
                            type: 'setor',
                            saldo_awal: cashCurrentState.values,
                            value: transaksi.bayar,
                            keterangan: 'Penjualan',
                            saldo_akhir: currentCash.values,
                            penggunaId: penggunaId,
                            shift: shift
                        };

                        await this.cashService.createMutationCash(dataMutation, tx);
                        cashCurrentState = currentCash
                    }
                    if(kembalian > 0){
                        const currentCashAfter = await this.cashService.decreaseCash(transaksi.cashId, kembalian, tx);
                        const dataMutation: CashMutationDTO = {
                            cashId: transaksi.cashId,
                            type: 'tarik',
                            saldo_awal: cashCurrentState.values,
                            value: kembalian,
                            saldo_akhir: currentCashAfter.values,
                            keterangan: 'Kembalian',
                            penggunaId: penggunaId,
                            shift: shift
                        };

                        await this.cashService.createMutationCash(dataMutation, tx);
                    }

                    return await this.repo.updateAfterCreate(tempPenjualan.id, {
                        total: total,
                        grand_total: grand_total,
                        kembalian: kembalian
                    }, tx);
                }
            )
            return this.toPenjualanResponse(newPenjualan);
        } catch (err){
            this.logger.error(`Failed to create data penjualan, err ${err.message}`,{context: this.ctx});
            throw new HttpException('Faild to create Penjualan, something wrong', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTransaksiAndDetail(
        penjualanId: number
    ): Promise<TransaksiPenjualanResponse>{
        this.logger.debug(`Get Data Penjualan with Id: ${penjualanId} and get detail`,{context: this.ctx});
        const transaksi = await this.penjualanMustExist(penjualanId);
        const detail = await this.repo.findDetailByIdPenjualan(transaksi.id);
        
        const res: TransaksiPenjualanResponse = {
            transaksi: transaksi,
            detail: detail.map((item) => this.toDetailPenjualanResponse(item))
        }

        return res;

    }

    async generateNoKeranjang(
        tx?: Prisma.TransactionClient
    ): Promise<string> {
        const prefix = 'KRJ';
        let nextSequence: number = 1;
        const lastNoKeranjang = await this.repo.findLastNumberKeranjang(tx);
        
        if(lastNoKeranjang){
            const lastSequenceStr = lastNoKeranjang.no_keranjang.split('-')[1];
            const lastSequence = parseInt(lastSequenceStr, 10);
            nextSequence = lastSequence + 1;
        }

        const sequenceStr = String(nextSequence).padStart(4, '0');
        
        return `${prefix}-${sequenceStr}`;
    }

    async insertIntoKeranjang(
        dataKeranjang: KeranjangRequestDTO
    ): Promise<void>{
        this.logger.info('starting insert data into keranjang for holding', {context: this.ctx});
        const { data } = dataKeranjang;
        if(data.length === 0){
            this.logger.warn(`data to insert keranjang is 0`,{context: this.ctx});
            throw new HttpException('data sender is empty, is not accepted', HttpStatus.BAD_REQUEST)
        }
        const dataSender: KeranjangInsert[] = [];
        this.prisma.$transaction(
            async (tx) => {
                const no_keranjang = await this.generateNoKeranjang(tx);
                for(const item of data){
                    dataSender.push({
                        no_keranjang: no_keranjang,
                        itemId: item.itemId,
                        itemSatuanId: item.itemSatuanId,
                        harga: item.harga,
                        qty: item.qty
                    })
                }
                await this.repo.insertManyKeranjang(dataSender, tx);
            }
        )

        this.logger.info(`success insert data to keranjang`,{context: this.ctx})
    }

    async getAndDeleteKeranjang(
        no_keranjang: string
    ): Promise<KeranjangResponse[]>{
        this.logger.debug(`get and delete item keranjang with no keranjang: ${no_keranjang}`,{context: this.ctx});
        const dataKeranjang = await this.prisma.$transaction(
            async (tx) => {
                const listData = await this.repo.findKeranjangByNo(no_keranjang, tx);

                await this.repo.deleteManyKeranjang(no_keranjang,tx);

                return listData
            }
        )

        return dataKeranjang.map((item) => this.toKeranjangResponse(item));
    }

    async listKeranjangWithCountItem(): Promise<NoKeranjangWithItemCount[]> {
        this.logger.debug('Get All list Keranjang with count item',{context: this.ctx});
        const listKeranjang = await this.repo.getListKeranjangWithItemCount();

        return listKeranjang.map((item) => this.toListKeranjangResponse(item));
    }

    // for reporting
    async getAllPenjualanForReporting(
        query: RallPenjualanQuery
    ): Promise<PenjualanResponse[]> {
        this.logger.debug('get all penjualan with dynamic query for reporting',{context: this.ctx});
        
        const { startDate, endDate, pengguna } = query;

        const conditions: Prisma.PenjualanWhereInput[] = [
            {delete_at : null},
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

        if(pengguna && pengguna.trim() !== ''){
            conditions.push({
                pengguna: {
                    nama: pengguna
                }
            })
        }

        const where: Prisma.PenjualanWhereInput = {
            AND: conditions
        }

        const listData = await this.repo.findAll({where});
        return listData.map((item) => this.toPenjualanResponse(item));
    }

    async accumulateByTanggal(
        startDate: Date,
        endDate: Date,
        tx?: Prisma.TransactionClient
    ): Promise<{
        sub_total: number,
        total_pokok: number
    }>{
        const rawListData = await this.repo.findDetailByTanggal(startDate, endDate, tx);
        const listData = rawListData.map((item) => this.toDetailPenjualanResponse(item));
        const { sub_total, total_pokok } = await this.accumulateSale.execute(listData, endDate, tx);

        return { sub_total, total_pokok };
    }

    async getLabaKotorReport(startDate: Date, endDate: Date): Promise<RlabaKotor[]> {
        return await this.repo.getLabaKotorAggregate(startDate, endDate);
    }

    async getTotalPenjualanByDate(startDate: Date, endDate: Date): Promise<number> {
        return await this.repo.getSumPenjualanDate(startDate, endDate);
    }
}
