import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { RoleModule } from './master/role/role.module';
import { PenggunaModule } from './master/pengguna/pengguna.module';
import { AuthModule } from './auth/auth.module';
import { KategoriModule } from './master/barang/kategori/kategori.module';
import { SatuanModule } from './master/barang/satuan/satuan.module';
import { TipeModule } from './master/barang/tipe/tipe.module';
import { ItemModule } from './master/barang/item/item.module';
import { ItemSatuanModule } from './master/barang/item_satuan/item_satuan.module';
import { SupplierModule } from './supplier/supplier.module';
import { InventoryModule } from './inventory/inventory.module';
import { PembelianModule } from './pembelian/pembelian.module';
import { PenjualanModule } from './penjualan/penjualan.module';
import { ReportingModule } from './reporting/reporting.module';
import { DiscountModule } from './discount/discount.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './tasks/task.module';
import { StokOpnameModule } from './stock_opname/stock-opname.module';
import { AttributeModule } from './attribute/attribute.module';
import { CashModule } from './cash/cash.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CommonModule,
    AttributeModule,
    TaskModule,
    // master data
    RoleModule,
    PenggunaModule,
    // auth
    AuthModule,

    // barang
    KategoriModule,
    SatuanModule,
    TipeModule,
    ItemModule,
    ItemSatuanModule,
    // supplier
    SupplierModule,
    // inventory
    InventoryModule,
    StokOpnameModule,
    // discount
    DiscountModule,
    // transaksi
    PembelianModule,
    PenjualanModule,
    // reporting
    ReportingModule,
    // cash
    CashModule,
    DashboardModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
