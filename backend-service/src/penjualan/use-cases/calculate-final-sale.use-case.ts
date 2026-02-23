import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class CalculateFinalSaleUseCase {
    private readonly ctx = 'CalculateFinalSaleUseCase';
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    execute(
        total: number,
        discount: number,
        bayar: number
    ): {
        grand_total: number,
        kembalian: number
    } {
        if(total - discount < 0){
            this.logger.warn(`discount is large than total`,{context: this.ctx});
            throw new HttpException('discount can not large more than tota', HttpStatus.BAD_REQUEST);
        }

        const grand_total: number = total - discount;

        if(bayar - grand_total < 0){
            this.logger.warn(`cash is not compatible to grand total`,{context: this.ctx});
            throw new HttpException('cash not enough for this transaction', HttpStatus.BAD_REQUEST);
        }

        const kembalian: number = bayar - grand_total;

        return { grand_total, kembalian }
    }
}