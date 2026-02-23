import { Module } from "@nestjs/common";
import { DiscountModule } from "src/discount/discount.module";
import { InventoryModule } from "src/inventory/inventory.module";
import { TaskService } from "./task.service";

@Module({
    imports: [
        InventoryModule,
        DiscountModule
    ],
    providers: [
        TaskService
    ]
})
export class TaskModule {}