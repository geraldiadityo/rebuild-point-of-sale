import { Controller, Delete, Get, HttpCode, Param, ParseIntPipe } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { ApiResponse } from "src/utils/web.model";
import { NotificationResponse } from "./notification.model";

@Controller('/api/notification')
export class NotificationController {
    constructor(
        private service: NotificationService
    ) {}

    @Get()
    @HttpCode(200)
    async getAllNotif(): Promise<ApiResponse<NotificationResponse[]>> {
        const result = await this.service.getAll();

        return {
            data: result,
            message: 'success'
        }
    }

    @Delete('/:id')
    @HttpCode(200)
    async resolveNotif(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ApiResponse<boolean>> {
        const result = await this.service.doneNotification(id);

        return {
            data: true,
            message: `success resolve notification`
        }
    }
}