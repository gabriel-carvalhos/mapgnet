const accessToken = 'pk.eyJ1IjoiZ2FicmllbGNhcnZhbGgwIiwiYSI6ImNscjltcjF2ZjAzZW4ya3Q2bWx1dmg0dnkifQ.KrP_ZKhIL4h_bKPXGIUYWw'
const input = document.querySelector('.input')
const suggestions = document.querySelector('.suggestions')

const getUserPosition = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
    })
}

const setUserCoords = async () => {
    try {
        const { coords: {latitude, longitude} } = await getUserPosition()
        return [longitude, latitude]
    } catch (err) {
        return [-46.625290, -23.533773]
    }
}

const coords = await setUserCoords()

mapboxgl.accessToken = accessToken
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: coords,
    zoom: 12,
    minZoom: 5,
    language: 'pt'
})
map.addControl(new mapboxgl.NavigationControl())

const start = new mapboxgl.Marker({
    color: '#2C6493',
    draggable: true
}).setLngLat(coords)

const end = new mapboxgl.Marker({
    color: '#ef9652',
    draggable: true
})

input.addEventListener('input', async () => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${input.value}.json?proximity=ip&access_token=${accessToken}&language=pt&limit=4`
    const data = await fetch(url)
    // const json = await data.json()
    const { features: places } = await data.json()
    console.clear()
    suggestions.innerHTML = ''
    places.forEach(place => {
        const suggestion = document.createElement('li')
        const text = document.createElement('span')
        text.classList.add('suggestion-text')
        text.textContent = place.place_name
        suggestion.appendChild(text)

        suggestion.addEventListener('click', () => {
            start.addTo(map)
            end.setLngLat(place.center).addTo(map)
            map.easeTo({ center: place.center })

            input.value = place.place_name
            input.classList.remove('focused')
        })

        suggestion.classList.add('suggestion')
        suggestions.appendChild(suggestion)
    })
})

input.addEventListener('focus', () => {
    input.classList.add('focused')
})

document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
        input.classList.remove('focused')
    }
})