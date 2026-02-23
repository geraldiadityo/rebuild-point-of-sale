import { Pengguna } from "@prisma/client";

export interface IPenggunaRepository {
    create(data: { username: string, nama: string, roleId: number, password: string }): Promise<Pengguna>;
    delete(id: number): Promise<Pengguna>;
    findAll(): Promise<Pengguna[]>;
    findById(id: number): Promise<Pengguna | null>;
    findByUsername(username: string): Promise<Pengguna | null>;
}