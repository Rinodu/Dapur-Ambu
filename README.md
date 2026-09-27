# Dapur Ambu — Landing Mockup

Situs Dapur Ambu, Legok: pink dengan aksen krem dan cokelat, tiga kue mengambang, animasi sambutan, katalog produk, cara pesan, formulir, dan lokasi.

Buka `index.html` di browser untuk melihatnya. Foto, nama produk, harga, dan alamat pada katalog diambil dari repo [dapur-ambu-website](https://github.com/Rinodu/dapur-ambu-website).

Form di `order.html` mengirim pesanan ke Google Apps Script yang mencatatnya pada spreadsheet Database Pesanan, lalu membuka WhatsApp secara langsung dengan ringkasan pesanan. Jika jaringan gagal, pelanggan tetap di formulir dan dapat mencoba lagi. Harga dan jadwal berlaku setelah dikonfirmasi Ambu. Jalankan `node test-order.mjs` untuk memeriksa alur formulir dan `node test-intro.mjs` untuk memeriksa alur kembali ke beranda.

Foto kue diambil dari Instagram resmi [@dapurambu86](https://www.instagram.com/dapurambu86/) dengan izin penggunaan yang dikonfirmasi pemilik proyek. Gambar dipotong dan dipoles menggunakan ImageGen untuk menghasilkan latar transparan. Sumber tiap foto ada di [ASSET-SOURCES.md](ASSET-SOURCES.md).


