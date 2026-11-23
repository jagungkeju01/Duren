/* Halaman Cuaca: pencarian lokasi, cuaca saat ini, dan prakiraan per jam. */
(function () {
  "use strict";
  const ui = window.KD_UI;
  const api = window.KD_API;
  let selectedLocation = ui.getLocation();

  async function loadWeather() {
    ui.hideError("weather-error");
    ui.setLocationLabel("weather-place-title", selectedLocation);
    const updated = document.getElementById("weather-updated");
    if (updated) updated.textContent = "Mengambil data dari model cuaca...";
    try {
      const data = await api.getWeather(selectedLocation);
      const current = data.current || {};
      const today = data.daily || {};
      document.getElementById("weather-condition").textContent = ui.weatherDescription(current.weather_code, current.is_day);
      document.getElementById("weather-temp").textContent = ui.formatNumber(current.temperature_2m, 1);
      document.getElementById("weather-feels").textContent = ui.formatNumber(current.apparent_temperature, 1);
      document.getElementById("weather-wind").textContent = ui.formatNumber(current.wind_speed_10m, 0);
      document.getElementById("weather-humidity").textContent = ui.formatNumber(current.relative_humidity_2m, 0) + "%";
      document.getElementById("weather-rain").textContent = ui.formatNumber(current.precipitation, 1);
      document.getElementById("weather-uv").textContent = ui.formatNumber(today.uv_index_max && today.uv_index_max[0], 1);
      document.getElementById("weather-max").textContent = ui.formatNumber(today.temperature_2m_max && today.temperature_2m_max[0], 1) + "°C";
      document.getElementById("weather-min").textContent = ui.formatNumber(today.temperature_2m_min && today.temperature_2m_min[0], 1) + "°C";
      document.getElementById("sunrise").textContent = ui.formatShortTime(today.sunrise && today.sunrise[0]);
      document.getElementById("sunset").textContent = ui.formatShortTime(today.sunset && today.sunset[0]);
      const icon = document.getElementById("weather-icon");
      icon.innerHTML = "<span class='weather-glyph' aria-hidden='true'>" + ui.escapeHTML(ui.weatherGlyph(current.weather_code, current.is_day)) + "</span>";
      renderHourly(data.hourly || {}, data.timezone, current.time);
      if (updated) updated.textContent = "Pembaruan model: " + ui.formatDateTime(current.time) + " · " + (data.timezone || "zona waktu lokal");
    } catch (error) {
      ui.showError("weather-error", "Data cuaca belum bisa dimuat. Periksa koneksi internet lalu muat ulang halaman. " + error.message);
      if (updated) updated.textContent = "Data belum tersedia";
      document.getElementById("hourly-list").innerHTML = "<div class='loading-line'>Prakiraan tidak tersedia untuk saat ini.</div>";
    }
  }

  function renderHourly(hourly, timezone, currentTime) {
    const list = document.getElementById("hourly-list");
    if (!hourly.time || !hourly.temperature_2m) {
      list.innerHTML = "<div class='loading-line'>Data prakiraan per jam tidak tersedia.</div>";
      return;
    }
    const targetTime = currentTime ? String(currentTime).slice(0, 16) : new Date().toISOString().slice(0, 16);
    let start = hourly.time.findIndex(function (time) { return String(time).slice(0, 16) >= targetTime; });
    if (start < 0) start = 0;
    const parts = [];
    for (let i = start; i < Math.min(start + 8, hourly.time.length); i++) {
      parts.push("<div class='hourly-item'><span class='hourly-time'>" + ui.escapeHTML(ui.formatShortTime(hourly.time[i])) + "</span>" +
        "<span class='hourly-glyph' aria-hidden='true'>" + ui.escapeHTML(ui.weatherGlyph(hourly.weather_code ? hourly.weather_code[i] : -1, true)) + "</span>" +
        "<strong class='hourly-temp'>" + ui.formatNumber(hourly.temperature_2m[i], 0) + "°</strong>" +
        "<span class='hourly-rain'>Hujan " + ui.formatNumber(hourly.precipitation_probability ? hourly.precipitation_probability[i] : null, 0) + "%</span></div>");
    }
    list.innerHTML = parts.join("");
  }

  async function searchLocation(event) {
    event.preventDefault();
    const input = document.getElementById("location-input");
    const results = document.getElementById("location-results");
    const query = input.value.trim();
    if (query.length < 2) return;
    results.innerHTML = "<div class='location-result'>Mencari lokasi...</div>";
    results.classList.add("open");
    try {
      const data = await api.searchLocations(query);
      const places = data.results || [];
      if (!places.length) {
        results.innerHTML = "<div class='location-result'>Lokasi tidak ditemukan. Coba nama kota lain.</div>";
        return;
      }
      results.innerHTML = places.map(function (place, index) {
        const label = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
        return "<button class='location-result' type='button' data-place='" + index + "'>" + ui.escapeHTML(label) + "<small>" + ui.formatNumber(place.latitude, 3) + ", " + ui.formatNumber(place.longitude, 3) + "</small></button>";
      }).join("");
      results.querySelectorAll("[data-place]").forEach(function (button) {
        button.addEventListener("click", function () {
          const place = places[Number(button.dataset.place)];
          selectedLocation = { name: [place.name, place.admin1, place.country].filter(Boolean).join(", "), latitude: place.latitude, longitude: place.longitude, timezone: place.timezone || "auto" };
          ui.saveLocation(selectedLocation);
          results.classList.remove("open");
          results.innerHTML = "";
          input.value = "";
          loadWeather();
        });
      });
    } catch (error) {
      results.innerHTML = "<div class='location-result'>Pencarian gagal. Periksa koneksi internet.</div>";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("location-form");
    if (form) form.addEventListener("submit", searchLocation);
    const results = document.getElementById("location-results");
    document.addEventListener("click", function (event) {
      if (results && !results.contains(event.target) && !event.target.closest("#location-form")) results.classList.remove("open");
    });
    loadWeather();
    window.setInterval(loadWeather, window.KD_CONFIG.refreshInterval);
  });
})();
