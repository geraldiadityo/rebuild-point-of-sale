import { Prisma, Supplier } from "@prisma/client";
import { SupplierDTO } from "../dto/supplier.model";
import { FindAllSupplierArgs } from "../supplier.repository";

export interface ISupplierRepository {
    create(data: SupplierDTO): Promise<Supplier>;
    update(id: number, data: SupplierDTO): Promise<Supplier>;
    delete(id: number): Promise<Supplier>;
    upsert(data: SupplierDTO, tx?: Prisma.TransactionClient): Promise<Supplier>;
    findAll(args: FindAllSupplierArgs): Promise<Supplier[]>;
    findById(id: number): Promise<Supplier | null>;
    findByName(nama_supplier: string): Promise<Supplier | null>;
    countAll(where?: Prisma.SupplierWhereInput): Promise<number>;
}