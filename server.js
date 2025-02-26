const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Estructura para almacenar las ubicaciones de los taxis
const taxiLocations = {}; // Guarda la última ubicación
const taxiRoutes = {}; // Guarda el historial de ubicaciones de cada taxi

// Endpoint para verificar si el servidor está activo
app.get("/status", (req, res) => {
    res.json({ message: "Servidor funcionando correctamente" });
});

// Endpoint para actualizar la ubicación del taxi
app.post("/update-location", (req, res) => {
    const { taxiId, lat, lng } = req.body;

    if (!taxiId || typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({ error: "Faltan datos o son inválidos" });
    }

    // Guardar última ubicación
    taxiLocations[taxiId] = { lat, lng, timestamp: Date.now() };

    // Guardar el historial de ubicaciones
    if (!taxiRoutes[taxiId]) {
        taxiRoutes[taxiId] = [];
    }
    taxiRoutes[taxiId].push({ lat, lng, timestamp: Date.now() });

    res.status(200).json({ message: "Ubicación guardada", location: taxiLocations[taxiId] });
});

// Endpoint para obtener la última ubicación de un taxi
app.get("/get-location", (req, res) => {
    const { taxiId } = req.query;

    if (!taxiId || !taxiLocations[taxiId]) {
        return res.status(404).json({ error: "No hay datos para este taxi" });
    }

    res.status(200).json(taxiLocations[taxiId]);
});

// Endpoint para obtener el recorrido completo del taxi
app.get("/get-taxi-route", (req, res) => {
    const { taxiId } = req.query;

    if (!taxiId || !taxiRoutes[taxiId] || taxiRoutes[taxiId].length === 0) {
        return res.status(404).json({ error: "No hay datos de recorrido para este taxi" });
    }

    res.status(200).json({ taxiId, route: taxiRoutes[taxiId] });
});

app.listen(PORT, () => {
    console.log(`🚖 Servidor corriendo en el puerto ${PORT}`);
});
