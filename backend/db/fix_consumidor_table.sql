-- Script para verificar y corregir la tabla consumidor
-- Ejecutar en la base de datos ecommerce

-- 1. Ver la estructura actual de la tabla consumidor
\d consumidor;

-- 2. Ver todas las columnas de la tabla consumidor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'consumidor'
ORDER BY ordinal_position;

-- 3. Si no existe la columna id_usuario, agregarla:
-- DESCOMENTA Y EJECUTA ESTO SI LA COLUMNA NO EXISTE:

-- ALTER TABLE consumidor 
-- ADD COLUMN id_usuario INT NOT NULL;

-- ALTER TABLE consumidor 
-- ADD CONSTRAINT consumidor_fk_usuario 
-- FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- 4. Verificar que se agregó correctamente
\d consumidor;
