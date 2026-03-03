-- Agrega tablas relacionales entre comercio y métodos de pago/envío
CREATE TABLE IF NOT EXISTS comercio_metodo_pago (
    id_com_pago SERIAL PRIMARY KEY,
    id_comercio INT NOT NULL,
    id_pago INT NOT NULL,
    CONSTRAINT com_met_pago_fk_comercio FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio) ON DELETE CASCADE,
    CONSTRAINT com_met_pago_fk_pago FOREIGN KEY (id_pago) REFERENCES metodo_pago(id_pago) ON DELETE CASCADE,
    CONSTRAINT com_met_pago_unq UNIQUE (id_comercio, id_pago)
);

CREATE TABLE IF NOT EXISTS comercio_metodo_envio (
    id_com_envio SERIAL PRIMARY KEY,
    id_comercio INT NOT NULL,
    id_envio INT NOT NULL,
    CONSTRAINT com_met_env_fk_comercio FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio) ON DELETE CASCADE,
    CONSTRAINT com_met_env_fk_envio FOREIGN KEY (id_envio) REFERENCES metodo_envio(id_envio) ON DELETE CASCADE,
    CONSTRAINT com_met_env_unq UNIQUE (id_comercio, id_envio)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_comercio_met_pago_com ON comercio_metodo_pago(id_comercio);
CREATE INDEX IF NOT EXISTS idx_comercio_met_env_com ON comercio_metodo_envio(id_comercio);
