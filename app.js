/* Menyiapkan ringkasan data di halaman beranda. */
(function () {
  "use strict";
  const ui = window.KD_UI;
  const api = window.KD_API;

  async function loadHomeSnapshot() {
    const location = ui.getLocation();
    ui.setLocationLabel("home-location", location);
    const temp = document.getElementById("home-temp");
    const quake = document.getElementById("home-quakes");
    const aqi = document.getElementById("home-aqi");
    const time = document.getElementById("last-updated");
    const aqiNote = document.getElementById("home-aqi-note");

    const weatherTask = api.getWeather(location).then(function (data) {
      if (data.current && temp) temp.textContent = ui.formatNumber(data.current.temperature_2m, 1) + "°C";
    }).catch(function () {
      if (temp) temp.textContent = "N/A";
      const note = document.getElementById("home-location");
      if (note) note.textContent = "Data cuaca belum tersedia";
    });

    const quakeTask = api.getEarthquakes().then(function (data) {
      if (quake) quake.textContent = ui.formatNumber((data.features || []).length, 0);
    }).catch(function () {
      if (quake) quake.textContent = "N/A";
      const note = document.getElementById("home-quake-note");
      if (note) note.textContent = "Feed tidak dapat dimuat";
    });

    const airTask = api.getAirQuality(location).then(function (data) {
      const current = data.current || {};
      if (aqi) aqi.textContent = current.us_aqi == null ? "—" : ui.formatNumber(current.us_aqi, 0);
      if (aqiNote) aqiNote.textContent = current.us_aqi == null ? "Indeks belum tersedia" : "US AQI · model kualitas udara";
    }).catch(function () {
      if (aqi) aqi.textContent = "N/A";
      if (aqiNote) aqiNote.textContent = "Data indeks tidak tersedia";
    });

    await Promise.allSettled([weatherTask, quakeTask, airTask]);
    if (time) time.textContent = "Diperbarui " + new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    const clock = document.getElementById("hero-clock");
    if (clock) clock.textContent = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadHomeSnapshot();
    window.setInterval(loadHomeSnapshot, window.KD_CONFIG.refreshInterval);
  });
})();
