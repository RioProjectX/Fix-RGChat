# KopelChat 💖 - Aplikasi Obrolan & Pelacak Lokasi Pasangan Privat

**KopelChat** adalah aplikasi web interaktif, privat, dan serba guna yang dirancang khusus untuk pasangan (kamu dan pacarmu). Dilengkapi dengan fitur obrolan privat mirip WhatsApp, pelacakan lokasi real-time (*live location*), notifikasi latar belakang saat ada pesan masuk, serta dukungan PWA (Progressive Web App) yang dapat diinstall di HP (Android/iOS) maupun Laptop/Desktop PC.

---

## ✨ Fitur Unggulan KopelChat

### 1. 💬 Obrolan Privat & Media Gallery
- **Pesan Real-Time**: Kirim pesan teks, emoji, foto, video, hingga pesan suara (*voice note*).
- **Notifikasi Latar Belakang**: Menerima notifikasi pesan masuk dari pasangan langsung di layar HP atau desktop meskipun aplikasi tidak sedang aktif dibuka.
- **Unggah Media & Kamera**: Ambil foto langsung dari kamera atau unggah foto/video dari penyimpanan perangkat.
- **Galeri & Pesan Bintang**: Simpan kenangan foto manis dan tandai pesan favorit (*starred messages*).

### 2. 📍 Pelacak Lokasi & Notifikasi "Sudah Sampai"
- **Live Location Tracking**: Pantau lokasi pacar secara real-time di peta interaktif lengkap dengan penunjuk kecepatan dan status baterai.
- **Zona Aman (Geofencing)**: Notifikasi otomatis saat pasangan tiba atau meninggalkan rumah/tempat kerja.
- **Status Perjalanan**: Ketahui apakah pacar sedang di jalan, di rumah, atau di tempat kerja.

### 3. 📱 Siap Dipasang di HP & Desktop (PWA)
- **Install sebagai Aplikasi Native**: Dapatkan ikon aplikasi langsung di layar utama HP (Android / iOS) atau desktop tanpa perlu mengunduh APK dari Play Store.
- **Dukungan Offline & Service Worker**: Akses cepat dengan integrasi Service Worker modern (`sw.js`).

### 4. 🔒 Keamanan & Fitur Spesial Pasangan
- **Kunci Keamanan PIN**: Lindungi kerahasiaan obrolan dengan 4 digit kode PIN.
- **Love Counter & Jurnal Kenangan**: Catat tanggal jadian, hitung hari kebersamaan, dan abadikan momen berharga bersama.
- **Status Mood & Tema Custom**: Ubah status perasaanmu dan pilih warna tema favorit untuk tampilan obrolan.

---

## 🚀 Siap Deploy di Vercel

Aplikasi ini sudah dikonfigurasi dan siap untuk di-deploy ke **Vercel** hanya dalam beberapa langkah:

1. **Push Repository** ini ke akun GitHub Anda.
2. Buka dashboard [Vercel](https://vercel.com) dan pilih **Import Project**.
3. Vercel akan otomatis membaca konfigurasi `vercel.json` dan folder `/api`.
4. Klik **Deploy** dan aplikasi pasanganmu sudah bisa diakses online 24/7!

---

## 💻 Cara Install Aplikasi ke HP / Desktop (PWA)

- **Android (Chrome/Edge)**: Ketuk menu titik tiga **(⋮)** di sudut kanan atas browser > pilih **"Tambahkan ke Layar Utama"** / **"Install Aplikasi"**.
- **iPhone / iOS (Safari)**: Buka web di browser **Safari** > ketuk ikon **Bagikan (Share 📤)** di bagian bawah > pilih **"Tambah ke Layar Utama" (Add to Home Screen)**.
- **Desktop / Laptop PC**: Klik tombol **Install** di sebelah kanan bilah alamat URL (*address bar*) browser Chrome / Edge.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Motion (Framer Motion).
- **Backend & API**: Node.js, Express.js (Serverless Ready via `/api/index.ts`).
- **PWA & Notifikasi**: Service Worker API, Web Push & System Notification API.

---

## ❤️ Dibuat Oleh

**Dibuat oleh RioProjectX** dengan cinta untuk memudahkan komunikasi, menjaga keamanan, dan mempererat hubungan bersama pasangan tercinta! 💖
