/* Pengaturan dasar website. Lokasi ini bisa diganti dari halaman Cuaca. */
window.KD_CONFIG = {
  appName: "Kondisi Dunia",
  defaultLocation: {
    name: "Majenang, Indonesia",
    latitude: -7.2975,
    longitude: 108.7642,
    timezone: "auto"
  },
  locationStorageKey: "kondisiDuniaLocation",
  refreshInterval: 5 * 60 * 1000,
  sources: {
    weather: "https://open-meteo.com/",
    earthquakes: "https://earthquake.usgs.gov/earthquakes/feed/",
    airQuality: "https://open-meteo.com/en/docs/air-quality-api",
    events: "https://eonet.gsfc.nasa.gov/"
  }
};
