const accessToken = 'pk.eyJ1IjoiZ2FicmllbGNhcnZhbGgwIiwiYSI6ImNscjltcjF2ZjAzZW4ya3Q2bWx1dmg0dnkifQ.KrP_ZKhIL4h_bKPXGIUYWw'
const input = document.querySelector('.input')
const suggestions = document.querySelector('.suggestions')
let route

const getUserPosition = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
    })
}

const setUserCoords = async () => {
    try {
        const { coords: { latitude, longitude } } = await getUserPosition()
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
    color: 'rgb(15, 118, 110)',
    draggable: true
}).setLngLat(coords)

const end = new mapboxgl.Marker({
    color: 'rgb(15, 118, 110)',
    draggable: true
})

start.on('dragend', async () => {
    const newCoords = start.getLngLat()
    start.setLngLat(newCoords)
    getRoute(newCoords, end.getLngLat())
})

end.on('dragend', async () => {
    const newCoords = end.getLngLat()
    end.setLngLat(newCoords)
    getRoute(start.getLngLat(), newCoords)
    const newAddress = await dataResult(newCoords)
    input.value = `${newAddress[0].place_name}`
})

const dataResult = async query => {
    let endpoint = typeof query == 'string' ? `${query}.json?limit=4` : `${query.lng},${query.lat}.json?limit=1`
    const data = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${endpoint}&access_token=${accessToken}&language=pt&proximity=ip`)
    // const json = await data.json()
    const { features: places } = await data.json()
    return places
}

input.addEventListener('input', async () => {
    suggestions.innerHTML = ''
    const places = await dataResult(input.value)
    places.forEach(place => {
        const suggestion = document.createElement('li')
        const text = document.createElement('span')
        text.classList.add('suggestion-text')
        text.textContent = place.place_name
        suggestion.appendChild(text)

        suggestion.addEventListener('click', () => {
            start.addTo(map)
            end.setLngLat(place.center).addTo(map)

            getRoute(start.getLngLat(), end.getLngLat())

            map.easeTo({ center: place.center })

            input.value = place.place_name
            input.classList.remove('focused')
        })

        suggestion.classList.add('suggestion')
        suggestions.appendChild(suggestion)
    })
})

const getRoute = async (start, end) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${accessToken}`
    const data = await fetch(url)
    const json = await data.json()
    route = json.routes[0]
    // console.log(json) // start of error

    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route.geometry.coordinates
        }
    }

    if (map.getSource('route')) {
        map.getSource('route').setData(geojson)
    } else {
        map.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
            }
        })
    }

    setZoomRoute(route)
}

const setZoomRoute = route => {
    const bounds = new mapboxgl.LngLatBounds(
        route.geometry.coordinates[0],
        route.geometry.coordinates[0]
    )
    
    route.geometry.coordinates.forEach(coord => {
        bounds.extend(coord)
    })

    map.fitBounds(bounds, { padding: 100 })
}

window.addEventListener('resize', () => {
    if (route) {
        setZoomRoute(route)
    }
})

input.addEventListener('focus', () => {
    input.classList.add('focused')
})

document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
        input.classList.remove('focused')
    }
})