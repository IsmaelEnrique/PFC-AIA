# 🛒 Backend - Proyecto E-commerce (PFC-AIA)

Este backend está desarrollado en **Node.js + Express**, con base de datos **PostgreSQL**.  
Su función es conectar el frontend (React) con la base de datos, manejando productos, usuarios, pedidos, etc.
---

## Requisitos previos

Antes de ejecutar el servidor, asegurate de tener instalado:

- [Node.js](https://nodejs.org/en/) (versión 18 o superior)
- [PostgreSQL](https://www.postgresql.org/download/)
- DBeaver (opcional, para visualizar la base de datos)
---

## ⚙️ Instalación inicial
1. Clonar el repositorio:

   ```bash
   git clone https://github.com/tu_usuario/PFC-AIA.git
   cd PFC-AIA/backend

Instalar dependencias:

bash
Copiar código
npm install

Crear un archivo .env en esta carpeta con tus datos de conexión:
env
Copiar código
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña ((es postgres tamb la contra))
DB_NAME=ecommerce
PORT=3001
(Opcional) Crear la base de datos en PostgreSQL usando el script db/init.sql:

bash
Copiar código
psql -U postgres -f db/init.sql
🖥️ Ejecutar el servidor
Para levantar el backend en modo desarrollo:

bash
Copiar código
npm run dev
El servidor se ejecuta en: http://localhost:3001

Si querés probar el servidor:

Abrí el navegador en http://localhost:3001

O usá Postman para enviar peticiones a /api/...

🔗 Conexión con el frontend
El frontend está desarrollado en React (carpeta /frontend o raíz del proyecto).

Asegurate de que el backend esté corriendo antes de abrir el frontend.

Las peticiones desde React se hacen a http://localhost:3001/api/...

Ejemplo de uso con fetch:

js
Copiar código
fetch("http://localhost:3001/api/productos")
  .then(res => res.json())
  .then(data => console.log(data))
👥 Equipo
Priscila Rouiller — Backend / Base de datos

[Nombre del compañero] — Frontend / UI

🧩 Estructura
bash
Copiar código
backend/
│
├── db/
│   └── init.sql           # Script de creación de tablas
│
├── server.js              # Servidor principal Express
├── package.json           # Dependencias y scripts
├── .env                   # Variables de entorno (no se sube a Git)
└── README.md              # Guía del backend
🛠 Scripts útiles
Comando	Descripción
npm run dev	Inicia el servidor en modo desarrollo
npm start	Inicia el servidor en modo producción
npm install	Instala las dependencias