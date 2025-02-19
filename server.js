const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Almacenar ubicaciones en memoria (ahora con la última fecha de actualización)
const taxiLocations = {};

// Guardar la última actualización de cada taxi
app.post('/update-taxi-location', (req, res) => {
    const { taxiId, lat, lng } = req.body;

    if (!taxiId || lat == null || lng == null) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Registrar la ubicación junto con el timestamp
    taxiLocations[taxiId] = {
        lat,
        lng,
        lastUpdated: new Date().toISOString() // Guardamos la fecha y hora de la última actualización
    };

    console.log(`Taxi ${taxiId} actualizado: (${lat}, ${lng}) - Última actualización: ${taxiLocations[taxiId].lastUpdated}`);
    res.json({ message: 'Ubicación actualizada correctamente' });
});

// Ruta para obtener todas las ubicaciones de los taxis con la última actualización
app.get('/get-taxi-locations', (req, res) => {
    const locationsArray = Object.entries(taxiLocations).map(([id, location]) => ({
        id,
        lat: location.lat,
        lng: location.lng,
        lastUpdated: location.lastUpdated // Agregar la última actualización
    }));
    res.json(locationsArray);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
