const KEY = '0298b860885d08f712a737b2262100a1'

const buildUrl = (base, params) => {
  const query = new URLSearchParams({ ...params, appid: KEY, units: 'metric' })
  return `${base}?${query}`
}

const getData = async (url) => {
  loader(true)
  const req = await fetch(url)
  const data = await req.json()
  loader(false)
  return data
}

const getWeatherByCity = async (city) => {
  const url = buildUrl('https://api.openweathermap.org/data/2.5/weather', { q: city })
  return getData(url)
}

const getWeatherByCoords = async ({ lat, lon }) => {
  const url = buildUrl('https://api.openweathermap.org/data/2.5/weather', { lat, lon })
  return getData(url)
}

const getWeeklyForecast = async ({ lat, lon }) => {
  const url = buildUrl('https://api.openweathermap.org/data/2.5/forecast', {
    lat,
    lon,
    cnt: 40  // 5 kunlik, har 3 soatda
  })
  return getData(url)
}

const reverseGeocode = async ({ lat, lon }) => {
  const url = buildUrl('https://api.openweathermap.org/geo/1.0/reverse', {
    lat,
    lon,
    limit: 1
  })
  return getData(url)
}