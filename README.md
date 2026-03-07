# PFC-AIA - Ecommerce Basico

Aplicacion full stack para un ecommerce simple, con:

- frontend en React + Vite
- backend en Node.js + Express
- base de datos PostgreSQL
- integracion con Supabase Auth

## Estructura del repositorio

- `frontend/`: aplicacion cliente
- `backend/`: API y logica de negocio

## Requisitos

- Node.js 18+
- npm 9+
- PostgreSQL

## Variables de entorno

Se agregaron plantillas separadas por entorno para estandarizar configuracion:

- frontend:
    - `frontend/.env.example`
    - `frontend/.env.development.example`
    - `frontend/.env.production.example`
- backend:
    - `backend/.env.example`
    - `backend/.env.development.example`
    - `backend/.env.production.example`

Para trabajar local:

1. Crear `backend/.env` copiando `backend/.env.development.example`.
2. Crear `frontend/.env` copiando `frontend/.env.development.example`.
3. Completar secretos reales (mail, Supabase, DB, Mercado Pago).

## Levantar en local

1. Instalar dependencias:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Iniciar backend:

```bash
cd backend
npm run dev
```

3. Iniciar frontend (en otra terminal):

```bash
cd frontend
npm run dev
```

4. URLs locales:

- frontend: `http://localhost:5173`
- backend: `http://localhost:4000`

## Deploy (resumen)

### Backend

1. Crear servicio Node en tu plataforma (Render/Railway/Fly.io/etc.).
2. Definir variables usando `backend/.env.production.example`.
3. Comando de inicio:

```bash
npm start
```

4. Verificar que `BACKEND_URL`, `FRONTEND_URL` y `CORS_ORIGINS` apunten a dominios reales.

### Frontend

1. Build:

```bash
cd frontend
npm run build
```

2. Configurar `VITE_API_BASE_URL` al dominio del backend desplegado.
3. Publicar carpeta `frontend/dist` en Vercel/Netlify/Cloudflare Pages o similar.

## Notas importantes

- El frontend ahora centraliza la base de API en `frontend/src/config/api.js`.
- Evitar hardcodes de host/puerto en componentes y hooks.
- No subir archivos `.env` reales al repositorio.