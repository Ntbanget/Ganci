# Ketentuan Desain — Ganci AR (Tema Photobooth)

## 1. Konsep Visual
Terinspirasi mesin fotobox jadul (photobooth). Kesan personal, hangat, nostalgic — bukan tampilan SaaS/dashboard yang kaku, meskipun ada bagian admin.

## 2. Palet Warna
- Warna dasar: cream / putih gading (background utama, terasa seperti kertas foto)
- Aksen utama: merah-oranye (ala tombol "flash" kamera) — dipakai untuk tombol CTA, highlight teks penting
- Teks: hitam / coklat tua
- Boleh eksplorasi varian pastel yang lebih lembut selama tetap dalam nuansa "film/kertas foto", bukan warna digital yang terlalu cerah/flat

## 3. Tipografi
- Font judul & aksen: handwritten/retro casual (kesan tulisan tangan di pinggir foto polaroid)
  - Gunakan font gratis dari Google Fonts, contoh: **Caveat** atau **Kalam** — jangan pakai font berbayar/berlisensi
- Font isi/body: sans-serif bersih dan mudah dibaca
- Hindari kombinasi lebih dari 2 jenis font dalam satu halaman

## 4. Elemen Dekoratif Khas Photobooth
- Bingkai polaroid: border putih tebal di sekeliling foto
- Film strip: garis-garis vertikal dengan lubang di pinggir (dekorasi, bukan elemen fungsional)
- Efek washi tape / selotip kertas di sudut-sudut foto/kartu
- Elemen sedikit di-*tilt*/dirotasi (foto, kartu, sticker) agar terasa "ditempel manual", bukan grid sempurna
- Ikon: kamera, film, flash — gaya line-art sederhana, bukan ikon flat generik
- Tekstur kertas/film halus di background (opsional, jangan sampai ganggu keterbacaan teks)

## 5. Prinsip Layout
- **Mobile-first** — mayoritas halaman dibuka lewat kamera HP, desktop hanya prioritas sekunder
- Spacing longgar, jangan padat — kesan "santai", bukan formulir birokrasi
- Tombol CTA besar dan jelas, warna aksen mencolok (merah-oranye), teks singkat dan actionable (contoh: "PESAN SEKARANG", "BUKA KAMERA")

## 6. Ketentuan per Halaman

### Landing Page (`/`)
- Hero section dengan headline playful + tagline singkat
- Visual preview: contoh ganci dengan foto yang terkesan "bisa discan" (ada elemen "SCAN ME" kecil di foto)
- Section "Cara Kerja" — 4 langkah singkat dengan ikon, angka urut
- Section "Cara Pesan" — alur ke WhatsApp, JELAS bahwa transaksi terjadi di luar website
- Footer dengan kontak (WhatsApp, Instagram, TikTok) dan tagline penutup

### Halaman Scan AR (`/[slug]`)
- Tampilan minim distraksi — fokus penuh ke kamera & instruksi
- Frame viewfinder di layar kamera (sudut-sudut seperti bingkai fokus, bisa tambah garis scan sebagai indikator)
- Instruksi singkat & jelas: "Pastikan foto berada di dalam bingkai"
- Tombol besar "Buka Kamera / Mulai Scan"
- Sediakan opsi bantuan "Cara Scan?" untuk pengguna awam
- WAJIB ada fallback pesan untuk kamera tidak bisa diakses: sarankan buka via Chrome (Android) / Safari (iPhone), hindari in-app browser WhatsApp/Instagram
- WAJIB ada tombol alternatif "Tonton videonya di sini" untuk kondisi AR gagal terdeteksi

### Halaman Login (`/login`)
- Tetap nuansa photobooth tapi lebih sederhana dari landing page
- Form email + password saja, tidak perlu elemen dekoratif berlebihan yang mengganggu fungsi

### Halaman Admin (`/admin`)
- Nuansa photobooth tetap terasa (warna, font judul) tapi fungsional dan rapi — JANGAN terlalu ramai dekorasi di area form
- Form "Tambah Pesanan Baru": input nama (opsional), area upload foto (drag & drop, terima JPG/PNG), area upload video (drag & drop, keterangan jelas "Maks 30 detik")
- Tampilkan preview kecil foto & video setelah upload, termasuk durasi video
- Tombol simpan besar dan jelas: "Simpan & Generate Slug"
- Tabel daftar pesanan: kolom preview, nama, slug, status (dengan badge warna berbeda per status), QR code, aksi
- Untuk layar HP kecil, tabel ini harus tetap bisa dibaca — ubah jadi tampilan card per-baris jika perlu, bukan dipaksa scroll horizontal sempit

## 7. Yang Harus Dihindari
- Jangan pakai stok foto/ikon berbayar atau berlisensi tidak jelas — semua aset harus gratis
- Jangan buat halaman admin terkesan "publik"/terbuka — harus jelas kalau itu area terproteksi (ada indikator login/logout)
- Jangan gunakan istilah atau elemen UI yang menyiratkan ada transaksi/pembayaran di dalam website
- Jangan biarkan dekorasi (washi tape, film strip, tilt effect) mengorbankan keterbacaan teks atau fungsi tombol
