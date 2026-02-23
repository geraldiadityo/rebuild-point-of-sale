import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ItemRepository } from "./item.repository";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { KategoriService } from "../kategori/kategori.service";
import { TipeService } from "../tipe/tipe.service";
import { ItemCreateDTO, ItemRequestDTO, ItemRequestWithAvg, ItemResponse, ItemResponseWithStok, ItemUpdateDefaultIndex, SkuDTO, UpdateAvgCost } from "./dto/item.model";
import { PrismaService } from "src/common/prisma.service";
import { getAbbreviation } from "src/utils/helper";
import { InventoryService } from "src/inventory/inventory.service";
import { Prisma } from "@prisma/client";
import { QueryOptionDTO } from "./dto/query-option.dto";
@Injectable()
export class ItemService {
    private readonly ctx = 'ItemService';
    constructor(
        private readonly repo: ItemRepository,
        private kategoriService: KategoriService,
        private tipeService: TipeService,
        @Inject(forwardRef(() => InventoryService)) private inventoryService: any,
        private readonly prisma: PrismaService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    private toItemResponse(item: any): ItemResponse {
        return {
            id: item.id,
            barcode: item.barcode,
            sku: item.sku,
            nama_item: item.nama_item,
            kategori: item.kategori,
            tipe: item.tipe,
            deskripsi: item.deksripsi,
            default_index: item.default_index,
            avg_cost: item.avg_cost,
        }
    }

    private toItemStokResponse(item: any, total_stok?: number): ItemResponseWithStok {
        return {
            id: item.id,
            barcode: item.barcode,
            sku: item.sku,
            nama_item: item.nama_item,
            kategori: item.kategori,
            tipe: item.tipe,
            deskripsi: item.deskripsi,
            default_index: item.default_index,
            avg_cost: item.avg_cost,
            total_stok: total_stok || 0
        }
    }

    private calculateEan13CheckDigit(twelveDigits: string): number {
        if (twelveDigits.length !== 12) {
          throw new Error('Input harus berupa 12 digit angka.');
        }
        const digits = twelveDigits.split('').map(Number);
        const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8] + digits[10];
        const evenSum = (digits[1] + digits[3] + digits[5] + digits[7] + digits[9] + digits[11]) * 3;
        const totalSum = oddSum + evenSum;
        const checkDigit = (10 - (totalSum % 10)) % 10;
        return checkDigit;
    }

    generateInternalEan13(): string {
        const internalPrefix = '20';
        const timestampPart = Date.now().toString().slice(-9);
        const randomPart = Math.floor(Math.random() * 10).toString();
        const twelveDigits = `${internalPrefix}${timestampPart}${randomPart}`;
        const checkDigit = this.calculateEan13CheckDigit(twelveDigits);
        return `${twelveDigits}${checkDigit}`;
    }

    async itemMustExists(
        id: number,
        tx?: Prisma.TransactionClient
    ): Promise<ItemResponseWithStok>{
        this.logger.debug(`Searching item with id: ${id}`,{context: this.ctx});
        const data = await this.repo.findById(id, tx);

        if(!data){
            this.logger.warn(`Item with id: ${id} was not found!`, {context: this.ctx});
            throw new HttpException('Item not found!', HttpStatus.NOT_FOUND);
        }

        const stokMap = await this.inventoryService.getStokBySkus([data.id]);
        const total_stok = stokMap.get(data.id) || 0;

        return this.toItemStokResponse(data, total_stok);
    }

    async checkName(
        nama_item: string,
        tx?: Prisma.TransactionClient
    ): Promise<ItemResponse | null>{
        this.logger.debug(`Searching item with name: ${nama_item}`,{context: this.ctx});
        const data = await this.repo.findByName(nama_item);
        
        if(!data){
            return null;
        }

        const stokMap = await this.inventoryService.getStokBySkus([data.id]);
        const total_stok = stokMap.get(data.id) || 0;

        return this.toItemStokResponse(data, total_stok);
    }

    async generateSKUUnique(
        data: SkuDTO,
        tx?: Prisma.TransactionClient
    ): Promise<string>{
        const prismaClient = tx || this.prisma;
        try {
            const { kodeKategori, kodeTipe, nama_item } = data;
            const itemCode = getAbbreviation(nama_item, 3);
            const skuPrefix = `${kodeKategori}-${kodeTipe}-${itemCode}`;

            // PENTING: Gunakan prismaClient (yang isinya adalah tx dari parent)
            const lastProduct = await this.repo.findByLastSkuPrefix(skuPrefix, prismaClient);

            let lastSequence = 0;
            if(lastProduct){
                const skuParts = lastProduct.sku.split('-');
                lastSequence = parseInt(skuParts[skuParts.length - 1], 10);
            }

            const newSequence = lastSequence + 1;
            const formattedSequence = newSequence.toString().padStart(4, '0');

            return `${skuPrefix}-${formattedSequence}`;
        } catch (err){
            this.logger.warn(`Failed to generate SKU: ${err.message}`);
            throw new HttpException('Failed to generate SKU', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItem(
        data: ItemRequestDTO
    ): Promise<ItemResponse>{
        this.logger.info(`starting create item name: ${data.nama_item}`,{context: this.ctx});
        const kategori = await this.kategoriService.kategoriMustExists(data.kategoriId);
        const tipe = await this.tipeService.tipeMustExist(data.tipeId);

        const checkName = await this.checkName(data.nama_item);
        
        if(checkName){
            this.logger.warn(`nama item ${data.nama_item} has already exists`, {context: this.ctx});
            throw new HttpException('nama item has already exists', HttpStatus.BAD_REQUEST);
        }
        const kategoriCode = getAbbreviation(kategori.nama,2);
        const tipeCode = getAbbreviation(tipe.nama, 2);
        const dataSku: SkuDTO = {
            kodeKategori: kategoriCode,
            kodeTipe: tipeCode,
            nama_item: data.nama_item,
        }

        const newSKU = await this.generateSKUUnique(dataSku);
        const dataSender: ItemCreateDTO = {
            barcode: data.barcode,
            sku: newSKU,
            nama_item: data.nama_item,
            kategoriId: kategori.id,
            tipeId: tipe.id,
            deskripsi: data.deskripsi,
        }

        const newItem = await this.repo.create(dataSender);
        this.logger.info(`Item with name ${newItem.nama_item} was created successfully`, {context: this.ctx});
        return this.toItemResponse(newItem);
    }

    async updateItem(
        id: number,
        data: ItemRequestDTO
    ): Promise<ItemResponse> {
        this.logger.info(`starting updating item with id: ${id}`, {context: this.ctx});
        const currentItem = await this.itemMustExists(id);
        const kategori = await this.kategoriService.kategoriMustExists(data.kategoriId);
        const tipe = await this.tipeService.tipeMustExist(data.tipeId);
        
        const kategoriCode = getAbbreviation(kategori.nama);
        const tipeCode = getAbbreviation(tipe.nama);
        const skuSender: SkuDTO = {
            kodeKategori: kategoriCode,
            kodeTipe: tipeCode,
            nama_item: data.nama_item
        }

        const newSKU = await this.generateSKUUnique(skuSender);
        const dataSender: Partial<ItemCreateDTO> = {
            barcode: data.barcode,
            sku: newSKU,
            nama_item: data.nama_item,
            kategoriId: kategori.id,
            tipeId: tipe.id,
            deskripsi: data.deskripsi
        }

        const updatedItem = await this.repo.update(currentItem.id, dataSender);
        this.logger.info(`update data item with id: ${updatedItem.id} was successfuly`,{context: this.ctx});
        return this.toItemResponse(updatedItem);
    }

    async findOrCreate(
        data: ItemRequestDTO,
        tx?: Prisma.TransactionClient
    ): Promise<ItemResponseWithStok> {
        this.logger.info(`starting find or create item with name: ${data.nama_item}`,{context: this.ctx});
        const existingItem = await this.checkName(data.nama_item, tx);
        if(existingItem){
            this.logger.info(`item with name: ${data.nama_item} has already exists, returning existing data`,{context: this.ctx});
            return this.toItemStokResponse(existingItem);
        }


        const kategori = await this.kategoriService.kategoriMustExists(data.kategoriId);
        const tipe = await this.tipeService.tipeMustExist(data.tipeId);
        
        let retryCount = 0;
        const maxRetries = 3;
        while (retryCount < maxRetries){
            try {
                const kategoriCode = getAbbreviation(kategori.nama, 2);
                const tipeCode = getAbbreviation(tipe.nama, 2);
                const skuDTO: SkuDTO = {
                    kodeKategori: kategoriCode,
                    kodeTipe: tipeCode,
                    nama_item: data.nama_item,
                };
                const newSKU = await this.generateSKUUnique(skuDTO, tx);
                const dataSender: ItemCreateDTO = {
                    barcode: data.barcode,
                    sku: newSKU,
                    nama_item: data.nama_item,
                    kategoriId: kategori.id,
                    tipeId: tipe.id,
                    deskripsi: data.deskripsi,
                };
        
                const newItem = await this.repo.upsert(dataSender, tx);
                this.logger.info(`item with name: ${newItem.nama_item} was successfuly created`,{context: this.ctx});
                const stokMap = await this.inventoryService.getStokBySkus([newItem.id]);
                const total_stok = stokMap.get(newItem.id) || 0;
        
                return this.toItemStokResponse(newItem, total_stok);

            } catch (error){
                if (error.code === 'P2002' && error.meta?.target?.includes('sku')){
                    retryCount ++;
                    this.logger.warn(`SKU conflic detected, retrying... (${retryCount}/${maxRetries})`,{context: this.ctx});
                    continue;
                }

                throw error
            }
        }

        throw new HttpException('Failed to generate unique SKU after multiple attemp', HttpStatus.CONFLICT);
    }

    async updateAvg(
        id: number,
        data: UpdateAvgCost,
        tx?: Prisma.TransactionClient
    ): Promise<ItemResponse> {
        this.logger.info(`starting updated avg cost for itemId: ${id}`,{context: this.ctx});
        const updatedAvg = await this.repo.update(id, data, tx);
        this.logger.info(`done updating avg cost for item id: ${id}`,{context: this.ctx});

        return this.toItemResponse(updatedAvg);
    }

    async removeItem(
        id: number
    ): Promise<ItemResponse>{
        this.logger.info(`Starting delete item with id: ${id}`,{context: this.ctx});
        const currentData = await this.itemMustExists(id);
        
        const deletedItem = await this.repo.delete(currentData.id);
        this.logger.info('item was deleted successfully',{context: this.ctx});
        
        return this.toItemResponse(deletedItem);
    }
    
    async getAll(
        queryOptions: QueryOptionDTO
    ): Promise<{
        data: ItemResponseWithStok[],
        meta: any
    }>{
        this.logger.debug('Get all Item with dynamic option',{context: this.ctx});
        const { page, pageSize, keyword, orderByField, orderByDirection } = queryOptions;

        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const direction = orderByDirection === -1 ? 'desc' : 'asc';
        const orderBy: Prisma.ItemOrderByWithRelationInput = {
            [orderByField]: direction
        };

        const where: Prisma.ItemWhereInput = keyword && keyword.trim() !== '' ? {
            OR: [
                { nama_item: { contains: keyword, mode: 'insensitive' } },
                { sku: { contains: keyword, mode: 'insensitive' } },
                { barcode: { contains: keyword, mode: 'insensitive' } }
            ]
        } : {};
        const [listData, totalItem] = await Promise.all([
            this.repo.findAll({
                where,
                take,
                skip,
                orderBy
            }),
            this.repo.countAll(where)
        ])
        if (listData.length === 0){
            return {
                data: [],
                meta: {
                    totalItem: 0,
                    totalPage: 0,
                    currentPage: page
                }
            };
        }


        const itemIds = listData.map((item) => item.id);
        const stokMap = await this.inventoryService.getStokBySkus(itemIds);
        // console.log(stokMap)
        const dataWithStok = listData.map((item) => {
            const total_stok = stokMap.get(item.id);
            return this.toItemStokResponse(item, total_stok);
        });

        const totalPage = Math.ceil(totalItem/pageSize);
        return {
            data: dataWithStok,
            meta: {
                totalItem,
                totalPage,
                currentPage: page
            }
        }
    }

    async getAllWithoutMeta(): Promise<ItemResponse[]> {
        this.logger.debug(`get all item without filtering and meta`,{context: this.ctx});
        const listData = await this.repo.findAll({});
        
        return listData.map((item) => this.toItemResponse(item));
    }

    // async search(
    //     take: number,
    //     skip: number,
    //     keyword: string
    // ): Promise<ItemResponseWithStok[]>{
    //     this.logger.debug(`searching item with contains: ${keyword}`,{context: this.ctx});
    //     const listData = await this.repo.search(take, skip, keyword);
    //     if (listData.length === 0){
    //         return [];
    //     }

    //     const skus = listData.map((item) => item.sku);
    //     const stokMap = await this.inventoryService.getStokBySkus(skus);
    //     return listData.map((item) => {
    //         const total_stok = stokMap.get(item.sku);
    //         return this.toItemStokResponse(item, total_stok);
    //     })
    // }

    async findByBarcode(
        barcode: string
    ): Promise<ItemResponseWithStok>{
        this.logger.debug(`searching item with barcode: ${barcode}`,{context: this.ctx});
        const data = await this.repo.findByBarcode(barcode);
        if(!data){
            this.logger.warn(`item with barcode: ${barcode} was not found`,{context: this.ctx});
            throw new HttpException('item not found', HttpStatus.NOT_FOUND);
        }

        const stokMap = await this.inventoryService.getStokBySkus([data.id]);
        const total_stok = stokMap.get(data.id) || 0;

        return this.toItemStokResponse(data, total_stok);
    }

    async findBySku(
        sku: string
    ): Promise<ItemResponse>{
        this.logger.debug(`Searching item with sku: ${sku}`, {context: this.ctx});
        const data = await this.repo.findBySku(sku);
        
        if(!data){
            this.logger.warn(`item with sku: ${sku} is not found`, {context: this.ctx});
            throw new HttpException('item not found', HttpStatus.NOT_FOUND);
        }

        return this.toItemResponse(data)
    }

    async updateDefaultIndex(
        id: number,
        data: ItemUpdateDefaultIndex
    ): Promise<ItemResponse> {
        this.logger.debug(`starting update indexing in item with id: ${id}`,{contex: this.ctx});
        const currentData = await this.itemMustExists(id);

        const updateData = await this.repo.update(currentData.id, data);

        return this.toItemResponse(updateData);
    }
}