/* Halaman kualitas udara menggunakan model Open-Meteo Air Quality. */
(function () {
  "use strict";
  const ui = window.KD_UI;

  function classifyAQI(value) {
    if (value == null || !Number.isFinite(Number(value))) return { label: "Tidak tersedia", color: "#91a0b2", description: "Indeks belum tersedia untuk lokasi atau waktu ini." };
    const aqi = Number(value);
    if (aqi <= 50) return { label: "Baik", color: "#20ae83", description: "Kualitas udara relatif baik menurut skala US AQI. Tetap perhatikan informasi lokal." };
    if (aqi <= 100) return { label: "Sedang", color: "#e8bd38", description: "Kualitas udara dapat diterima, tetapi sebagian orang yang sangat sensitif mungkin merasakan dampak." };
    if (aqi <= 150) return { label: "Tidak sehat bagi kelompok sensitif", color: "#ec963b", description: "Kelompok sensitif sebaiknya memperhatikan gejala dan mempertimbangkan mengurangi paparan di luar ruangan." };
    if (aqi <= 200) return { label: "Tidak sehat", color: "#d54b52", description: "Sebagian orang dapat mulai merasakan dampak. Pertimbangkan membatasi aktivitas berat di luar ruangan." };
    if (aqi <= 300) return { label: "Sangat tidak sehat", color: "#9867bd", description: "Risiko kesehatan meningkat. Ikuti arahan kesehatan dan kualitas udara dari otoritas setempat." };
    return { label: "Berbahaya", color: "#873849", description: "Kondisi berisiko tinggi. Ikuti arahan resmi untuk mengurangi paparan." };
  }

  async function loadAirQuality() {
    ui.hideError("air-error");
    const location = ui.getLocation();
    ui.setLocationLabel("air-place-title", location);
    const updated = document.getElementById("air-updated");
    if (updated) updated.textContent = "Mengambil data model kualitas udara...";
    try {
      const data = await window.KD_API.getAirQuality(location);
      const current = data.current || {};
      const aqi = current.us_aqi;
      const classification = classifyAQI(aqi);
      document.getElementById("aqi-value").textContent = aqi == null ? "—" : ui.formatNumber(aqi, 0);
      document.getElementById("aqi-status").textContent = classification.label;
      document.getElementById("aqi-status").style.color = classification.color;
      document.getElementById("aqi-summary").textContent = classification.description;
      const marker = document.querySelector("#aqi-marker span");
      if (marker) marker.style.borderTopColor = classification.color;
      document.getElementById("pm25").textContent = ui.formatNumber(current.pm2_5, 1);
      document.getElementById("pm10").textContent = ui.formatNumber(current.pm10, 1);
      document.getElementById("ozone").textContent = ui.formatNumber(current.ozone, 1);
      document.getElementById("no2").textContent = ui.formatNumber(current.nitrogen_dioxide, 1);
      if (updated) updated.textContent = "Data model: " + ui.formatDateTime(current.time) + " · bukan pengukuran langsung di semua titik.";
    } catch (error) {
      ui.showError("air-error", "Data kualitas udara belum dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.");
      if (updated) updated.textContent = "Data belum tersedia.";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadAirQuality();
    window.setInterval(loadAirQuality, window.KD_CONFIG.refreshInterval);
  });
})();
