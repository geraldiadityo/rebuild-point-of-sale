import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class CalculateFinalTransactionsStateUseCase {
    private readonly ctx = 'CalculateFinalTransactionsStateUseCase';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}
    execute(
        total: number,
        bayar: number
    ): {
        sisa_pembayaran: number,
        status: boolean
    } {
        if(total - bayar < 0){
            this.logger.warn(`total - bayar kurang dari 0`,{context: this.ctx});
            throw new HttpException('jumlah pembayaran melebihi total transaksi', HttpStatus.BAD_REQUEST);
        }

        const sisa_pembayaran = total - bayar;
        const status = sisa_pembayaran === 0;


        return { sisa_pembayaran, status }
    }
}