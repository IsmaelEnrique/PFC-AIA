# Backend - PFC-AIA

API REST para ecommerce basico, construida con Node.js + Express y PostgreSQL.

## Requisitos

- Node.js 18+
- PostgreSQL

## Instalacion

```bash
cd backend
npm install
```

## Variables de entorno

Usar las plantillas incluidas:

- `backend/.env.example`
- `backend/.env.development.example`
- `backend/.env.production.example`

Para local, copiar:

```bash
cp .env.development.example .env
```

Campos clave:

- `PORT`: puerto del servidor (default 4000)
- `BACKEND_URL`: URL publica del backend
- `FRONTEND_URL`: URL publica del frontend
- `CORS_ORIGINS`: lista separada por comas de orígenes permitidos
- `SUPABASE_URL` y `SUPABASE_KEY`
- `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`
- `EMAIL_USER`, `EMAIL_PASS`
- `MP_CLIENT_ID`, `MP_CLIENT_SECRET`, `MP_REDIRECT_URI`

## Scripts

- `npm run dev`: iniciar backend en desarrollo
- `npm start`: iniciar backend en produccion

## Ejecucion local

```bash
cd backend
npm run dev
```

Servidor por defecto: `http://localhost:4000`

## Deploy

1. Crear servicio Node en tu plataforma.
2. Configurar variables de entorno de `backend/.env.production.example`.
3. Configurar comando start: `npm start`.
4. Confirmar que `BACKEND_URL`, `FRONTEND_URL` y `CORS_ORIGINS` esten correctas para producción.

## Nota

No subir `.env` reales con secretos al repositorio.