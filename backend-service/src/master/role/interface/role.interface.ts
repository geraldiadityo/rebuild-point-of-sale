import { Role } from "@prisma/client";

export interface IRoleRepository {
    create(data: { nama: string }): Promise<Role>;
    update(id: number, data: { nama: string }): Promise<Role>;
    delete(id: number): Promise<Role>;
    findAll(): Promise<Role[]>;
    findById(id: number): Promise<Role | null>;
    findByName(nama: string): Promise<Role | null>;
}