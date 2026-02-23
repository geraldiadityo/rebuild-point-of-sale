import { RoleResponse } from "src/master/role/dto/role.model";

export class PenggunaRequestDTO {
    username: string;
    nama: string;
    roleId: number;
    password: string;
    confirm_password: string;
}

export class PenggunaCreateDTO {
    username: string;
    nama: string;
    roleId: number;
    password: string;
}

export class PenggunaUpdateDTO {
    username: string;
    nama: string;
    roleId: number;
}

export class ResetPasswordDTO {
    new_password: string;
    confirm_password: string;
}

export class PenggunaResponse {
    id: number;
    username: string;
    nama: string;
    role: RoleResponse;
    status: boolean;
}