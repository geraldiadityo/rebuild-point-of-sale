import { Tipe } from "@prisma/client";

export interface ITipeRepository {
    create(data: { nama: string }): Promise<Tipe>;
    update(id: number, data: { nama: string }): Promise<Tipe>;
    delete(id: number): Promise<Tipe>;
    findAll(): Promise<Tipe[]>;
    findById(id: number): Promise<Tipe | null>;
    findByName(nama: string): Promise<Tipe | null>;
}