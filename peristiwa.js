/* Halaman daftar peristiwa alam dari katalog NASA EONET. */
(function () {
  "use strict";
  const ui = window.KD_UI;
  let events = [];
  let activeFilter = "all";

  const categoryNames = {
    wildfires: "Kebakaran hutan",
    severeStorms: "Badai",
    floods: "Banjir",
    landslides: "Longsor",
    volcanoes: "Gunung api",
    dustHaze: "Debu dan kabut asap",
    seaLakeIce: "Es laut dan danau"
  };

  function categoryOf(event) {
    const categories = event.categories || [];
    return categories.length ? categories[0].id : "other";
  }

  function locationOf(event) {
    const geometry = event.geometry || [];
    if (!geometry.length) return "Lokasi belum tercantum";
    const coordinates = geometry[geometry.length - 1].coordinates;
    if (!Array.isArray(coordinates)) return "Lokasi pada sumber";
    if (typeof coordinates[0] === "number") return ui.formatNumber(coordinates[1], 2) + "°, " + ui.formatNumber(coordinates[0], 2) + "°";
    return "Wilayah terpetakan pada sumber NASA";
  }

  function linkOf(event) {
    if (event.sources && event.sources.length && /^https:\/\//i.test(event.sources[0].url || "")) return event.sources[0].url;
    if (event.link && /^https:\/\//i.test(event.link)) return event.link;
    return "https://eonet.gsfc.nasa.gov/";
  }

  function eventDate(event) {
    const geometry = event.geometry || [];
    return geometry.length ? geometry[geometry.length - 1].date : null;
  }

  function renderEvents() {
    const grid = document.getElementById("events-grid");
    let filtered = events;
    if (activeFilter !== "all") {
      filtered = events.filter(function (event) {
        return (event.categories || []).some(function (category) { return category.id === activeFilter; });
      });
    }
    document.getElementById("events-count").textContent = ui.formatNumber(filtered.length, 0);
    if (!filtered.length) {
      grid.innerHTML = "<div class='loading-card'>Tidak ada entri yang cocok dengan filter ini di hasil katalog saat ini. Pilih “Semua” atau kunjungi NASA EONET.</div>";
      return;
    }
    grid.innerHTML = filtered.slice(0, 30).map(function (event) {
      const categoryId = categoryOf(event);
      const category = categoryNames[categoryId] || (event.categories && event.categories[0] ? event.categories[0].title : "Peristiwa alam");
      const title = event.title || "Peristiwa alam tanpa judul";
      const date = eventDate(event);
      const description = event.description || "Katalog menyediakan metadata dan tautan sumber untuk peristiwa ini.";
      const link = linkOf(event);
      return "<article class='event-card'><div class='event-card-top'><span class='event-kind'><i class='event-kind-dot'></i>" + ui.escapeHTML(category) + "</span><span class='event-date'>" + ui.escapeHTML(ui.formatDate(date)) + "</span></div>" +
        "<h3>" + ui.escapeHTML(title) + "</h3><p class='event-desc'>" + ui.escapeHTML(description) + "</p>" +
        "<div class='event-location'><span>⌖</span> " + ui.escapeHTML(locationOf(event)) + "</div>" +
        "<div class='event-card-footer'><span>NASA EONET · STATUS TERBUKA</span><a href='" + ui.escapeHTML(link) + "' target='_blank' rel='noreferrer'>Sumber kejadian ↗</a></div></article>";
    }).join("");
  }

  async function loadEvents() {
    ui.hideError("events-error");
    try {
      const data = await window.KD_API.getNaturalEvents();
      events = (data.events || []).slice().sort(function (a, b) {
        return new Date(eventDate(b) || 0) - new Date(eventDate(a) || 0);
      });
      document.getElementById("events-updated").textContent = "Katalog diambil pada " + new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date()) + ".";
      renderEvents();
    } catch (error) {
      ui.showError("events-error", "Katalog NASA EONET belum dapat diakses. Periksa koneksi internet atau buka situs sumber secara langsung.");
      document.getElementById("events-updated").textContent = "Data belum tersedia.";
      document.getElementById("events-grid").innerHTML = "<div class='loading-card'>Data peristiwa belum dapat dimuat. Kamu tetap bisa membuka katalog resmi NASA EONET.</div>";
      document.getElementById("events-count").textContent = "—";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach(function (item) { item.classList.toggle("active", item === button); });
        renderEvents();
      });
    });
    loadEvents();
    window.setInterval(loadEvents, window.KD_CONFIG.refreshInterval);
  });
})();
