/* Semua permintaan API disimpan di sini agar mudah ditelusuri. */
(function () {
  "use strict";

  async function getJSON(url) {
    const response = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!response.ok) {
      throw new Error("Server mengembalikan status " + response.status);
    }
    return response.json();
  }

  function weatherURL(location) {
    const params = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,wind_speed_10m,wind_direction_10m",
      hourly: "temperature_2m,precipitation_probability,weather_code",
      daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max",
      forecast_days: "2",
      timezone: location.timezone || "auto"
    });
    return "https://api.open-meteo.com/v1/forecast?" + params.toString();
  }

  function airQualityURL(location) {
    const params = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      current: "us_aqi,european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide",
      hourly: "us_aqi,pm2_5,pm10",
      timezone: location.timezone || "auto"
    });
    return "https://air-quality-api.open-meteo.com/v1/air-quality?" + params.toString();
  }

  function getWeather(location) {
    return getJSON(weatherURL(location));
  }

  function getAirQuality(location) {
    return getJSON(airQualityURL(location));
  }

  function getEarthquakes() {
    return getJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
  }

  function getNaturalEvents() {
    const url = "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires,severeStorms,floods,landslides&status=open&limit=60";
    return getJSON(url);
  }

  function searchLocations(name) {
    const params = new URLSearchParams({ name: name, count: "8", language: "id", format: "json" });
    return getJSON("https://geocoding-api.open-meteo.com/v1/search?" + params.toString());
  }

  window.KD_API = { getJSON, getWeather, getAirQuality, getEarthquakes, getNaturalEvents, searchLocations };
})();
