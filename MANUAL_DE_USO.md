# Manual De Uso Del Sistema - Emprendify

Este manual explica, en forma practica, como usar la plataforma Emprendify para operar una tienda online. Esta pensado para dos perfiles: quien administra un comercio y quien compra como consumidor.

## 1. Objetivo Del Manual

El objetivo de este documento es guiar paso a paso los flujos mas importantes del sistema y aclarar que resultado deberia obtenerse en cada etapa.

Perfiles cubiertos:

- Usuario Administrador (comerciante)
- Usuario Consumidor (cliente de la tienda)

Flujos cubiertos:

- Registro e inicio de sesion
- Configuracion de tienda
- Gestion de productos, variantes y stock
- Carrito, checkout y confirmacion de pedido
- Seguimiento de pedidos

## 2. Requisitos Previos

Antes de usar el sistema, verificar que el entorno este operativo:

- Frontend activo (por defecto: `http://localhost:5173`)
- Backend activo (por defecto: `http://localhost:4000`)
- Base de datos conectada
- Variables de entorno cargadas para autenticacion, mail, pagos y base de datos

Si algun servicio no esta activo, algunos modulos pueden abrir pero no guardar informacion.

## 3. Mapa General De Uso

La plataforma separa dos experiencias:

- Experiencia de administrador: alta y gestion de comercio desde el panel interno.
- Experiencia de consumidor: navegacion y compra en la tienda publica.

Importante: administrador y consumidor no son el mismo tipo de usuario. Cada uno tiene su propio flujo de acceso y permisos.

## 4. Manual Para Usuario Administrador

El administrador es quien configura su comercio y controla catalogo, pedidos y datos del negocio.

### 4.1 Registro E Inicio De Sesion Del Administrador

1. Ingresar a la pagina principal.
2. Ir a `Registrarse` (`/register`) si no tiene cuenta.
3. Completar email y contrasena.
4. Si llega mail de activacion, confirmar la cuenta.
5. Ingresar desde `Iniciar sesion` (`/login`).
6. Al validar credenciales, el sistema redirige al panel (`/admin`).

Resultado esperado:

- Sesion activa como administrador.
- Acceso a modulos de configuracion y gestion.

### 4.2 Activacion Del Comercio Y Datos Generales

Una vez dentro del panel:

1. Ir a `Activar comercio` (`/activar-comercio`).
2. Completar informacion principal:
   - Nombre del comercio
   - Rubro
   - Descripcion
   - Contacto
   - Direccion
   - Slug (url publica de la tienda)
3. Guardar configuracion.

Opcional:

- Cargar logo (`/cargar-logo`).
- Elegir diseno de tienda (`/disenar-pagina`).

Resultado esperado:

- Comercio activo y visible por url publica.
- Identidad visual configurada.

### 4.3 Gestion De Categorias

Desde `Gestion categorias` (`/gestion-categorias`):

1. Crear categorias para ordenar productos.
2. Editar nombres de categorias existentes.
3. Eliminar categorias en desuso.

Recomendacion:

- Definir categorias claras (ejemplo: Remeras, Accesorios, Promociones) para mejorar busqueda y filtrado.

### 4.4 Gestion De Productos Y Variantes

Desde `Gestion productos` (`/gestion-productos`) o `Agregar producto` (`/agregar-producto`):

1. Crear producto base con nombre, codigo, descripcion, imagen y categoria.
2. Si corresponde, agregar variantes (ejemplo: talle, color, presentacion).
3. Definir precio y stock para cada variante.
4. Guardar y revisar visualizacion en tienda publica.

Reglas de disponibilidad:

- Producto activo: se muestra al consumidor.
- Producto inactivo: no se muestra en la tienda publica.
- Producto visible sin stock temporal: el cliente puede verlo, pero no puede sumarlo al carrito.

Resultado esperado:

- Catalogo actualizado y consistente con disponibilidad real.

### 4.5 Configuracion De Metodos De Pago Y Envio

Desde `Metodos de pago y envio` (`/metodos-pago-envio`):

1. Seleccionar metodos de pago habilitados para la tienda.
2. Configurar modalidades de entrega:
   - Retiro por el local
   - Envio
3. Guardar configuracion.

Resultado esperado:

- El consumidor ve y puede usar solo las opciones habilitadas por el comercio.

### 4.6 Gestion Y Seguimiento De Pedidos

Desde `Seguimiento pedidos` (`/seguimiento-pedidos`):

1. Ver listado de pedidos del comercio.
2. Abrir detalle para revisar productos, cantidades y total.
3. Actualizar el estado del pedido segun etapa:
   - En espera
   - Confirmado
   - En preparacion
   - Enviado
   - Entregado
   - Cancelado
4. Guardar cambios.

Resultado esperado:

- El comprador puede seguir el estado actualizado de su pedido.

### 4.7 Buenas Practicas Para Administrador

- Mantener stock al dia para evitar sobreventa.
- Usar estado inactivo para productos discontinuados.
- Revisar pedidos diariamente.
- Confirmar periodicamente que metodos de pago y envio esten correctamente activos.
- Probar tienda publica luego de cambios grandes de catalogo.

## 5. Manual Para Usuario Consumidor

El consumidor es el cliente final que compra dentro de una tienda especifica.

### 5.1 Acceso A La Tienda Publica

1. Ingresar a la url publica de la tienda (`/tienda/:slug`).
2. Recorrer categorias y listado de productos.
3. Entrar al detalle de producto (`/tienda/:slug/producto/:id`) para ver informacion completa.

Resultado esperado:

- Visualizacion de productos disponibles segun configuracion del comercio.

### 5.2 Registro E Inicio De Sesion Del Consumidor

1. Desde la tienda, abrir login/registro de cliente.
2. Completar email y contrasena.
3. Si aplica, verificar cuenta por email.
4. Iniciar sesion para continuar la compra.

Importante:

- El consumidor se autentica en el contexto de una tienda concreta.

### 5.3 Seleccion De Productos

1. Buscar por categoria o palabra clave.
2. Revisar detalle del producto.
3. Si el producto tiene variantes, seleccionar una opcion antes de agregar.
4. Agregar al carrito.

Comportamientos esperados:

- Si no se selecciona variante en un producto que la requiere, no se agrega al carrito.
- Si la variante esta sin stock, el producto puede verse pero no comprarse.

### 5.4 Uso Del Carrito

1. Abrir carrito.
2. Revisar items y cantidades.
3. Modificar cantidades segun necesidad.
4. Eliminar items no deseados.
5. Verificar subtotal y total antes de continuar.

Resultado esperado:

- El carrito refleja en tiempo real precios y cantidades seleccionadas.

### 5.5 Checkout Y Confirmacion De Compra

1. Ir al checkout (`/tienda/:slug/checkout`).
2. Completar datos de entrega si corresponde.
3. Elegir metodo de pago.
4. Elegir modalidad de envio/retiro.
5. Confirmar pedido.
6. Revisar pantalla de confirmacion (`/tienda/:slug/pedido/:id`).

Resultado esperado:

- Pedido creado correctamente y disponible para seguimiento.

### 5.6 Seguimiento Del Pedido

1. Abrir historial/seguimiento.
2. Consultar estado del pedido actualizado por el comercio.
3. Verificar avance hasta entrega o retiro.

## 6. Problemas Frecuentes Y Soluciones

### 6.1 No puedo iniciar sesion

Verificar:

- Email y contrasena correctos.
- Cuenta activada por mail.
- Si es consumidor, que este ingresando en la tienda correcta.

### 6.2 No veo un producto que antes estaba

Posibles causas:

- Producto marcado como inactivo por el administrador.
- Filtro o categoria activa no coincide con ese producto.

### 6.3 No puedo agregar un producto al carrito

Posibles causas:

- Falta seleccionar variante.
- Variante sin stock.
- Producto no disponible para venta.

### 6.4 El pago no se completa

Verificar:

- Conexion a internet.
- Disponibilidad de la pasarela de pago.
- Metodo de pago habilitado en el comercio.

## 7. Recomendaciones De Operacion

- Probar los flujos criticos despues de cambios funcionales.
- Registrar incidencias y soluciones para soporte futuro.
- Mantener actualizado el entorno de despliegue.
- Revisar periodicamente configuraciones de seguridad y credenciales.

## 8. Control Del Documento

- Proyecto: Emprendify (PFC-AIA)
- Tipo: Manual de uso funcional
- Perfiles: Administrador y Consumidor
- Estado: Version operativa para presentacion y uso interno
