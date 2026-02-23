import { Module } from "@nestjs/common";
import { InventoryModule } from "src/inventory/inventory.module";
import { ItemModule } from "src/master/barang/item/item.module";
import { StokOpnameRepository } from "./stock-opname.repository";
import { StokOpnameService } from "./stock-opname.service";
import { StokOpnameController } from "./stok-opname.controller";

@Module({
    imports: [
        InventoryModule,
        ItemModule
    ],
    providers: [
        StokOpnameRepository,
        StokOpnameService
    ],
    controllers: [
        StokOpnameController
    ]
})
export class StokOpnameModule {}