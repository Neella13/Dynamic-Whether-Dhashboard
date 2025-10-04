const apiKey ="73244345ef9f3176a2f85b3bdaeed02e";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityNameEl = document.getElementById("cityName");
const descEl = document.getElementById("description");
const tempEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("windSpeed");
const iconEl = document.getElementById("weatherIcon");
const spinnerEl = document.getElementById("spinner");
const forecastEl = document.getElementById("forecast");
const bodyEl = document.body;

function showSpinner() { spinnerEl.style.display = "block"; }
function hideSpinner() { spinnerEl.style.display = "none"; }

function showMessage(msg) {
  cityNameEl.textContent = msg;
  descEl.textContent = "--";
  tempEl.textContent = "--";
  humidityEl.textContent = "--";
  windEl.textContent = "--";
  iconEl.src = "";
  forecastEl.innerHTML = "";
  setBodyBackground("default");
}

function setBodyBackground(weather) {
  let gradient = "";
  switch (weather.toLowerCase()) {
    case "clear": gradient = "linear-gradient(135deg, #f7b733, #fc4a1a)"; break;
    case "clouds": gradient = "linear-gradient(135deg, #74ABE2, #5563DE)"; break;
    case "rain": case "drizzle": gradient = "linear-gradient(135deg, #00c6ff, #0072ff)"; break;
    case "thunderstorm": gradient = "linear-gradient(135deg, #373B44, #4286f4)"; break;
    case "snow": gradient = "linear-gradient(135deg, #83a4d4, #b6fbff)"; break;
    case "mist": case "fog": gradient = "linear-gradient(135deg, #757F9A, #D7DDE8)"; break;
    case "default": gradient = "linear-gradient(135deg, #ff9966, #ff5e62)"; break; // nice default
    default: gradient = "linear-gradient(135deg, #74ABE2, #5563DE)"; break;
  }
  bodyEl.style.background = gradient;
}

setBodyBackground("default");

function updateWeatherUI(data) {
  if (!data || !data.main) { showMessage("Error loading data"); return; }

  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  descEl.textContent = data.weather[0].description;
  tempEl.textContent = Math.round(data.main.temp);
  humidityEl.textContent = data.main.humidity;
  windEl.textContent = data.wind.speed;
  const iconCode = data.weather[0].icon;
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  setBodyBackground(data.weather[0].main);
  fetchForecast(data.coord.lat, data.coord.lon);
}

async function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    forecastEl.innerHTML = "";
    for (let i = 0; i < data.list.length; i += 8) {
      const item = data.list[i];
      const date = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
      const temp = Math.round(item.main.temp);
      const desc = item.weather[0].main;
      const icon = item.weather[0].icon;
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
        <p>${temp}°C</p>
        <p style="font-size:10px;">${desc}</p>
      `;
      forecastEl.appendChild(card);
    }
  } catch (err) { console.error("Forecast fetch error:", err); }
}

async function getWeatherByCity(city) {
  if (!city) { showMessage("Please enter a city name"); return; }
  showMessage(""); showSpinner();

  const url =`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    hideSpinner();
    if (res.status === 401) { showMessage("Invalid API key ❌"); return; }
    else if (res.status === 404) { showMessage("City not found 🌍"); return; }
    updateWeatherUI(data);
  } catch (err) { console.error("Fetch error:", err); hideSpinner(); showMessage("Network error ⚠"); }
}

function getWeatherByLocation() {
  if (!navigator.geolocation) { showMessage("Geolocation not supported"); return; }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    showMessage(""); showSpinner();

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      hideSpinner();
      if (res.status === 401) { showMessage("Invalid API key ❌"); return; }
      updateWeatherUI(data);
    } catch (err) { console.error("Location fetch error:", err); hideSpinner(); showMessage("Location error ⚠"); }
  });
}

searchBtn.addEventListener("click", () => getWeatherByCity(cityInput.value.trim()));
locationBtn.addEventListener("click", getWeatherByLocation);