## 📘 Descripción

Estructura de endpoints CRUD para una red social minimalista desarrollada con *Node.js, **Express, **MongoDB* y *Mongoose*.  
El sistema incluye funcionalidades clave como usuarios, posteos, comentarios, imágenes, etiquetas y relaciones de seguidores. Se utiliza *Docker* para el despliegue local de la base de datos MongoDB y Mongo Express.

---

## 🚀 Funcionalidades destacadas

- API RESTful para gestión de *usuarios, **posts, **comentarios, **etiquetas, **imágenes* y sistema de *seguidores*.
- *MongoDB* como base de datos no relacional, administrada con *Mongoose*.
- *Mongo Express* para visualización en entorno local.
- *Cache manual* con node-cache para optimizar consultas de posts individuales.
- *Carga de imágenes* con multer, guardadas localmente.
- *Arquitectura modular*: separación clara de controladores, modelos, rutas, middlewares y utilidades.

---

## 🛠 Configuración del entorno

Asegurate de tener instalado *Docker*.

1. Cloná el proyecto
2. Iniciá MongoDB y Mongo Express con Docker Compose:

```bash
docker-compose up -d