const accessToken = 'pk.eyJ1IjoiZ2FicmllbGNhcnZhbGgwIiwiYSI6ImNscjltcjF2ZjAzZW4ya3Q2bWx1dmg0dnkifQ.KrP_ZKhIL4h_bKPXGIUYWw'
const input = document.querySelector('.input')
const suggestions = document.querySelector('.suggestions')

navigator.geolocation.getCurrentPosition(
    ({ coords: {latitude, longitude} }) => setupMap(longitude, latitude),
    () => setupMap(-46.625290, -23.533773),
    { enableHighAccuracy: true }
)

const setupMap = (lng, lat) => {
    mapboxgl.accessToken = accessToken
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [lng, lat],
        zoom: 12,
        minZoom: 5,
        language: 'pt'
    })
    map.addControl(new mapboxgl.NavigationControl())
}

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