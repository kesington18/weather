const cityInput = document.querySelector(".city-input");
const locationButton = document.querySelector(".location-btn");
const currentWeatherCard = document.querySelector(".current-weather");
const FutureWeatherCards = document.querySelector("main");

const API_KEY = "3da5b07faee1bcb1ec9587454037859f";


async function getCityCoordinates() {
    const cityName = cityInput.value.trim();
    if(!cityName) return;


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
    }
}

async function getWeatherDetails(cityName, lat, lon) {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const response = await fetch(WEATHER_API_URL);
        const data = await response.json();
        // console.log(data)

        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter((forecast) => {
            // console.log(forecast.dt_txt)
            const forecastDate = new Date(forecast.dt_txt).getDay();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            };
            // console.log(forecastDate)
        });
        // console.log(fiveDaysForecast)

        cityInput.value = ""
        currentWeatherCard.innerHTML = ""
        FutureWeatherCards.innerHTML =""

        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherCard.insertAdjacentHTML("beforeend",createWeatherCard(cityName, weatherItem, index))
            } else {
                FutureWeatherCards.insertAdjacentHTML("beforeend",createWeatherCard(cityName, weatherItem, index))
            }
        });
    } catch (error) {
        alert(error)
    }    
}

const createWeatherCard = (cityName, weatherItem, index) => {
    // console.log(weatherItem)
    const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const forecastDate = new Date(weatherItem.dt_txt);
    // console.log(forecastDate)
    const today = new Date().getDay();

    const dayName = daysOfTheWeek[forecastDate.getDay()];

    if (index === 0) {
        return `<div class="details col-span-1 grid p-2">
                <h2>${cityName} Now</h2>
                <h4 class="text-3xl font-bold">${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            </div>
            <div class="icons col-span-1 flex flex-col justify-between text-center">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" class="m-auto" alt="weather-icon">
                <h4 class="font-semibold">${weatherItem.weather[0].description}</h4>
            </div>`
    } else {
        return `<div class="card border-2 border-pink-600 text-center bg-sky-600 text-white py-2">
                <h3 class="text-xl font-semibold">${dayName}</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" class="m-auto"  alt="weather-icon">
                <h4 class="pb-2 text-l font-semibold">${weatherItem.weather[0].description}</h4>
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>`   
    }
}

function getUserCurrentLocation() {
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
                    // console.log(data)
                } catch (error) {
                    alert(error);
                }
            };

            processData(REVERSE_GEOCODING_URL)
        },
        error => {
            // console.log(error)
            alert(error)
        }
    )
}

locationButton.addEventListener("click", getCityCoordinates);
document.addEventListener("DOMContentLoaded", getUserCurrentLocation)