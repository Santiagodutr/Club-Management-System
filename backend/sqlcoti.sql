-- Crear tabla de cotizaciones
CREATE TABLE cotizaciones (
  id SERIAL PRIMARY KEY,
  salon VARCHAR(255) NOT NULL,
  fecha VARCHAR(255) NOT NULL,
  hora VARCHAR(255) NOT NULL,
  duracion INTEGER NOT NULL,
  asistentes INTEGER NOT NULL,
  prestaciones TEXT NOT NULL,
  requiere_sillas BOOLEAN DEFAULT false,
  numero_sillas INTEGER DEFAULT 0,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(255),
  observaciones TEXT,
  cotizacion_numero VARCHAR(255) NOT NULL UNIQUE,
  valor_total DECIMAL(15, 2) NOT NULL,
  detalles TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por número de cotización
CREATE INDEX idx_cotizacion_numero ON cotizaciones(cotizacion_numero);

-- Crear índice para búsquedas por email
CREATE INDEX idx_email ON cotizaciones(email);