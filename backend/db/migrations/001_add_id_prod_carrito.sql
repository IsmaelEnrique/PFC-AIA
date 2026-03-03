-- Migration: Add id_prod_carrito primary key to m_n_prod_carrito
BEGIN;

-- 1) Add new serial primary key column
ALTER TABLE m_n_prod_carrito
  ADD COLUMN id_prod_carrito SERIAL;

-- 2) Drop existing composite PK if present (name from Script-1.sql: m_n_prod_carrito_pk)
ALTER TABLE m_n_prod_carrito
  DROP CONSTRAINT IF EXISTS m_n_prod_carrito_pk;

-- 3) Set new primary key
ALTER TABLE m_n_prod_carrito
  ADD CONSTRAINT m_n_prod_carrito_pk PRIMARY KEY (id_prod_carrito);

-- 4) Optionally ensure uniqueness per carrito/producto/variante
ALTER TABLE m_n_prod_carrito
  ADD CONSTRAINT m_n_prod_carrito_unique UNIQUE (id_carrito, id_producto, id_variante);

COMMIT;
