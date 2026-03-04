-- Agrega columna shipping_price a la tabla comercio
ALTER TABLE comercio
ADD COLUMN IF NOT EXISTS shipping_price NUMERIC(10,2);
