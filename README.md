# Sistem Informasi Manajemen Klinik - Frontend (FE)

Repositori ini berisi frontend untuk **Sistem Informasi Manajemen Klinik (SIMK)** yang dibangun menggunakan React, TypeScript, dan Vite.

## 🚀 Fitur Utama
- **Manajemen Pasien & Dokter**: Antarmuka untuk pendaftaran pasien, pencarian dokter, dan jadwal konsultasi.
- **Sistem Janji Temu**: Pemesanan jadwal, antrean, dan rekam medis pasien.
- **Resep & Pembayaran**: Manajemen resep obat digital dan modul pembayaran/invoice.
- **Dashboard Multi-Role**: Tampilan dashboard yang disesuaikan untuk Admin, Dokter, dan Pasien.

## 🛠️ Tech Stack
- **Library Utama**: React 19 & TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v3 & Lucide React (ikon)
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **Form & Validation**: React Hook Form & Zod
- **HTTP Client**: Axios

## 📦 Cara Memulai

### 1. Prasyarat
Pastikan Anda sudah menginstal Node.js (versi 18+) di komputer Anda.

### 2. Instalasi Dependensi
Jalankan perintah berikut di dalam direktori `fe`:
```bash
npm install
```

### 3. Konfigurasi Environment
Buat file `.env.local` di direktori `fe` dan sesuaikan URL API backend:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Menjalankan Server Pengembangan
Jalankan perintah berikut untuk memulai server lokal:
```bash
npm run dev
```
Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

## 📜 Skrip yang Tersedia
- `npm run dev` - Menjalankan aplikasi di mode pengembangan.
- `npm run build` - Membuat build produksi yang dioptimalkan di folder `dist`.
- `npm run lint` - Memeriksa kesalahan penulisan kode menggunakan ESLint.
- `npm run preview` - Menjalankan lokal web server untuk menguji hasil build produksi.
