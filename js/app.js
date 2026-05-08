const changeLocation = document.getElementById('change-location')
const card = document.getElementById('card')
const details = document.getElementById('details')
const weatherIcon = document.getElementById('weather-icon')
const overlay = document.getElementById('overlay')
const showWeather = document.getElementById('showWeather')
const weeklyForecast = document.getElementById('weekly-forecast')
const statusMessage = document.getElementById('status-message')

changeLocation.city.focus()

function loader(state){
  if(state){
   overlay.classList.remove('d-none') 
  }else{
    overlay.classList.add('d-none')
  }
}

const formatDay = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const setStatusMessage = (text = '', type = 'danger') => {
  statusMessage.textContent = text
  statusMessage.className = text ? `text-${type} mb-3` : ''
}

const updateUI=(weather, locationOverride = {})=>{
  setStatusMessage('')
  const name = locationOverride.name || weather.name
  const country = locationOverride.country || weather.sys.country

  details.innerHTML=`
   <h5 class="mb-3">${name}, ${country}</h5>
   <p class="mb-3">${weather.weather[0].main}</p>
   <div class="display-4 mb-3">
     <span>${Math.round(weather.main.temp)}</span>
     <span>&deg;C</span>
   </div>
  `

  if(card.classList.contains('d-none')){
    card.classList.remove('d-none')
  }
  weatherIcon.src=`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
}

const updateForecastUI = (forecast) => {
  if (!forecast || !forecast.list) {
    weeklyForecast.innerHTML = ''
    return
  }


  const dailyForecasts = {}
  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toDateString()
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date: item.dt,
        temps: [],
        weather: item.weather[0]
      }
    }
    dailyForecasts[date].temps.push(item.main.temp)
  })

  const dailyArray = Object.values(dailyForecasts).slice(0, 7)

  weeklyForecast.innerHTML = dailyArray.map((day) => {
    const maxTemp = Math.max(...day.temps)
    const minTemp = Math.min(...day.temps)
    return `
      <div class="col-6 col-md-4">
        <div class="forecast-card text-center p-3">
          <div class="fw-bold mb-2">${formatDay(day.date)}</div>
          <img
            src="https://openweathermap.org/img/wn/${day.weather.icon}@2x.png"
            alt="${day.weather.description}"
            width="60"
            height="60"
          />
          <div class="text-uppercase mb-2">${day.weather.main}</div>
          <div>${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</div>
        </div>
      </div>
    `
  }).join('')
}

const loadWeeklyForecast = async (coords) => {
  try {
    const forecastData = await getWeeklyForecast(coords)
    updateForecastUI(forecastData)
  } catch (error) {
    weeklyForecast.innerHTML = ''
  }
}

const getWeather = async (city) => {
  const data = await getWeatherByCity(city)
  return data
}

const loadCurrentLocationWeather = () => {
  if (!navigator.geolocation) {
    setStatusMessage('Brauzeringiz geolokatsiyani qo‘llab-quvvatlamaydi.', 'danger')
    return
  }

  const isSecureContext = location.protocol === 'https:' || location.hostname === 'localhost'
  if (!isSecureContext) {
    setStatusMessage('Joylashuv ma’lumotlarini olish uchun saytni HTTPS yoki localhost orqali oching.', 'danger')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        setStatusMessage('')
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude }
        const [location] = await reverseGeocode({ lat: coords.latitude, lon: coords.longitude })
        const currentWeather = await getWeatherByCoords({ lat: coords.latitude, lon: coords.longitude })

        updateUI(currentWeather, {
          name: location?.name || currentWeather.name,
          country: location?.country || currentWeather.sys.country
        })
        loadWeeklyForecast({ lat: coords.latitude, lon: coords.longitude })
      } catch (error) {
        console.error('Geolocation weather failed:', error)
        setStatusMessage('Joylashuv ma’lumotlarini olishni amalga oshirib bo‘lmadi.', 'danger')
      }
    },
    (error) => {
      console.warn('Foydalanuvchi joylashuvga ruxsat bermadi.', error)
      setStatusMessage('Joylashuv ruxsati rad etildi yoki olinmadi.', 'danger')
    }
  )
}

loadCurrentLocationWeather()

showWeather.addEventListener("click", (e) => {
  e.preventDefault()
  const cityName=changeLocation.city.value.trim()
  if (!cityName) return
  changeLocation.reset()
  getWeather(cityName)
    .then((data)=>{
      if (data.cod && data.cod !== 200) {
        alert('Shahar topilmadi. Iltimos, qaytadan kiriting.')
        return null
      }
      updateUI(data)
      return loadWeeklyForecast(data.coord)
    })
})