# Backend

Guía mínima para configurar variables de entorno y ejecutar el servidor.

## Variables de entorno (.env)
Crea un archivo `backend/.env` con al menos estas variables:

```
NODE_ENV=development
PORT=3333
HOST=localhost
LOG_LEVEL=info

# Genera un APP_KEY y pégalo aquí (ver pasos abajo)
APP_KEY=

# Base de datos PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_DATABASE=

# Supabase
SUPABASE_URL=
SUPABASE_SECRET_KEY=
```

## Ejecutar el proyecto

```bash
# 1) Instalar dependencias
cd backend
npm install

# 2) Generar APP_KEY y colocarlo en .env
node ace generate:key

# 3) Ejecutar migraciones (requiere la DB configurada en .env)
node ace migration:run

# 4) Levantar en desarrollo (HMR)
npm run dev
```
