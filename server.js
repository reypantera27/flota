const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Usa el puerto proporcionado por Render o un puerto predeterminado
const port = process.env.PORT || 3000;

app.use(cors()); // Habilitar CORS para acceder desde el navegador

// Middleware para analizar el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Almacén de ubicaciones de taxis (puedes usar una base de datos en producción)
let taxiLocations = [
  { id: 'taxi1', lat: 40.7128, lng: -74.0060 },
  { id: 'taxi2', lat: 51.5074, lng: -0.1278 }
];

// Ruta para recibir la ubicación de los taxis
app.post('/update-taxi-location', (req, res) => {
  const { taxiId, lat, lng } = req.body;

  // Guardamos o actualizamos la ubicación del taxi en el array
  const taxiIndex = taxiLocations.findIndex(t => t.id === taxiId);
  if (taxiIndex === -1) {
    taxiLocations.push({ id: taxiId, lat, lng });
  } else {
    taxiLocations[taxiIndex] = { id: taxiId, lat, lng };
  }

  res.status(200).send("Ubicación actualizada");
});

// Ruta para obtener las ubicaciones de los taxis
app.get('/get-taxi-locations', (req, res) => {
  res.json(taxiLocations); // Devolver las ubicaciones actuales de todos los taxis
});

// Iniciar el servidor en el puerto dinámico proporcionado por Render
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

