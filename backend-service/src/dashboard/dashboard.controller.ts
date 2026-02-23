import { Controller, Get, HttpCode } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { ApiResponse } from "src/utils/web.model";
import { DashboardResponse } from "./dashboard.model";

@Controller('/api/dashboard')
export class DashboardController {
    constructor(
        private service: DashboardService
    ) {}

    @Get()
    @HttpCode(200)
    async dashboard(): Promise<ApiResponse<DashboardResponse>> {
        const result = await this.service.getDataDashboard();

        return {
            data: result,
            message: 'success'
        }
    }
}