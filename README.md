# Kondisi Dunia — Observatorium Alam

Website edukasi untuk melihat ringkasan kondisi alam dengan antarmuka berbahasa Indonesia. Project dibuat dengan HTML, CSS, dan JavaScript biasa agar mudah dipahami serta dapat dipublikasikan langsung di GitHub Pages.

## Fitur

- **Beranda:** hero visual Bumi, ringkasan cuaca, indeks kualitas udara, dan jumlah gempa dalam feed 24 jam.
- **Cuaca:** kondisi saat ini, perkiraan per jam, suhu tertinggi/terendah, angin, kelembapan, presipitasi, UV, serta pencarian lokasi.
- **Gempa bumi:** statistik feed 24 jam USGS, peta interaktif, dan tabel gempa yang dapat diurutkan.
- **Kualitas udara:** US AQI dan beberapa polutan yang tersedia dari model kualitas udara.
- **Peristiwa alam:** peristiwa terbuka yang tercatat di katalog NASA EONET dengan filter kategori.
- **Hutan:** penjelasan indikator dan tautan ke sumber asli Global Forest Watch, FAO, serta NASA FIRMS.
- **Sumber data:** dokumentasi dan batasan data agar model, katalog, dan laporan tidak dianggap sebagai jenis informasi yang sama.
- Tata letak responsif untuk ponsel dan desktop.

## Struktur folder

```text
kondisi-dunia/
├── index.html
├── cuaca.html
├── gempa.html
├── udara.html
├── peristiwa.html
├── hutan.html
├── sumber-data.html
├── style.css
├── assets/
│   └── earth-hero.webp
└── js/
    ├── config.js
    ├── api.js
    ├── ui.js
    ├── app.js
    ├── cuaca.js
    ├── gempa.js
    ├── udara.js
    ├── peristiwa.js
    └── hutan.js
```

## Menjalankan website

1. Ekstrak file ZIP.
2. Buka folder project di Visual Studio Code.
3. Jalankan `index.html` menggunakan ekstensi Live Server. Fitur API perlu koneksi internet.
4. Untuk GitHub Pages, unggah semua isi folder project ke root repository dan pilih branch/folder yang sesuai di menu **Settings → Pages**.
5. Tunggu hingga proses deployment selesai, lalu buka URL GitHub Pages yang diberikan GitHub.

**Penting:** file `style.css` berada langsung di root project dan digunakan oleh semua halaman. Jangan memindahkan file tersebut tanpa mengubah seluruh tag `<link rel="stylesheet">` di halaman HTML.

## Sumber data

- Cuaca: [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- Kualitas udara: [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
- Gempa: [USGS Earthquake Feeds](https://earthquake.usgs.gov/earthquakes/feed/)
- Peristiwa alam: [NASA EONET API v3](https://eonet.gsfc.nasa.gov/docs/v3)
- Hutan: [Global Forest Watch](https://www.globalforestwatch.org/), [FAO Global Forest Resources Assessment](https://www.fao.org/forest-resources-assessment/), dan [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/)
- Peta gempa: [OpenStreetMap](https://www.openstreetmap.org/copyright)

## Catatan dan keterbatasan

- Data cuaca dan kualitas udara merupakan hasil model. Nilainya bisa berbeda dengan pengukuran lokal.
- Feed gempa yang dipakai menampilkan katalog global USGS satu hari terakhir; untuk informasi keselamatan di Indonesia, periksa BMKG.
- Katalog peristiwa NASA EONET adalah metadata terkurasi. Status terbuka tidak otomatis membuktikan bahwa kejadian sedang berlangsung persis di waktu pengguna membuka halaman.
- Halaman hutan sengaja mengarahkan pembaca ke dataset resmi, bukan menampilkan angka tutupan hutan seolah-olah diperbarui real-time.
- API dan aset pihak ketiga perlu koneksi internet. Jika suatu server gagal, sebagian data dapat muncul sebagai `N/A` atau menampilkan pesan bahwa data belum tersedia.
