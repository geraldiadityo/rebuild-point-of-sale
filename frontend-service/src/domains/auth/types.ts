// ─── Auth Domain Types ────────────────────────────────────────────────────────

/**
 * Payload sent to the login endpoint.
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface Role {
    id: number;
    nama: string;
}

/**
 * Shape of the "user" cookie (JSON-stringified by the server).
 * This cookie is client-readable (NOT httpOnly).
 */
export interface AuthUser {
    nama: string;
    role: Role;
    username: string;
}
