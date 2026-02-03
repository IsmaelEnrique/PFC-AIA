-- Recrear la tabla consumidor correctamente
-- Los consumidores son independientes de los usuarios (administradores)

-- 1. Eliminar la tabla consumidor actual si existe
DROP TABLE IF EXISTS m_n_prod_carrito CASCADE;
DROP TABLE IF EXISTS carrito CASCADE;
DROP TABLE IF EXISTS consumidor CASCADE;

-- 2. Crear la tabla consumidor con estructura correcta
CREATE TABLE consumidor (
    id_consumidor SERIAL NOT NULL,
    id_comercio INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    mail VARCHAR(100) NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    CONSTRAINT consumidor_pk PRIMARY KEY (id_consumidor),
    CONSTRAINT consumidor_fk_comercio FOREIGN KEY (id_comercio)
        REFERENCES comercio(id_comercio),
    CONSTRAINT consumidor_mail_comercio_uk UNIQUE (mail, id_comercio)
);

-- 3. Recrear la tabla carrito con la relación correcta
CREATE TABLE carrito (
    id_carrito SERIAL NOT NULL,
    id_consumidor INT,
    id_comercio INT NOT NULL,
    subtotal DECIMAL(10,2),
    CONSTRAINT carrito_pk PRIMARY KEY (id_carrito),
    CONSTRAINT carrito_fk_consumidor FOREIGN KEY (id_consumidor)
        REFERENCES consumidor(id_consumidor),
    CONSTRAINT carrito_fk_comercio FOREIGN KEY (id_comercio)
        REFERENCES comercio(id_comercio)
);

-- 4. Recrear la tabla m_n_prod_carrito
CREATE TABLE m_n_prod_carrito (
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    id_variante INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    CONSTRAINT m_n_prod_carrito_pk PRIMARY KEY (id_carrito, id_producto),
    CONSTRAINT m_n_prod_carrito_fk_carrito FOREIGN KEY (id_carrito)
        REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    CONSTRAINT m_n_prod_carrito_fk_producto FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
);

-- 5. Crear índices para mejor rendimiento
CREATE INDEX idx_carrito_consumidor ON carrito(id_consumidor);
CREATE INDEX idx_carrito_comercio ON carrito(id_comercio);
CREATE INDEX idx_consumidor_comercio ON consumidor(id_comercio);
CREATE INDEX idx_consumidor_mail ON consumidor(mail);
