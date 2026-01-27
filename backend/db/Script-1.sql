

CREATE TABLE usuario (
    id_usuario SERIAL NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL,
    mail VARCHAR(100) NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    verificado BOOLEAN NOT NULL,
    cta_bancaria CHAR(20),
    dni CHAR(10),
    CONSTRAINT usuario_pk PRIMARY KEY (id_usuario),
    CONSTRAINT usuario_mail_uk UNIQUE (mail)
);

CREATE TABLE categoria (
    id_categoria SERIAL NOT NULL,
    nombre_cat VARCHAR(50) NOT NULL,
    CONSTRAINT categoria_pk PRIMARY KEY (id_categoria)
);



CREATE TABLE metodo_pago (
    id_pago SERIAL NOT NULL,
    nombre_pago VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100),
    CONSTRAINT metodo_pago_pk PRIMARY KEY (id_pago)
);

CREATE TABLE metodo_envio (
    id_envio SERIAL NOT NULL,
    nombre_envio VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100),
    CONSTRAINT metodo_envio_pk PRIMARY KEY (id_envio)
);

CREATE TABLE caracteristica (
    id_caracteristica SERIAL NOT NULL,
    nombre_caracteristica VARCHAR(50) NOT NULL,
    CONSTRAINT caracteristica_pk PRIMARY KEY (id_caracteristica)
);

CREATE TABLE carrito (
    id_carrito SERIAL NOT NULL,
    subtotal DECIMAL(10,2),
    CONSTRAINT carrito_pk PRIMARY KEY (id_carrito)
);

/*CREATE TABLE producto_variante (
    id_prod_var SERIAL NOT NULL,
    stock INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    CONSTRAINT producto_variante_pk PRIMARY KEY (id_prod_var)
);*/

-- ======================================================
--  TABLAS CON DEPENDENCIAS DIRECTAS NIVEL 2
-- ======================================================


CREATE TABLE comercio (
    id_comercio SERIAL NOT NULL,
    id_usuario INT NOT NULL,
    nombre_comercio VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100),
    cuit CHAR(11),
    tipo_diseño VARCHAR(50),
    logo VARCHAR(200),
    activo BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT comercio_pk PRIMARY KEY (id_comercio),
    CONSTRAINT comercio_fk_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE valor (
    id_valor SERIAL NOT NULL,
    id_caracteristica INT NOT NULL,
    nombre_valor VARCHAR(50) NOT NULL,
    CONSTRAINT valor_pk PRIMARY KEY (id_valor),
    CONSTRAINT valor_fk_caracteristica FOREIGN KEY (id_caracteristica)
        REFERENCES caracteristica(id_caracteristica)
);

/* no son usuarios del sistema si no que consumidores de cada comercio */
CREATE TABLE consumidor (
    id_consumidor SERIAL PRIMARY KEY,
    id_comercio INT NOT NULL,
    nombre VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    CONSTRAINT consumidor_fk_comercio
        FOREIGN KEY (id_comercio)
        REFERENCES comercio(id_comercio)
);

-- ======================================================
--  TABLAS RELACIONALES Y DE TRANSACCIÓN
-- ======================================================

CREATE TABLE producto (
    id_producto SERIAL NOT NULL,
    id_comercio INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    foto VARCHAR(200),
    descripcion VARCHAR(200),
    activo BOOLEAN NOT NULL,
    CONSTRAINT producto_pk PRIMARY KEY (id_producto),
    CONSTRAINT producto_fk_comercio FOREIGN KEY (id_comercio)
        REFERENCES comercio(id_comercio)
);




CREATE TABLE pedido (
    id_pedido SERIAL NOT NULL,
    numero_pedido VARCHAR(20) NOT NULL,
    id_carrito INT NOT NULL,
    id_consumidor INT NOT NULL,
    id_comercio INT NOT NULL,
    fecha DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    id_pago INT NOT NULL,
    id_envio INT NOT NULL,
    estado VARCHAR(30) NOT NULL CHECK (estado IN (
        'Pendiente',
        'En preparación',
        'Enviado',
        'Entregado',
        'Cancelado'
    )),
    CONSTRAINT pedido_pk PRIMARY KEY (id_pedido),
    CONSTRAINT pedido_numero_uk UNIQUE (numero_pedido),
    CONSTRAINT pedido_fk_carrito FOREIGN KEY (id_carrito)
        REFERENCES carrito(id_carrito),
    CONSTRAINT pedido_fk_consumidor FOREIGN KEY (id_consumidor)
        REFERENCES consumidor(id_consumidor),
    CONSTRAINT pedido_fk_comercio FOREIGN KEY (id_comercio)
        REFERENCES comercio(id_comercio),
    CONSTRAINT pedido_fk_pago FOREIGN KEY (id_pago)
        REFERENCES metodo_pago(id_pago),
    CONSTRAINT pedido_fk_envio FOREIGN KEY (id_envio)
        REFERENCES metodo_envio(id_envio)
);


-- ======================================================
--  TABLAS INTERMEDIAS (N a N)
-- ======================================================

CREATE TABLE m_n_cat_prod (
    id_cat_prod SERIAL NOT NULL,
    id_producto INT NOT NULL,
    id_categoria INT NOT NULL,
    CONSTRAINT m_n_cat_prod_pk PRIMARY KEY (id_cat_prod),
    CONSTRAINT m_n_cat_prod_fk_producto FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto),
    CONSTRAINT m_n_cat_prod_fk_categoria FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
);

CREATE TABLE m_n_prod_carrito (
    id_prod_carrito SERIAL NOT NULL,
    id_producto INT NOT NULL,
    id_carrito INT NOT NULL,
    cantidad INT NOT NULL,
    CONSTRAINT m_n_prod_carrito_pk PRIMARY KEY (id_prod_carrito),
    CONSTRAINT m_n_prod_carrito_fk_producto FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto),
    CONSTRAINT m_n_prod_carrito_fk_carrito FOREIGN KEY (id_carrito)
        REFERENCES carrito(id_carrito)
);

/*CREATE TABLE m_n_prod_provar (
    id_prod_provar SERIAL NOT NULL,
    id_prod_var INT NOT NULL,
    id_producto INT NOT NULL,
    CONSTRAINT m_n_prod_provar_pk PRIMARY KEY (id_prod_provar),
    CONSTRAINT m_n_prod_provar_fk_prodvar FOREIGN KEY (id_prod_var)
        REFERENCES producto_variante(id_prod_var),
    CONSTRAINT m_n_prod_provar_fk_producto FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
);

CREATE TABLE m_n_prodrvar_carac (
    id_prodrvar_carac SERIAL NOT NULL,
    id_prod_var INT NOT NULL,
    id_caracteristica INT NOT NULL,
    CONSTRAINT m_n_prodrvar_carac_pk PRIMARY KEY (id_prodrvar_carac),
    CONSTRAINT m_n_prodrvar_carac_fk_prodvar FOREIGN KEY (id_prod_var)
        REFERENCES producto_variante(id_prod_var),
    CONSTRAINT m_n_prodrvar_carac_fk_carac FOREIGN KEY (id_caracteristica)
        REFERENCES caracteristica(id_caracteristica)
);*/

CREATE TABLE detalle_pedido (
    id_detallepedido SERIAL NOT NULL,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    CONSTRAINT detalle_pedido_pk PRIMARY KEY (id_detallepedido),
    CONSTRAINT detalle_pedido_fk_pedido FOREIGN KEY (id_pedido)
        REFERENCES pedido(id_pedido),
    CONSTRAINT detalle_pedido_fk_producto FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
);

/* CAMBIOS EXTRA*/
ALTER TABLE comercio
ADD COLUMN rubro VARCHAR(50),
ADD COLUMN direccion VARCHAR(100),
ADD COLUMN contacto VARCHAR(50);

alter table usuario 
add column nombre_banco VARCHAR(50),
add column nombre_titular VARCHAR(50);



ALTER TABLE categoria ADD COLUMN id_comercio INT NOT NULL;

ALTER TABLE categoria 
ADD CONSTRAINT categoria_fk_comercio FOREIGN KEY (id_comercio)
REFERENCES comercio(id_comercio);

ALTER TABLE caracteristica ADD COLUMN id_comercio INT NOT NULL;

ALTER TABLE caracteristica  
ADD CONSTRAINT carac_fk_comercio FOREIGN KEY (id_comercio)
REFERENCES comercio(id_comercio);

DROP TABLE IF EXISTS m_n_prodrvar_carac CASCADE;
DROP TABLE IF EXISTS m_n_prod_provar CASCADE;
DROP TABLE IF EXISTS producto_variante CASCADE;

--remplaza a variante
CREATE TABLE variante (
    id_variante SERIAL PRIMARY KEY,
    id_producto INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    CONSTRAINT variante_fk_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
);

--tabla relacional entre variante y valores de las carcteristicas
CREATE TABLE variante_valor (
    id_variante INT NOT NULL,
    id_valor INT NOT NULL,
    PRIMARY KEY (id_variante, id_valor),
    CONSTRAINT variante_valor_fk_variante
        FOREIGN KEY (id_variante)
        REFERENCES variante(id_variante),
    CONSTRAINT variante_valor_fk_valor
        FOREIGN KEY (id_valor)
        REFERENCES valor(id_valor)
);
