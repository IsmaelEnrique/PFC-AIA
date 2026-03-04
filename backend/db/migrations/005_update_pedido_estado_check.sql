-- Update pedido.estado check to allow new states
ALTER TABLE pedido DROP CONSTRAINT IF EXISTS pedido_estado_check;

ALTER TABLE pedido ADD CONSTRAINT pedido_estado_check CHECK (estado IN (
  'Pendiente',
  'En preparación',
  'Enviado',
  'Entregado',
  'Cancelado',
  'En espera',
  'Confirmado',
  'Retirado'
));
