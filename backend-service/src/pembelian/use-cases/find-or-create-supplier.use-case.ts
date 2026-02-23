import { Injectable } from "@nestjs/common";
import { Prisma, Supplier } from "@prisma/client";
import { SupplierDTO } from "src/supplier/dto/supplier.model";
import { SupplierService } from "src/supplier/supplier.service";

@Injectable()
export class FindOrCreateSupplierUseCase {
    constructor(
        private readonly supplierService: SupplierService
    ) {}

    async execute(
        supplier: SupplierDTO,
        tx: Prisma.TransactionClient
    ): Promise<Supplier> {
        return await this.supplierService.findOrCreate(supplier, tx);
    }
}