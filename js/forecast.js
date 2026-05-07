const KEY = '0298b860885d08f712a737b2262100a1'


const getData=async (city)=>{
  const base='https://api.openweathermap.org/data/2.5/weather'
  const query=`?q=${city}&units=metric&appid=${KEY}`
  loader(true)
  const req=await fetch(base+query)
  const data=await req.json()
  loader(false)
  return data
}
getData('Tashkent').then((data)=>{console.log(data)})