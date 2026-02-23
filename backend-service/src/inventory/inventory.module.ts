import { forwardRef, Module } from "@nestjs/common";
import { ItemModule } from "src/master/barang/item/item.module";
import { InventoryRepository } from "./inventory.repository";
import { InventoryService } from "./inventory.service";
import { InventoryController } from "./inventory.controller";
import { NotificationModule } from "src/notification/notification.module";

@Module({
    imports: [
        NotificationModule,
        forwardRef(() => ItemModule),
    ],
    providers: [
        InventoryRepository,
        InventoryService
    ],
    controllers: [InventoryController],
    exports: [
        InventoryService
    ]
})
export class InventoryModule {}