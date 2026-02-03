-- Script para verificar y limpiar usuarios
-- Ejecutar en la base de datos ecommerce

-- 1. Ver todos los usuarios y si son administradores o consumidores
SELECT 
    u.id_usuario,
    u.nombre_usuario,
    u.mail,
    CASE 
        WHEN a.id_administrador IS NOT NULL THEN 'ADMINISTRADOR'
        WHEN c.id_consumidor IS NOT NULL THEN 'CONSUMIDOR'
        ELSE 'SIN ROL'
    END as tipo_usuario,
    a.id_administrador,
    c.id_consumidor
FROM usuario u
LEFT JOIN administrador a ON u.id_usuario = a.id_usuario
LEFT JOIN consumidor c ON u.id_usuario = c.id_usuario
ORDER BY u.id_usuario;

-- 2. Encontrar usuarios SIN ROL (ni administrador ni consumidor)
-- ESTOS SON LOS PROBLEMÁTICOS
SELECT 
    u.id_usuario,
    u.nombre_usuario,
    u.mail
FROM usuario u
LEFT JOIN administrador a ON u.id_usuario = a.id_usuario
LEFT JOIN consumidor c ON u.id_usuario = c.id_usuario
WHERE a.id_administrador IS NULL AND c.id_consumidor IS NULL;

-- 3. BORRAR usuarios sin rol (DESCOMENTA PARA EJECUTAR)
-- DELETE FROM usuario
-- WHERE id_usuario IN (
--     SELECT u.id_usuario
--     FROM usuario u
--     LEFT JOIN administrador a ON u.id_usuario = a.id_usuario
--     LEFT JOIN consumidor c ON u.id_usuario = c.id_usuario
--     WHERE a.id_administrador IS NULL AND c.id_consumidor IS NULL
-- );

-- 4. Ver todos los consumidores con sus datos
SELECT 
    c.id_consumidor,
    c.id_usuario,
    u.nombre_usuario,
    u.mail,
    u.verificado
FROM consumidor c
JOIN usuario u ON c.id_usuario = u.id_usuario;
