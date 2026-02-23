import { Role } from "../role/types";

export interface User {
    id: number;
    username: string;
    nama: string;
    role: Role;
    status: boolean;
}