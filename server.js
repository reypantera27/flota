const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const taxiLocations = {};
const taxiRoutes = {};
const locationRequests = {}; // Nuevo: Almacena solicitudes pendientes

app.get("/status", (req, res) => {
    res.json({ message: "Servidor funcionando correctamente" });
});

app.post("/update-location", (req, res) => {
    const { taxiId, lat, lng } = req.body;

    if (!taxiId || typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({ error: "Faltan datos o son inválidos" });
    }

    taxiLocations[taxiId] = { lat, lng, timestamp: Date.now() };

    if (!taxiRoutes[taxiId]) {
        taxiRoutes[taxiId] = [];
    }
    taxiRoutes[taxiId].push({ lat, lng, timestamp: Date.now() });
    if (taxiRoutes[taxiId].length > 100) {
        taxiRoutes[taxiId].shift();
    }

    // Limpiar solicitud pendiente si existe
    if (locationRequests[taxiId]) {
        delete locationRequests[taxiId];
    }

    res.status(200).json({ message: "Ubicación guardada", location: taxiLocations[taxiId] });
});

app.get("/get-location", (req, res) => {
    const { taxiId } = req.query;

    if (taxiId) {
        if (!taxiLocations[taxiId]) {
            return res.status(404).json({ error: "No hay datos para este taxi" });
        }
        return res.status(200).json(taxiLocations[taxiId]);
    }

    res.status(200).json(taxiLocations);
});

app.get("/get-taxi-route", (req, res) => {
    const { taxiId } = req.query;

    if (!taxiId || !taxiRoutes[taxiId] || taxiRoutes[taxiId].length === 0) {
        return res.status(404).json({ error: "No hay datos de recorrido para este taxi" });
    }

    res.status(200).json({ taxiId, route: taxiRoutes[taxiId] });
});

// Nuevo endpoint: Admin solicita ubicación
app.post("/request-location", (req, res) => {
    const { taxiId } = req.body;

    if (!taxiId) {
        return res.status(400).json({ error: "Falta el taxiId" });
    }

    locationRequests[taxiId] = true; // Marcar solicitud pendiente
    res.status(200).json({ message: `Solicitud enviada para ${taxiId}` });
});

// Nuevo endpoint: Chofer verifica si hay solicitud
app.get("/check-request", (req, res) => {
    const { taxiId } = req.query;

    if (!taxiId) {
        return res.status(400).json({ error: "Falta el taxiId" });
    }

    res.status(200).json({ requested: !!locationRequests[taxiId] });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Algo salió mal en el servidor" });
});

app.listen(PORT, () => {
    console.log(`🚖 Servidor corriendo en el puerto ${PORT}`);
});