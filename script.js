const apiKey = "0372b2139287ead3f793a114a254c17f";
let isCelsius = true;
const searchHistory = [];

const elements = {
  cityInput: document.getElementById("city-input"),
  getWeatherBtn: document.getElementById("get-weather-btn"),
  toggleUnits: document.getElementById("toggle-units"),
  useLocation: document.getElementById("use-location"),
  weatherDisplay: document.getElementById("weather-display"),
  forecast: document.getElementById("forecast"),
  forecastCards: document.getElementById("forecast-cards"),
  cityName: document.getElementById("city-name"),
  temp: document.getElementById("temp"),
  feelsLike: document.getElementById("feels-like"),
  conditions: document.getElementById("conditions"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  icon: document.getElementById("weather-icon"),
  alertBox: document.getElementById("alert-box"),
  searchHistory: document.getElementById("search-history"),
  quiz: {
    container: document.getElementById("quiz-container"),
    question: document.getElementById("question"),
    options: document.getElementById("options"),
    nextBtn: document.getElementById("next-btn"),
    score: document.getElementById("score"),
    scoreVal: document.getElementById("score-val"),
    totalVal: document.getElementById("total-val")
  }
};

// ---------------- Weather Functions ----------------
function kelvinToCelsius(k) {
  return (k - 273.15).toFixed(1);
}

function kelvinToFahrenheit(k) {
  return ((k - 273.15) * 9 / 5 + 32).toFixed(1);
}

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString();
}

function updateUnitsLabel() {
  elements.toggleUnits.innerText = isCelsius ? "Switch to °F" : "Switch to °C";
}

function saveToHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    const btn = document.createElement("button");
    btn.innerText = city;
    btn.onclick = () => {
      elements.cityInput.value = city;
      getWeather(city);
    };
    elements.searchHistory.appendChild(btn);
  }
}

function setBackground(condition, timestamp) {
  const hour = new Date(timestamp * 1000).getHours();
  let bg = "#ffffff";
  if (condition.includes("rain")) bg = "#a0c4ff";
  else if (condition.includes("cloud")) bg = "#cfd8dc";
  else if (condition.includes("clear")) bg = hour >= 6 && hour < 18 ? "#ffe082" : "#37474f";
  document.body.style.background = bg;
}

async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    const temp = isCelsius ? kelvinToCelsius(data.main.temp) : kelvinToFahrenheit(data.main.temp);
    const feels = isCelsius ? kelvinToCelsius(data.main.feels_like) : kelvinToFahrenheit(data.main.feels_like);

    elements.cityName.innerText = `${data.name}, ${data.sys.country}`;
    elements.temp.innerText = `${temp} °${isCelsius ? "C" : "F"}`;
    elements.feelsLike.innerText = `${feels} °${isCelsius ? "C" : "F"}`;
    elements.conditions.innerText = data.weather[0].description;
    elements.humidity.innerText = data.main.humidity;
    elements.wind.innerText = data.wind.speed;
    elements.sunrise.innerText = formatTime(data.sys.sunrise);
    elements.sunset.innerText = formatTime(data.sys.sunset);
    elements.icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    elements.icon.alt = data.weather[0].description;

    elements.weatherDisplay.classList.remove("hidden");
    saveToHistory(city);
    setBackground(data.weather[0].main.toLowerCase(), data.dt);
    fetchForecast(city);
    fetchAlerts(data.coord.lat, data.coord.lon);
  } catch (err) {
    alert(err.message);
  }
}

async function fetchForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const days = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!days[date]) days[date] = item;
    });
    elements.forecastCards.innerHTML = "";
    Object.values(days).slice(0, 5).forEach(day => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <h4>${day.dt_txt.split(" ")[0]}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" />
        <p>${isCelsius ? kelvinToCelsius(day.main.temp) : kelvinToFahrenheit(day.main.temp)}°</p>
      `;
      elements.forecastCards.appendChild(card);
    });
    elements.forecast.classList.remove("hidden");
  } catch (err) {
    console.error("Forecast error", err);
  }
}

async function fetchAlerts(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.alerts && data.alerts.length > 0) {
    elements.alertBox.innerText = data.alerts[0].description;
    elements.alertBox.style.display = "block";
  } else {
    elements.alertBox.style.display = "none";
  }
}

// ---------------- Quiz Logic ----------------
const quizQuestions = [
  { q: "What is the capital of France?", options: ["Paris", "Rome", "Berlin", "Madrid"], answer: 0 },
  { q: "What planet is known as the Red Planet?", options: ["Earth", "Venus", "Mars", "Jupiter"], answer: 2 },
  { q: "Which gas do plants absorb?", options: ["Oxygen", "Hydrogen", "Nitrogen", "Carbon Dioxide"], answer: 3 },
  { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
  { q: "What is H2O?", options: ["Helium", "Water", "Hydrogen", "Oxygen"], answer: 1 },
  { q: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
  { q: "How many legs does a spider have?", options: ["6", "8", "10", "12"], answer: 1 },
  { q: "What color do you get by mixing red and white?", options: ["Pink", "Purple", "Orange", "Brown"], answer: 0 },
  { q: "Who invented the light bulb?", options: ["Einstein", "Edison", "Newton", "Tesla"], answer: 1 },
  { q: "Which country has the most population?", options: ["USA", "India", "China", "Russia"], answer: 2 }
];

let currentQuestion = 0;
let score = 0;

function showQuestion() {
  const q = quizQuestions[currentQuestion];
  elements.quiz.question.innerText = q.q;
  elements.quiz.options.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.innerText = opt;

    btn.onclick = () => {
      const allButtons = elements.quiz.options.querySelectorAll("button");

      allButtons.forEach(b => b.disabled = true); // disable all buttons

      if (idx === q.answer) {
        score++;
        btn.style.backgroundColor = "green";
        btn.style.color = "white";
      } else {
        btn.style.backgroundColor = "red";
        btn.style.color = "white";

        allButtons[q.answer].style.backgroundColor = "green";
        allButtons[q.answer].style.color = "white";
      }

      elements.quiz.nextBtn.disabled = false;
    };

    elements.quiz.options.appendChild(btn);
  });

  elements.quiz.nextBtn.disabled = true;
}

elements.quiz.nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < quizQuestions.length) {
    showQuestion();
  } else {
    elements.quiz.question.innerText = "Quiz Completed!";
    elements.quiz.options.innerHTML = "";
    elements.quiz.scoreVal.innerText = score;
    elements.quiz.totalVal.innerText = quizQuestions.length;
    elements.quiz.score.classList.remove("hidden");
    elements.quiz.nextBtn.disabled = true;
  }
});

// ---------------- Event Listeners ----------------
elements.getWeatherBtn.addEventListener("click", () => {
  const city = elements.cityInput.value.trim();
  if (city) getWeather(city);
});

elements.toggleUnits.addEventListener("click", () => {
  isCelsius = !isCelsius;
  updateUnitsLabel();
  const city = elements.cityName.innerText.split(",")[0];
  if (city) getWeather(city);
});

elements.useLocation.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      elements.cityInput.value = data.name;
      getWeather(data.name);
    });
  } else {
    alert("Geolocation not supported by your browser.");
  }
});

document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

updateUnitsLabel();
showQuestion();
