let map;
let taxiMarkers = {}; // Guardará los marcadores de los taxis

// Inicializa el mapa en la app del servidor
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -31.6300, lng: -60.7000 }, // Santa Fe, Argentina
        zoom: 12
    });
}

// Actualiza o crea un marcador para cada taxi en el mapa
function updateTaxiLocation(taxiId, lat, lng) {
    if (taxiMarkers[taxiId]) {
        taxiMarkers[taxiId].setPosition(new google.maps.LatLng(lat, lng)); // Actualiza la posición
    } else {
        taxiMarkers[taxiId] = new google.maps.Marker({
            position: { lat, lng },
            map,
            title: `Taxi ${taxiId}`
        });
    }
}

// Obtiene las ubicaciones de los taxis desde el servidor
function fetchTaxiLocations() {
    fetch("http://localhost:3000/get-taxi-locations") // Asegúrate de que la URL es correcta
        .then(response => response.json())
        .then(data => {
            data.forEach(taxi => {
                updateTaxiLocation(taxi.id, taxi.lat, taxi.lng);
            });
        })
        .catch(error => console.error("Error obteniendo ubicaciones:", error));
}

// Llama a la función cada 10 segundos para actualizar las ubicaciones de los taxis
setInterval(fetchTaxiLocations, 10000); // Actualiza cada 10 segundos

// Inicializa el mapa cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initMap);