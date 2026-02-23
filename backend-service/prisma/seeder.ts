import { PrismaClient } from "@prisma/client";
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('seeder starting...!');

    // --- 1. Seed Role & Superadmin ---
    console.log('Seeding Role & User...');
    // Menggunakan upsert agar tidak error jika dijalankan berulang
    const role = await prisma.role.upsert({
        where: { nama: 'superadmin' },
        update: {},
        create: {
            nama: 'superadmin'
        }
    });

    // Tambahkan role lain yang umum
    await prisma.role.createMany({
        data: [
            { nama: 'admin' },
            { nama: 'kasir' },
            { nama: 'admin gudang' }
        ],
        skipDuplicates: true
    });

    await prisma.pengguna.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: bcryptjs.hashSync('Ge@140019', 10),
            roleId: role.id,
            nama: 'geraldi adityo'
        }
    });

    // --- 2. Seed Kategori Barang ---
    console.log('Seeding Kategori...');
    const dataKategori = [
        { nama: 'Makanan' },
        { nama: 'Minuman' },
        { nama: 'Sembako' },
        { nama: 'Kebutuhan Rumah Tangga' }, // Sabun cuci, tisu, dll
        { nama: 'Kesehatan & Kecantikan' }, // Sabun mandi, obat, kosmetik
        { nama: 'Ibu & Bayi' },             // Popok, susu bayi
        { nama: 'Rokok & Korek' },
        { nama: 'Alat Tulis Kantor' },
        { nama: 'Elektronik & Kelistrikan' } // Baterai, lampu
    ];

    await prisma.kategori.createMany({
        data: dataKategori,
        skipDuplicates: true // Lewati jika data sudah ada (berdasarkan @unique nama)
    });

    // --- 3. Seed Tipe Barang ---
    console.log('Seeding Tipe...');
    // Tipe biasanya sub-klasifikasi atau jenis sifat barang
    const dataTipe = [
        { nama: 'Umum' },             // Default
        { nama: 'Makanan Ringan' },   // Snack
        { nama: 'Makanan Instan' },   // Mie, bubur instan
        { nama: 'Minuman Bersoda' },
        { nama: 'Minuman Kemasan' },  // Teh kotak, jus
        { nama: 'Air Mineral' },
        { nama: 'Susu & Olahan' },
        { nama: 'Bumbu Dapur' },
        { nama: 'Frozen Food' },      // Nugget, sosis (jika ada freezer)
        { nama: 'Obat Bebas' },
        { nama: 'Pembersih' }         // Deterjen, pembersih lantai
    ];

    await prisma.tipe.createMany({
        data: dataTipe,
        skipDuplicates: true
    });

    // --- 4. Seed Satuan Barang ---
    console.log('Seeding Satuan...');
    const dataSatuan = [
        // Satuan Kecil (Eceran)
        { nama: 'Pcs' },
        { nama: 'Botol' },
        { nama: 'Kaleng' },
        { nama: 'Sachet' },
        { nama: 'Bungkus' },
        { nama: 'Cup' },
        { nama: 'Butir' }, // Telur
        
        // Satuan Menengah
        { nama: 'Pack' },
        { nama: 'Renceng' }, // Biasa untuk kopi sachet/shampoo
        { nama: 'Slop' },    // Rokok
        { nama: 'Ikat' },
        { nama: 'Lusin' },
        
        // Satuan Besar (Grosir/Stok)
        { nama: 'Box' },
        { nama: 'Karton' },  // Dus
        { nama: 'Karung' },  // Beras
        { nama: 'Bal' },     // Snack curah/krupuk
        { nama: 'Galon' },
        
        // Satuan Berat/Volume
        { nama: 'Kg' },
        { nama: 'Gram' },
        { nama: 'Liter' },
        { nama: 'Ml' }
    ];

    await prisma.satuan.createMany({
        data: dataSatuan,
        skipDuplicates: true
    });
    
    console.log('Seeder finished successfully!');
}

main()
    .catch(e => {
        console.log(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
