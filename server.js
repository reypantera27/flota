const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Almacenar ubicaciones de taxis en memoria con historial
const taxiLocations = {}; // Última ubicación
const taxiHistory = {}; // Historial de ubicaciones por día

// Guardar la ubicación de un taxi en el historial
app.post('/update-taxi-location', (req, res) => {
    const { taxiId, lat, lng } = req.body;

    if (!taxiId || lat == null || lng == null) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }

    const timestamp = new Date().toISOString();
    const dateKey = timestamp.split('T')[0]; // Guardar por día

    // Guardar última ubicación
    taxiLocations[taxiId] = { lat, lng, lastUpdated: timestamp };

    // Inicializar historial si no existe
    if (!taxiHistory[taxiId]) {
        taxiHistory[taxiId] = {};
    }
    if (!taxiHistory[taxiId][dateKey]) {
        taxiHistory[taxiId][dateKey] = [];
    }

    // Agregar la nueva ubicación al historial
    taxiHistory[taxiId][dateKey].push({ lat, lng, timestamp });

    console.log(`Taxi ${taxiId} actualizado: (${lat}, ${lng}) - Última actualización: ${timestamp}`);
    res.json({ message: 'Ubicación actualizada correctamente' });
});

// Obtener la última ubicación de todos los taxis
app.get('/get-taxi-locations', (req, res) => {
    const locationsArray = Object.entries(taxiLocations).map(([id, location]) => ({
        id,
        lat: location.lat,
        lng: location.lng,
        lastUpdated: location.lastUpdated
    }));
    res.json(locationsArray);
});

// Obtener el historial de ubicaciones de un taxi en un día específico
app.get('/get-taxi-history/:taxiId/:date', (req, res) => {
    const { taxiId, date } = req.params;
    
    if (!taxiHistory[taxiId] || !taxiHistory[taxiId][date]) {
        return res.status(404).json({ error: "No hay historial para este taxi en la fecha indicada." });
    }

    res.json(taxiHistory[taxiId][date]);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
