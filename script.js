const cityInput = document.querySelector(".city-input");
const locationButton = document.querySelector(".location-btn");
const currentWeatherCard = document.querySelector(".current-weather");
const FutureWeatherCards = document.querySelector("main");

const API_KEY = "3da5b07faee1bcb1ec9587454037859f";

// loader 
const loader = document.getElementById("loader");

function showLoader() {
  loader.classList.remove("hidden");
  setTimeout(() => {
    loader.classList.remove("opacity-0");
  }, 10); // tiny delay to trigger transition
}

function hideLoader() {
  loader.classList.add("opacity-0");
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 500); // match transition duration (0.5s)
}



// getting city coordinates from city name
async function getCityCoordinates() {
    const cityName = cityInput.value.trim();
    if(!cityName) return;

    // show loader
    showLoader();

    try {
        const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;



        // console.log(cityName)
        const response = await fetch(GEOCODING_API_URL);
        const data = await response.json();

        if (!data.length) throw new Error(`No coordinates found for ${cityName}`);

        const {name, lat, lon} = data[0]
        getWeatherDetails(name, lat, lon);
        // console.log(name, lat, lon)
    } catch (error) {
        alert(error)
    } finally {
        // hide loader
        hideLoader();
    }
}

// getting weather details from city coordinates
async function getWeatherDetails(cityName, lat, lon) {
    // show loader
    showLoader();

    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const response = await fetch(WEATHER_API_URL);
        const data = await response.json();
        // console.log(data)

        const uniqueForecastDays = [];

        // filtering weather data for 5 days (one entry per day)
        const fiveDaysForecast = data.list.filter((forecast) => {
            // console.log(forecast.dt_txt)

            // extract date part from dt_txt
            const forecastDate = forecast.dt_txt.split(" ")[0];

            // filtering unique days
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            };
            // console.log(forecastDate)
        });
        // console.log(fiveDaysForecast)

        cityInput.value = ""
        currentWeatherCard.innerHTML = ""
        FutureWeatherCards.innerHTML =""

        // creating weather cards
        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) { // current weather card
                currentWeatherCard.insertAdjacentHTML("beforeend",createWeatherCard(cityName, weatherItem, index))
            } else { // future weather cards
                FutureWeatherCards.insertAdjacentHTML("beforeend",createWeatherCard(cityName, weatherItem, index))
            }
        });
    } catch (error) {
        alert(error)
    } finally {
        // hide loader
        hideLoader();
    }
}

// creating the weather card
const createWeatherCard = (cityName, weatherItem, index) => {
    // console.log(weatherItem)

    // getting day name from dt_txt
    const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // extract date part from dt_txt
    const forecastDate = new Date(weatherItem.dt_txt);
    // console.log(forecastDate)

    // get day name
    const dayName = daysOfTheWeek[forecastDate.getDay()];

    const { icon, description} = weatherItem.weather[0];
    const {speed} = weatherItem.wind;
    const { humidity } = weatherItem.main;


    if (index === 0) {
        return `<div class="details col-span-1 grid p-2">
                <h2>${cityName} Now</h2>
                <h4 class="text-3xl font-bold">${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${speed} M/S</h4>
                <h4>Humidity: ${humidity} %</h4>
            </div>
            <div class="icons col-span-1 flex flex-col justify-between text-center">
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" class="m-auto" alt="weather-icon">
                <h4 class="font-semibold">${description}</h4>
            </div>`
    } else {
        return `<div class="card text-center bg-sky-600 text-white py-2">
                <h3 class="text-xl font-semibold">${dayName}</h3>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" class="m-auto"  alt="weather-icon">
                <h4 class="pb-2 text-l font-semibold">${description}</h4>
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${speed} M/S</h4>
                <h4>Humidity: ${humidity}%</h4>
            </div>`   
    }
}

// getting user's current location
function getUserCurrentLocation() {
    // show loader
    showLoader();

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            // console.log(position)


            // getting city name from coordinates using reverse geocoding API
            async function processData(url) {
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude)
                    console.log(name)
                } catch (error) {
                    alert(error);
                }
            };

            processData(REVERSE_GEOCODING_URL)
        },
        error => {
            // hide loader
            hideLoader()

            // console.log(error)
            alert(error)
        }
    )
}

// event listeners
locationButton.addEventListener("click", getCityCoordinates);
document.addEventListener("DOMContentLoaded", getUserCurrentLocation)
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates())