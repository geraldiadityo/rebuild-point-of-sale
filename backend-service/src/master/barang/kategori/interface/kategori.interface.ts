import { Kategori } from "@prisma/client";

export interface IKategoriRepository {
    create(data: { nama: string }): Promise<Kategori>;
    update(id: number, data: { nama: string }): Promise<Kategori>;
    delete(id: number): Promise<Kategori>;
    findAll(): Promise<Kategori[]>;
    findById(id: number): Promise<Kategori | null>;
    findByName(nama: string): Promise<Kategori | null>;
}