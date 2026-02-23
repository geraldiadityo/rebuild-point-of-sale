import { PenggunaResponse } from "src/master/pengguna/dto/pengguna.model";
import { RoleResponse } from "src/master/role/dto/role.model";

export class LoginRequestDTO {
    username: string;
    password: string;
}

export class LoginResponse {
    data: PenggunaResponse;
    token: string;
}

export class PayloadDecoded {
    username: string;
    sub: number;
    role: RoleResponse;
    jti: string;
    iat: number;
    exp: number;
}