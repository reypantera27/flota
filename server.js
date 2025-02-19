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

// Almacén de ubicaciones de taxis (se actualizará dinámicamente)
let taxiLocations = []; // Empezamos con un array vacío

// Ruta para recibir la ubicación de los taxis
app.post('/update-taxi-location', (req, res) => {
  const { taxiId, lat, lng } = req.body;

  // Si no recibimos una ubicación válida, respondemos con error
  if (!lat || !lng) {
    return res.status(400).send("Ubicación inválida");
  }

  // Buscamos si el taxi ya tiene ubicación guardada
  const taxiIndex = taxiLocations.findIndex(t => t.id === taxiId);

  if (taxiIndex === -1) {
    // Si el taxi no existe, agregamos la nueva ubicación
    taxiLocations.push({ id: taxiId, lat, lng });
  } else {
    // Si ya existe, actualizamos las coordenadas
    taxiLocations[taxiIndex] = { id: taxiId, lat, lng };
  }

  res.status(200).send("Ubicación actualizada");
});

// Ruta para obtener las ubicaciones de los taxis
app.get('/get-taxi-locations', (req, res) => {
  res.json(taxiLocations); // Devolver las ubicaciones actuales de todos los taxis
});

// Iniciar el servidor en el puerto dinámico proporcionado por Render
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

