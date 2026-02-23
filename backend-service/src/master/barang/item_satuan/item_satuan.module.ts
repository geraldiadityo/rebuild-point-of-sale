import { Module } from "@nestjs/common";
import { ItemModule } from "../item/item.module";
import { SatuanModule } from "../satuan/satuan.module";
import { ItemSatuanRepository } from "./item_satuan.repository";
import { ItemSatuanService } from "./item_satuan.service";
import { ItemSatuanController } from "./item_satuan.controller";

@Module({
    imports: [
        ItemModule,
        SatuanModule,
    ],
    providers: [
        ItemSatuanRepository,
        ItemSatuanService
    ],
    controllers: [ItemSatuanController],
    exports: [
        ItemSatuanService
    ]
})
export class ItemSatuanModule {}