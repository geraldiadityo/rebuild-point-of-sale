export class ApiResponse<T> {
    data: T;
    message?: string;
    totalItem?: number;
    totalPage?: number;
    currentPage?: number;
    token?: string;
}