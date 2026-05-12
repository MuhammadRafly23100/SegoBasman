# Sego Pedes Basman — Aplikasi Digitalisasi UMKM

Aplikasi web terintegrasi untuk UMKM kuliner **Sego Pedes Basman** yang menyelesaikan tiga masalah operasional utama:

1. **Antrian Digital FIFO** — antrian otomatis berdasarkan urutan kedatangan, tidak ada lagi pelanggan yang merasa diserobot.
2. **Pesanan Berbasis Nama** — setiap pesanan terikat identitas pelanggan, tidak ada lagi pesanan tertukar.
3. **Dashboard Menu Real-Time** — status ketersediaan menu diperbarui instan via WebSocket.

> Proyek mata kuliah *Developing Business Applications* — Kelompok 4 (2025/2026)

---

## 🧰 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | NestJS 10 (TypeScript), Prisma 5, PostgreSQL 16, Redis 7, Socket.io 4 |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, TanStack Query, Zustand, socket.io-client |
| **Auth** | JWT + Passport, role-based (ADMIN / KASIR / PELANGGAN) |
| **Real-Time** | Socket.io (event-based broadcasting) |

---

## 📁 Struktur Proyek

```
sego-basman/
├── apps/
│   ├── backend/      # NestJS API + WebSocket gateway
│   └── frontend/     # Next.js App Router
├── docker-compose.yml
├── CLAUDE.md         # Spesifikasi lengkap proyek
└── README.md
```

Detail lengkap struktur ada di [CLAUDE.md](CLAUDE.md).

---

## 🚀 Cara Setup Lokal

### Prasyarat

- **Node.js** 20 LTS atau lebih baru
- **PostgreSQL** 16 (lokal atau managed)
- **Redis** 7 (lokal atau Upstash)
- **npm** (atau pnpm/yarn)

### 1. Clone repo

```powershell
git clone https://github.com/MuhammadRafly23100/SegoBasman.git
cd SegoBasman
```

### 2. Setup Backend

```powershell
cd apps\backend
npm install

# Buat file .env berdasarkan template
copy .env.example .env
# Edit .env — isi DATABASE_URL, REDIS_*, JWT_SECRET, dll

# Generate Prisma client & jalankan migrasi
npx prisma generate
npx prisma migrate dev

# Seed data awal (admin user + menu contoh)
npm run prisma:seed

# Jalankan dev server
npm run start:dev
```

Backend akan jalan di `http://localhost:3001`.
Swagger API docs tersedia di `http://localhost:3001/api/docs`.

### 3. Setup Frontend

Buka terminal baru:

```powershell
cd apps\frontend
npm install

# Buat file .env.local berdasarkan template
copy .env.example .env.local

# Jalankan dev server
npm run dev
```

Frontend akan jalan di `http://localhost:3000`.

---

## 👤 Akun Default (Hasil Seed)

| Role | Email | Password |
|------|-------|----------|
| **ADMIN** | `admin@segobasman.com` | `admin123` |
| **KASIR** | `kasir@segobasman.com` | `kasir123` |

> ⚠️ **Ganti password ini** sebelum deploy ke production.

---

## 🌐 Halaman Aplikasi

### Publik (tanpa login)

| Route | Deskripsi |
|-------|-----------|
| `/menu` | Daftar menu dengan status real-time |
| `/order` | Form pemesanan + input nama pelanggan |
| `/queue` | Display antrian besar (untuk layar di kasir) |

### Dashboard (perlu login)

| Route | Akses | Deskripsi |
|-------|-------|-----------|
| `/dashboard/queue` | KASIR | Manajemen antrian (panggil, selesai, lewati) |
| `/dashboard/orders` | KASIR | Daftar pesanan aktif + update status |
| `/dashboard/menu` | ADMIN | CRUD menu + toggle TERSEDIA/HABIS |
| `/dashboard/reports` | ADMIN | Laporan penjualan harian |

---

## 📡 Endpoint API Utama

Daftar lengkap lihat Swagger di `/api/docs`. Ringkasan:

```
POST   /auth/login              Public
POST   /queue/join              Public  Body: { customerName }
POST   /orders                  Public  Body: CreateOrderDto
GET    /menu                    Public

GET    /queue/active            KASIR
POST   /queue/call-next         KASIR
PATCH  /orders/:id/status       KASIR

POST   /menu                    ADMIN
PATCH  /menu/:id/availability   ADMIN
GET    /reports/daily           ADMIN
```

---

## 🔌 WebSocket Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `menu:updated` | `Menu` | Admin update status menu |
| `queue:updated` | `Queue` | Pelanggan join antrian baru |
| `queue:called` | `Queue` | Kasir panggil antrian |
| `order:created` | `Order` | Pesanan baru masuk |
| `order:updated` | `Order` | Status pesanan berubah |

---

## 🚢 Deployment

- **Backend** → Railway (PostgreSQL + Redis managed)
- **Frontend** → Vercel
- **Database** → Railway PostgreSQL
- **Redis** → Upstash atau Railway Redis

Panduan deployment lengkap akan ditambahkan di `docs/DEPLOY.md`.

---

## 🔐 Catatan Keamanan

- File `.env` **TIDAK** boleh di-commit (sudah di-ignore via `.gitignore`).
- Gunakan template `.env.example` di tiap app sebagai referensi.
- Untuk production: generate `JWT_SECRET` random minimal 64 karakter:
  ```powershell
  [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
  ```

---

## 🧑‍💻 Tim Pengembang

Kelompok 4 — Mata Kuliah *Developing Business Applications*
Tahun Ajaran 2025/2026

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik.
