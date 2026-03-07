# Frontend - PFC-AIA

Aplicacion React + Vite del ecommerce.

## Requisitos

- Node.js 18+
- Backend corriendo y accesible

## Instalacion

```bash
cd frontend
npm install
```

## Variables de entorno

Archivos de referencia:

- `.env.example`
- `.env.development.example`
- `.env.production.example`

Para local:

```bash
cp .env.development.example .env
```

Variable principal:

- `VITE_API_BASE_URL`: URL base del backend (ej: `http://localhost:4000`)

La app centraliza esta configuración en `src/config/api.js`.

## Desarrollo

```bash
cd frontend
npm run dev
```

Frontend local: `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Deploy

1. Configurar `VITE_API_BASE_URL` al backend de producción.
2. Ejecutar `npm run build`.
3. Publicar `dist/` en Vercel/Netlify/Cloudflare Pages u otro hosting estático.
