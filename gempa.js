/* Halaman gempa: peta Leaflet, statistik ringkas, dan tabel kejadian. */
(function () {
  "use strict";
  const ui = window.KD_UI;
  let features = [];
  let map = null;
  let markerLayer = null;

  function magnitudeClass(magnitude) {
    return Number(magnitude) >= 4.5 ? "magnitude-chip mag-high" : "magnitude-chip";
  }

  function safePlace(feature) {
    return feature && feature.properties && feature.properties.place ? feature.properties.place : "Lokasi tidak diketahui";
  }

  function renderTable() {
    const body = document.getElementById("quake-table-body");
    const sort = document.getElementById("quake-sort").value;
    const sorted = features.slice().sort(function (a, b) {
      if (sort === "magnitude") return (b.properties.mag || 0) - (a.properties.mag || 0);
      return (b.properties.time || 0) - (a.properties.time || 0);
    });
    if (!sorted.length) {
      body.innerHTML = "<tr><td colspan='5' class='table-empty'>Tidak ada kejadian dalam feed saat ini.</td></tr>";
      return;
    }
    body.innerHTML = sorted.slice(0, 14).map(function (feature) {
      const properties = feature.properties || {};
      const coordinates = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates : [];
      const depth = coordinates.length > 2 ? coordinates[2] : null;
      const magnitude = properties.mag == null ? "—" : ui.formatNumber(properties.mag, 1);
      const time = properties.time ? ui.formatDateTime(properties.time) : "—";
      const link = /^https:\/\//i.test(properties.url || "") ? properties.url : "https://earthquake.usgs.gov/earthquakes/feed/";
      return "<tr><td><span class='" + magnitudeClass(properties.mag) + "'>" + magnitude + "</span></td>" +
        "<td>" + ui.escapeHTML(safePlace(feature)) + "</td>" +
        "<td>" + ui.formatNumber(depth, 1) + " km</td>" +
        "<td>" + ui.escapeHTML(time) + "</td>" +
        "<td><a class='table-source-link' href='" + ui.escapeHTML(link) + "' target='_blank' rel='noreferrer'>USGS ↗</a></td></tr>";
    }).join("");
  }

  function updateMap() {
    const mapContainer = document.getElementById("quake-map");
    if (!window.L || !mapContainer) {
      mapContainer.innerHTML = "<div class='map-placeholder'>Peta interaktif perlu koneksi ke layanan peta. Daftar gempa tetap dapat dibaca di bawah.</div>";
      return;
    }
    if (!map) {
      mapContainer.innerHTML = "";
      map = window.L.map(mapContainer, { scrollWheelZoom: false }).setView([12, 0], 2);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 10,
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
      }).addTo(map);
      markerLayer = window.L.layerGroup().addTo(map);
    }
    markerLayer.clearLayers();
    features.forEach(function (feature) {
      const geometry = feature.geometry;
      const properties = feature.properties || {};
      if (!geometry || !geometry.coordinates || geometry.coordinates.length < 2) return;
      const longitude = geometry.coordinates[0];
      const latitude = geometry.coordinates[1];
      const depth = geometry.coordinates[2];
      const magnitude = Number(properties.mag || 0);
      const color = magnitude >= 5 ? "#d84e57" : magnitude >= 3 ? "#347fe0" : "#6a9dd9";
      const marker = window.L.circleMarker([latitude, longitude], {
        radius: Math.max(4, Math.min(13, 3 + magnitude * 1.45)),
        color: color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.72
      });
      marker.bindPopup("<strong>M " + ui.escapeHTML(ui.formatNumber(magnitude, 1)) + "</strong><br>" + ui.escapeHTML(safePlace(feature)) + "<br>Kedalaman: " + ui.escapeHTML(ui.formatNumber(depth, 1)) + " km<br>" + ui.escapeHTML(ui.formatDateTime(properties.time)));
      marker.addTo(markerLayer);
    });
    window.setTimeout(function () { if (map) map.invalidateSize(); }, 100);
  }

  async function loadEarthquakes() {
    ui.hideError("quake-error");
    try {
      const data = await window.KD_API.getEarthquakes();
      features = (data.features || []).filter(function (feature) {
        return feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates.length >= 2;
      });
      const strongest = features.reduce(function (best, feature) {
        if (!best || (feature.properties.mag || 0) > (best.properties.mag || 0)) return feature;
        return best;
      }, null);
      document.getElementById("quake-total").textContent = ui.formatNumber(features.length, 0);
      document.getElementById("quake-largest").textContent = strongest && strongest.properties.mag != null ? ui.formatNumber(strongest.properties.mag, 1) : "—";
      document.getElementById("quake-largest-place").textContent = strongest ? safePlace(strongest) : "Belum ada data";
      document.getElementById("quake-strong-count").textContent = ui.formatNumber(features.filter(function (feature) { return Number(feature.properties.mag) >= 4.5; }).length, 0);
      document.getElementById("quake-updated").textContent = "Feed terakhir diambil " + new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date()) + ".";
      renderTable();
      updateMap();
    } catch (error) {
      ui.showError("quake-error", "Feed gempa USGS belum dapat diakses. Periksa koneksi internet lalu muat ulang halaman.");
      document.getElementById("quake-updated").textContent = "Data belum tersedia.";
      document.getElementById("quake-table-body").innerHTML = "<tr><td colspan='5' class='table-empty'>Feed belum dapat dimuat.</td></tr>";
      document.getElementById("quake-map").innerHTML = "<div class='map-placeholder'>Peta belum tersedia.</div>";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("quake-sort").addEventListener("change", renderTable);
    loadEarthquakes();
    window.setInterval(loadEarthquakes, window.KD_CONFIG.refreshInterval);
  });
})();
