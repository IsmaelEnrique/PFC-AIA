-- Add shipping address fields to pedido
ALTER TABLE pedido
ADD COLUMN calle TEXT,
ADD COLUMN numero TEXT,
ADD COLUMN piso TEXT,
ADD COLUMN localidad TEXT,
ADD COLUMN provincia TEXT,
ADD COLUMN codigo_postal TEXT;

-- Optionally ensure estado values are handled at application level; no constraint added here.
