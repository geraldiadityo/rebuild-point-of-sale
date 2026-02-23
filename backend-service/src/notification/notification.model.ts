import { TipePemberitahuan } from "@prisma/client";

export class UpsertNotificationDTO {
    tipe: TipePemberitahuan;
    pesan: string;
    refrensiId: number;
}

export class NotificationResponse {
    id: number;
    tipe: string;
    pesan: string;
}