import { Satuan } from "@prisma/client";

export interface ISatuanRepository {
    create(data: { nama: string }): Promise<Satuan>;
    update(id: number, data: { nama: string }): Promise<Satuan>;
    remove(id: number): Promise<Satuan>;
    findAll(): Promise<Satuan[]>;
    findById(id: number): Promise<Satuan | null>;
    findByName(nama: string): Promise<Satuan | null>;
}