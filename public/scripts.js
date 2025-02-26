let map;
let userPosition = null;
let userId = null;
let markers = {};
let isAdmin = false;
let routePaths = {}; // Almacena las rutas de cada chofer

// Verifica que Google Maps haya cargado antes de inicializar el mapa
function loadGoogleMaps() {
    if (typeof google !== "undefined") {
        initMap();
    } else {
        setTimeout(loadGoogleMaps, 500);
    }
}

// Pedir el nombre del usuario o si es administrador
function askUserId() {
    const input = prompt("Ingrese su nombre (o 'admin' si es administrador):");

    if (!input) {
        alert("Debe ingresar un nombre.");
        return askUserId();
    }

    userId = input.trim().toLowerCase();
    isAdmin = userId === "admin";

    if (!isAdmin) {
        startTracking();
    }

    loadGoogleMaps(); // Se asegura de que Google Maps esté disponible antes de inicializarlo
}

// Inicializar el mapa
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -31.6300, lng: -60.7000 },
        zoom: 12,
    });

    loadTaxiLocations();
}

// Obtener ubicación del usuario
function getUserLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                callback(userPosition);
            },
            (error) => {
                console.error("Error al obtener la ubicación:", error);
            }
        );
    }
}

// Enviar ubicación al servidor
function sendLocation() {
    if (!userPosition || !userId) return;

    fetch("https://flota-cfj7.onrender.com/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            taxiId: userId,
            lat: userPosition.lat,
            lng: userPosition.lng,
        }),
    }).catch((error) => console.error("Error al enviar ubicación:", error));
}

// Actualizar ubicación cada 10 segundos
function startTracking() {
    getUserLocation(() => {
        sendLocation();
        setInterval(() => {
            getUserLocation(sendLocation);
        }, 10000);
    });
}

// Cargar ubicaciones de los taxis
function loadTaxiLocations() {
    fetch("https://flota-cfj7.onrender.com/get-location")
        .then((response) => response.json())
        .then((data) => {
            if (!data || Object.keys(data).length === 0) return;

            // Limpiar marcadores anteriores
            Object.values(markers).forEach((marker) => marker.setMap(null));
            markers = {};

            // Agregar nuevos marcadores
            Object.entries(data).forEach(([taxiId, location]) => {
                if (!isAdmin && taxiId !== userId) return;

                const marker = new google.maps.Marker({
                    position: new google.maps.LatLng(location.lat, location.lng),
                    map,
                    title: `Taxi: ${taxiId}`,
                });

                markers[taxiId] = marker;
            });
        })
        .catch((error) => console.error("Error al cargar ubicaciones:", error));

    setTimeout(loadTaxiLocations, 10000);
}

// Mostrar menú de choferes y sus recorridos
function showDriverMenu() {
    fetch("https://flota-cfj7.onrender.com/get-location")
        .then((response) => response.json())
        .then((data) => {
            if (!data || Object.keys(data).length === 0) return;

            let menu = document.getElementById("driverMenu");
            menu.innerHTML = "";

            Object.keys(data).forEach((taxiId) => {
                let button = document.createElement("button");
                button.innerText = `Taxi ${taxiId}`;
                button.onclick = () => showRoute(taxiId);
                menu.appendChild(button);
            });

            menu.style.display = "block";
        })
        .catch((error) => console.error("Error al cargar menú de choferes:", error));
}

// Mostrar la ruta de un chofer
function showRoute(taxiId) {
    fetch(`https://flota-cfj7.onrender.com/get-taxi-route?taxiId=${taxiId}`)
        .then((response) => response.json())
        .then((route) => {
            if (!route || !route.route || route.route.length === 0) {
                console.log("No hay recorrido disponible para este taxi.");
                return;
            }

            if (routePaths[taxiId]) {
                routePaths[taxiId].setMap(null);
            }

            const path = new google.maps.Polyline({
                path: route.route.map((r) => new google.maps.LatLng(r.lat, r.lng)),
                geodesic: true,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: map,
            });

            routePaths[taxiId] = path;
        })
        .catch((error) => console.error("Error al cargar la ruta del taxi:", error));
}

// Obtener la fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

document.addEventListener("DOMContentLoaded", askUserId);
