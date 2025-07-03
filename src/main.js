// ==============================
// 🔇 1. Ocultar warning molesto de Mongoose sobre saslprep
// ==============================
// Este bloque evita que Mongoose muestre advertencias repetitivas relacionadas con contraseñas no sanitizadas
const processEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  if (
    typeof warning === 'string' &&
    warning.includes('no saslprep library specified')
  ) {
    return; // Ignorar esa advertencia específica
  }
  return processEmitWarning(warning, ...args); // Mostrar otras advertencias
};


// ==============================
// 📦 2. Imports y configuración base
// ==============================
require('dotenv').config(); // Cargar variables de entorno desde .env

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');



// ==============================
// 🧩 3. Middlewares y rutas
// ==============================
const { generic } = require('./middlewares'); // Middleware genérico de logging
const {
  tagRoute,
  userRoute,
  postRoute,
  postImageRoute,
  commentRoute
} = require('./routes');


// ==============================
// 🚀 4. Configuración de Express
// ==============================
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

//CORS
app.use(cors({
  origin: 'http://localhost:5173', // puerto donde corre Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Servir archivos estáticos (ej: imágenes subidas)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware para parsear JSON
app.use(express.json());

// Middleware personalizado para log de peticiones
app.use(generic.logRequest);

// ==============================
// 🌐 5. Rutas de la API REST
// ==============================
app.use('/tag', tagRoute);
app.use('/user', userRoute);
app.use('/post', postRoute);
app.use('/postImage', postImageRoute);
app.use('/comment', commentRoute);

// ==============================
// 🔗 6. Conexión a MongoDB y levantamiento del servidor
// ==============================
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`🚀 La app arrancó en el puerto ${PORT}.`);
    });
  })
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err);
  });
