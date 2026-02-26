import { Role } from "../role/types";

export interface User {
    id: number;
    username: string;
    nama: string;
    role: Role;
    status: boolean;
}

export interface UserCreateApi {
    username: string;
    nama: string;
    roleId: number;
    password: string;
    confirm_password: string;
}