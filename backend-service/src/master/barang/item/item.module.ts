import { forwardRef, Module } from "@nestjs/common";
import { KategoriModule } from "../kategori/kategori.module";
import { TipeModule } from "../tipe/tipe.module";
import { ItemRepository } from "./item.repository";
import { ItemService } from "./item.service";
import { ItemController } from "./item.controller";
import { InventoryModule } from "src/inventory/inventory.module";

@Module({
    imports: [
        KategoriModule,
        TipeModule,
        forwardRef(() => InventoryModule),
    ],
    providers: [
        ItemRepository,
        ItemService
    ],
    controllers: [
        ItemController
    ],
    exports: [
        ItemService
    ]
})
export class ItemModule {}