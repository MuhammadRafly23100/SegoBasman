import { PrismaClient, UserRole, MenuAvailability } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { compressImage, COMPRESSED_MIME } from '../src/common/image.util';

const prisma = new PrismaClient();

// Folder fisik gambar menu (di project frontend). Dipakai untuk membaca byte
// gambar lalu menyimpannya langsung ke DB saat seeding.
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'frontend', 'public');

// Baca file gambar dari /public, kompres (resize + WebP), kembalikan byte-nya.
// Mengembalikan null bila file tidak ditemukan (biar seed tetap jalan).
async function readImage(gambarPath: string): Promise<{ data: Buffer; mime: string } | null> {
  const filePath = path.join(PUBLIC_DIR, gambarPath); // gambarPath diawali '/menu/...'
  if (!fs.existsSync(filePath)) {
    console.warn(`  ! Gambar tidak ditemukan, dilewati: ${filePath}`);
    return null;
  }
  const compressed = await compressImage(fs.readFileSync(filePath));
  return { data: compressed, mime: COMPRESSED_MIME };
}

// Daftar kategori (urutan menentukan tampilan di UI)
const kategoriData = [
  { nama: 'Paket Hemat', deskripsi: 'Nasi + lauk (free mendoan + sambal bawang)', urutan: 1 },
  { nama: 'Goreng Tepung', deskripsi: 'Lauk goreng tepung crispy', urutan: 2 },
  { nama: 'Tumisan', deskripsi: 'Aneka tumis sayur & seafood', urutan: 3 },
  { nama: 'Indomie', deskripsi: 'Indomie kuah & goreng', urutan: 4 },
  { nama: 'Pelengkap Nasi', deskripsi: 'Lauk & pelengkap satuan', urutan: 5 },
  { nama: 'Minuman', deskripsi: 'Minuman segar', urutan: 6 },
];

// Daftar menu: kategori, nama, harga (Rupiah), gambar (path di /public)
const menuData: Array<{ kategori: string; nama: string; harga: number; gambar: string }> = [
  // Paket Hemat
  { kategori: 'Paket Hemat', nama: 'Nasi Telor Crispy/Ceplok', harga: 10000, gambar: '/menu/nasi-telur-crispy.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Sosis', harga: 10000, gambar: '/menu/nasi-sosis.jpg' },
  { kategori: 'Paket Hemat', nama: 'Nasi Baso', harga: 10000, gambar: '/menu/nasi-baso.jpg' },
  { kategori: 'Paket Hemat', nama: 'Nasi Kepala Ayam', harga: 12000, gambar: '/menu/nasi-kepala-ayam.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Ati Ampela', harga: 12000, gambar: '/menu/nasi-ati-ampela.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Dumpling', harga: 12000, gambar: '/menu/nasi-dumpling.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Telur Puyuh', harga: 12000, gambar: '/menu/nasi-telur-puyuh.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Cumi Asin', harga: 12000, gambar: '/menu/nasi-cumi-asin.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Usus/Kulit', harga: 13000, gambar: '/menu/nasi-usus-kulit.jpg' },
  { kategori: 'Paket Hemat', nama: 'Nasi Pindang Bandeng', harga: 13000, gambar: '/menu/nasi-pindang-bandeng.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Lele', harga: 14000, gambar: '/menu/nasi-lele.jpg' },
  { kategori: 'Paket Hemat', nama: 'Nasi Bawal/Mujair', harga: 14000, gambar: '/menu/nasi-bawal-mujair.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Ikan Asin', harga: 14000, gambar: '/menu/nasi-ikan-asin.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Ayam 1/8', harga: 15000, gambar: '/menu/nasi-ayam.jpg' },
  { kategori: 'Paket Hemat', nama: 'Nasi Ikan Asap Jambal Laut', harga: 15000, gambar: '/menu/nasi-ikan-asap.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Paru', harga: 18000, gambar: '/menu/nasi-paru.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Belut', harga: 18000, gambar: '/menu/nasi-belut.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Cumi Segar', harga: 20000, gambar: '/menu/nasi-cumi-segar.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Udang', harga: 20000, gambar: '/menu/nasi-udang.png' },
  { kategori: 'Paket Hemat', nama: 'Nasi Nila', harga: 24000, gambar: '/menu/nasi-nila.jpg' },
  { kategori: 'Paket Hemat', nama: 'Nasi Bebek 1/4', harga: 35000, gambar: '/menu/nasi-bebek.png' },

  // Goreng Tepung
  { kategori: 'Goreng Tepung', nama: 'Nasi Udang Goreng Tepung', harga: 38000, gambar: '/menu/nasi-udang-goreng-tepung.jpg' },
  { kategori: 'Goreng Tepung', nama: 'Jamur Goreng Tepung', harga: 10000, gambar: '/menu/jamur-goreng-tepung.png' },

  // Tumisan
  { kategori: 'Tumisan', nama: 'Tumis Kangkung', harga: 8000, gambar: '/menu/tumis-kangkung.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Kacang Panjang', harga: 8000, gambar: '/menu/tumis-kacang-panjang.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Buncis', harga: 8000, gambar: '/menu/tumis-buncis.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Tauge', harga: 8000, gambar: '/menu/tumis-tauge.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Pare', harga: 8000, gambar: '/menu/tumis-pare.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Jamur', harga: 8000, gambar: '/menu/tumis-jamur.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Udang', harga: 20000, gambar: '/menu/tumis-udang.png' },
  { kategori: 'Tumisan', nama: 'Tumis Cumi', harga: 25000, gambar: '/menu/tumis-cumi.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Tongkol Suwir', harga: 10000, gambar: '/menu/tumis-tongkol-suwir.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Pindang Cue', harga: 10000, gambar: '/menu/tumis-pindang-cue.jpg' },
  { kategori: 'Tumisan', nama: 'Tumis Ikan Asin', harga: 10000, gambar: '/menu/tumis-ikan-asin.png' },
  { kategori: 'Tumisan', nama: 'Tumis Cumi Asin', harga: 10000, gambar: '/menu/tumis-cumi-asin.png' },

  // Indomie
  { kategori: 'Indomie', nama: 'Indomie Telur Goreng', harga: 10000, gambar: '/menu/indomie-telur-goreng.png' },
  { kategori: 'Indomie', nama: 'Indomie Telur Kuah', harga: 10000, gambar: '/menu/indomie-telur-kuah.jpg' },

  // Pelengkap Nasi
  { kategori: 'Pelengkap Nasi', nama: 'Nasi Putih', harga: 5000, gambar: '/menu/nasi-putih.png' },
  { kategori: 'Pelengkap Nasi', nama: 'Telur Dadar/Ceplok', harga: 5000, gambar: '/menu/telur-dadar.png' },
  { kategori: 'Pelengkap Nasi', nama: 'Jengkol Goreng', harga: 10000, gambar: '/menu/jengkol-goreng.png' },
  { kategori: 'Pelengkap Nasi', nama: 'Terong Goreng', harga: 5000, gambar: '/menu/terong-goreng.jpg' },
  { kategori: 'Pelengkap Nasi', nama: 'Kol Goreng', harga: 10000, gambar: '/menu/kol-goreng.jpg' },
  { kategori: 'Pelengkap Nasi', nama: 'Kerupuk Putih', harga: 2000, gambar: '/menu/kerupuk-putih.jpg' },
  { kategori: 'Pelengkap Nasi', nama: 'Tahu Goreng', harga: 2000, gambar: '/menu/tahu-goreng.png' },
  { kategori: 'Pelengkap Nasi', nama: 'Tempe Goreng', harga: 2000, gambar: '/menu/tempe-goreng.jpg' },
  { kategori: 'Pelengkap Nasi', nama: 'Pete', harga: 10000, gambar: '/menu/pete.jpg' },

  // Minuman
  { kategori: 'Minuman', nama: 'Es Jeruk', harga: 6000, gambar: '/menu/es-jeruk.png' },
  { kategori: 'Minuman', nama: 'Es Teh Manis', harga: 5000, gambar: '/menu/es-teh-manis.jpg' },
  { kategori: 'Minuman', nama: 'Air Mineral', harga: 5000, gambar: '/menu/air-mineral.jpg' },
  { kategori: 'Minuman', nama: 'S-tee', harga: 6000, gambar: '/menu/s-tee.jpg' },
  { kategori: 'Minuman', nama: 'Teh Pucuk', harga: 6000, gambar: '/menu/teh-pucuk.jpg' },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  console.log('Seeding database...');

  // --- Users (admin & kasir) ---
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPassword, nama: 'Admin Sego Basman', role: UserRole.ADMIN },
  });
  console.log('Admin ready:', admin.username);

  const kasirPassword = await bcrypt.hash('kasir123', 12);
  const kasir = await prisma.user.upsert({
    where: { username: 'kasir' },
    update: {},
    create: { username: 'kasir', password: kasirPassword, nama: 'Kasir Sego Basman', role: UserRole.KASIR },
  });
  console.log('Kasir ready:', kasir.username);

  // --- Bersihkan data menu lama (dummy) ---
  // Urutan FK-safe: orderItem -> order -> menu -> kategori
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.kategori.deleteMany();
  console.log('Data menu lama dibersihkan.');

  // --- Kategori ---
  const kategoriMap: Record<string, string> = {};
  for (const k of kategoriData) {
    const kategori = await prisma.kategori.create({ data: k });
    kategoriMap[k.nama] = kategori.id;
  }
  console.log('Kategori seeded:', Object.keys(kategoriMap).join(', '));

  // --- Menu ---
  let withImage = 0;
  for (const m of menuData) {
    const img = await readImage(m.gambar);
    if (img) withImage++;
    await prisma.menu.create({
      data: {
        id: `seed-${slugify(m.nama)}`,
        nama: m.nama,
        harga: m.harga,
        // Byte gambar disimpan langsung di DB. `gambar` (URL eksternal) dibiarkan
        // null karena gambar kini disajikan dari endpoint /menu/:id/gambar.
        gambar: null,
        gambarData: img?.data ?? null,
        gambarMime: img?.mime ?? null,
        availability: MenuAvailability.TERSEDIA,
        kategoriId: kategoriMap[m.kategori],
      },
    });
  }
  console.log(`${menuData.length} menu items seeded (${withImage} dengan gambar tersimpan di DB)`);

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
