/* Utilitas antarmuka umum: navigasi ponsel, format angka, lokasi, dan pesan. */
(function () {
  "use strict";

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function getLocation() {
    const fallback = window.KD_CONFIG.defaultLocation;
    try {
      const saved = localStorage.getItem(window.KD_CONFIG.locationStorageKey);
      if (!saved) return Object.assign({}, fallback);
      const location = JSON.parse(saved);
      if (typeof location.latitude !== "number" || typeof location.longitude !== "number") return Object.assign({}, fallback);
      return Object.assign({}, fallback, location);
    } catch (error) {
      return Object.assign({}, fallback);
    }
  }

  function saveLocation(location) {
    try {
      localStorage.setItem(window.KD_CONFIG.locationStorageKey, JSON.stringify(location));
    } catch (error) {
      // Lokasi tetap bisa dipakai untuk sesi saat ini meski penyimpanan browser tidak tersedia.
    }
  }

  function formatNumber(value, digits) {
    if (value == null || !Number.isFinite(Number(value))) return "—";
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits == null ? 1 : digits }).format(Number(value));
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function formatShortTime(value) {
    if (!value) return "—";
    const parts = String(value).split("T");
    return parts.length > 1 ? parts[1].slice(0, 5) : String(value).slice(0, 5);
  }

  function formatDate(value) {
    if (!value) return "Tanggal tidak tersedia";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function weatherDescription(code, isDay) {
    const descriptions = {
      0: "Cerah", 1: "Cerah berawan", 2: "Cerah berawan", 3: "Berawan",
      45: "Kabut", 48: "Kabut beku", 51: "Gerimis ringan", 53: "Gerimis",
      55: "Gerimis lebat", 56: "Gerimis beku ringan", 57: "Gerimis beku lebat",
      61: "Hujan ringan", 63: "Hujan", 65: "Hujan lebat", 66: "Hujan beku ringan",
      67: "Hujan beku lebat", 71: "Salju ringan", 73: "Salju", 75: "Salju lebat",
      77: "Butiran salju", 80: "Hujan lokal ringan", 81: "Hujan lokal", 82: "Hujan lokal lebat",
      85: "Hujan salju ringan", 86: "Hujan salju lebat", 95: "Badai petir",
      96: "Badai petir dengan hujan es", 99: "Badai petir dengan hujan es lebat"
    };
    if (code === 0 && !isDay) return "Cerah malam";
    return descriptions[code] || "Kondisi cuaca bervariasi";
  }

  function weatherGlyph(code, isDay) {
    if (code === 0) return isDay ? "☀" : "☾";
    if (code === 1 || code === 2) return isDay ? "◒" : "☾";
    if (code === 3 || code === 45 || code === 48) return "☁";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "☂";
    if ([95, 96, 99].includes(code)) return "ϟ";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄";
    return "◌";
  }

  function showError(id, message) {
    const box = document.getElementById(id);
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
  }

  function hideError(id) {
    const box = document.getElementById(id);
    if (box) box.hidden = true;
  }

  function initNavigation() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.getElementById("main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("menu-open", open && window.matchMedia("(max-width: 900px)").matches);
      });
      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("menu-open");
        });
      });
    }
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function setLocationLabel(id, location) {
    const element = document.getElementById(id);
    if (element) element.textContent = location.name || "Lokasi terpilih";
  }

  document.addEventListener("DOMContentLoaded", initNavigation);
  window.KD_UI = { escapeHTML, getLocation, saveLocation, formatNumber, formatDateTime, formatShortTime, formatDate, weatherDescription, weatherGlyph, showError, hideError, setLocationLabel };
})();
