const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Clave de administrador (podés cambiarla por un sistema más seguro)
const ADMIN_KEY = "tiziprat"; 

app.use(cors());
app.use(express.json());

// Almacenar ubicaciones en memoria
const taxiLocations = {};

// Guardar la última actualización de cada taxi
app.post('/update-taxi-location', (req, res) => {
    const { taxiId, lat, lng } = req.body;

    if (!taxiId || lat == null || lng == null) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }

    taxiLocations[taxiId] = { lat, lng };

    console.log(`Taxi ${taxiId} actualizado: (${lat}, ${lng})`);
    res.json({ message: 'Ubicación actualizada correctamente' });
});

// Ruta para que el ADMINISTRADOR vea todas las ubicaciones
app.get('/get-taxi-locations', (req, res) => {
    const adminKey = req.headers['admin-key'];

    if (adminKey !== ADMIN_KEY) {
        return res.status(403).json({ error: 'Acceso no autorizado' });
    }

    const locationsArray = Object.entries(taxiLocations).map(([id, location]) => ({
        id,
        ...location
    }));
    res.json(locationsArray);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
