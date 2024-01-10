const accessToken = 'pk.eyJ1IjoiZ2FicmllbGNhcnZhbGgwIiwiYSI6ImNscG14ZDB6OTAwc3Eya29pM2dvZm5uamYifQ.IPac1tcfJTcmQLrrn937wQ'

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
    map.addControl(new mapboxgl.NavigationControl());
}
