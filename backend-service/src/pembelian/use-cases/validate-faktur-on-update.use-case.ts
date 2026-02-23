import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";
import { PembelianRepository } from "../pembelian.repository";
import { Prisma } from "@prisma/client";

@Injectable()
export class ValidateFakturOnUpdateUseCase {
    private readonly ctx = 'ValidateFakturOnUpdateUseCase';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly repo: PembelianRepository
    ) {}

    async execute(
        pembelianId: number,
        newFaktur: string,
        tx: Prisma.TransactionClient
    ): Promise<void>{
        this.logger.info('validated nomor faktur for update',{context: this.ctx});
        
        const currentTransaksi = await this.repo.findById(pembelianId, tx);
        if(!currentTransaksi){
            this.logger.warn(`transaksi pembelian with id: ${pembelianId} was not found for validated nomor faktur`,{context: this.ctx});
            throw new HttpException('Transaksi is not found', HttpStatus.NOT_FOUND);
        }

        const isFakturChange = newFaktur.trim() !== currentTransaksi.no_faktur;

        if(isFakturChange){
            this.logger.debug(`nomor faktur starting change from ${currentTransaksi.no_faktur} to ${newFaktur}`,{context: this.ctx});
            const existingFaktur = await this.repo.findByNoFaktur(newFaktur, tx);
            
            if(existingFaktur){
                this.logger.warn(`nomor faktur ${newFaktur} has already exists in data`,{context: this.ctx});
                throw new HttpException(`nomor faktur ${newFaktur} has already exists`, HttpStatus.BAD_REQUEST);
            }
        }
    }
}