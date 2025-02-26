let map;
let userPosition = null;
let userId = null;
let markers = {};
let isAdmin = false;
let routePaths = {};
let trackingInterval = null;

// Verifica que Google Maps haya cargado antes de inicializar el mapa
function loadGoogleMaps(retries = 5) {
    if (typeof google !== "undefined") {
        initMap();
    } else if (retries > 0) {
        setTimeout(() => loadGoogleMaps(retries - 1), 500);
    } else {
        document.getElementById("status").textContent = "No se pudo cargar Google Maps.";
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

    loadGoogleMaps();
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
                document.getElementById("status").textContent = "Error al obtener tu ubicación.";
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
    }).catch((error) => {
        console.error("Error al enviar ubicación:", error);
        document.getElementById("status").textContent = "Error al enviar ubicación.";
    });
}

// Actualizar ubicación cada 10 segundos
function startTracking() {
    getUserLocation(() => {
        sendLocation();
        if (trackingInterval) clearInterval(trackingInterval);
        trackingInterval = setInterval(() => {
            getUserLocation(sendLocation);
        }, 10000);
    });
}

// Cargar ubicaciones de los taxis
function loadTaxiLocations() {
    document.getElementById("status").textContent = "Cargando ubicaciones...";
    fetch("https://flota-cfj7.onrender.com/get-location")
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("status").textContent = "";
            if (!data || Object.keys(data).length === 0) return;

            Object.values(markers).forEach((marker) => marker.setMap(null));
            markers = {};

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
        .catch((error) => {
            console.error("Error al cargar ubicaciones:", error);
            document.getElementById("status").textContent = "Error al cargar ubicaciones.";
        });

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

document.addEventListener("DOMContentLoaded", askUserId);