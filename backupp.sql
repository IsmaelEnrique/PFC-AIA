--
-- PostgreSQL database dump
--



-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-02-26 12:31:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 16735)
-- Name: caracteristica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caracteristica (
    id_caracteristica integer NOT NULL,
    nombre_caracteristica character varying(50) NOT NULL,
    id_comercio integer NOT NULL
);


ALTER TABLE public.caracteristica OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16734)
-- Name: caracteristica_id_caracteristica_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caracteristica_id_caracteristica_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caracteristica_id_caracteristica_seq OWNER TO postgres;

--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 227
-- Name: caracteristica_id_caracteristica_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caracteristica_id_caracteristica_seq OWNED BY public.caracteristica.id_caracteristica;


--
-- TOC entry 247 (class 1259 OID 17061)
-- Name: carrito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrito (
    id_carrito integer NOT NULL,
    id_consumidor integer,
    id_comercio integer NOT NULL,
    subtotal numeric(10,2)
);


ALTER TABLE public.carrito OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 17060)
-- Name: carrito_id_carrito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrito_id_carrito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrito_id_carrito_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 246
-- Name: carrito_id_carrito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrito_id_carrito_seq OWNED BY public.carrito.id_carrito;


--
-- TOC entry 222 (class 1259 OID 16708)
-- Name: categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria (
    id_categoria integer NOT NULL,
    nombre_cat character varying(50) NOT NULL,
    id_comercio integer NOT NULL
);


ALTER TABLE public.categoria OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16707)
-- Name: categoria_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoria_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_id_categoria_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 221
-- Name: categoria_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoria_id_categoria_seq OWNED BY public.categoria.id_categoria;


--
-- TOC entry 230 (class 1259 OID 16762)
-- Name: comercio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comercio (
    id_comercio integer NOT NULL,
    id_usuario integer NOT NULL,
    nombre_comercio character varying(50) NOT NULL,
    descripcion character varying(100),
    cuit character(11),
    "tipo_diseño" character varying(50),
    logo character varying(200),
    activo boolean DEFAULT false NOT NULL,
    rubro character varying(50),
    direccion character varying(100),
    contacto character varying(50),
    slug character varying(255)
);


ALTER TABLE public.comercio OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16761)
-- Name: comercio_id_comercio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comercio_id_comercio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comercio_id_comercio_seq OWNER TO postgres;

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 229
-- Name: comercio_id_comercio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comercio_id_comercio_seq OWNED BY public.comercio.id_comercio;


--
-- TOC entry 245 (class 1259 OID 17041)
-- Name: consumidor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consumidor (
    id_consumidor integer NOT NULL,
    id_comercio integer NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL,
    mail character varying(100) NOT NULL,
    contrasena character varying(100) NOT NULL
);


ALTER TABLE public.consumidor OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 17040)
-- Name: consumidor_id_consumidor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consumidor_id_consumidor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consumidor_id_consumidor_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 244
-- Name: consumidor_id_consumidor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consumidor_id_consumidor_seq OWNED BY public.consumidor.id_consumidor;


--
-- TOC entry 240 (class 1259 OID 16952)
-- Name: detalle_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_pedido (
    id_detallepedido integer NOT NULL,
    id_pedido integer NOT NULL,
    id_producto integer NOT NULL,
    cantidad integer NOT NULL,
    precio numeric(10,2) NOT NULL
);


ALTER TABLE public.detalle_pedido OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16951)
-- Name: detalle_pedido_id_detallepedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_pedido_id_detallepedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pedido_id_detallepedido_seq OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 239
-- Name: detalle_pedido_id_detallepedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_pedido_id_detallepedido_seq OWNED BY public.detalle_pedido.id_detallepedido;


--
-- TOC entry 238 (class 1259 OID 16871)
-- Name: m_n_cat_prod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_n_cat_prod (
    id_cat_prod integer NOT NULL,
    id_producto integer NOT NULL,
    id_categoria integer NOT NULL
);


ALTER TABLE public.m_n_cat_prod OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16870)
-- Name: m_n_cat_prod_id_cat_prod_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.m_n_cat_prod_id_cat_prod_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.m_n_cat_prod_id_cat_prod_seq OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 237
-- Name: m_n_cat_prod_id_cat_prod_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.m_n_cat_prod_id_cat_prod_seq OWNED BY public.m_n_cat_prod.id_cat_prod;


--
-- TOC entry 248 (class 1259 OID 17079)
-- Name: m_n_prod_carrito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.m_n_prod_carrito (
    id_carrito integer NOT NULL,
    id_producto integer NOT NULL,
    id_variante integer,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL
);


ALTER TABLE public.m_n_prod_carrito OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16726)
-- Name: metodo_envio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metodo_envio (
    id_envio integer NOT NULL,
    nombre_envio character varying(50) NOT NULL,
    descripcion character varying(100)
);


ALTER TABLE public.metodo_envio OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16725)
-- Name: metodo_envio_id_envio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metodo_envio_id_envio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metodo_envio_id_envio_seq OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 225
-- Name: metodo_envio_id_envio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metodo_envio_id_envio_seq OWNED BY public.metodo_envio.id_envio;


--
-- TOC entry 224 (class 1259 OID 16717)
-- Name: metodo_pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metodo_pago (
    id_pago integer NOT NULL,
    nombre_pago character varying(50) NOT NULL,
    descripcion character varying(100)
);


ALTER TABLE public.metodo_pago OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16716)
-- Name: metodo_pago_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metodo_pago_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metodo_pago_id_pago_seq OWNER TO postgres;

--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 223
-- Name: metodo_pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metodo_pago_id_pago_seq OWNED BY public.metodo_pago.id_pago;


--
-- TOC entry 236 (class 1259 OID 16826)
-- Name: pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido (
    id_pedido integer NOT NULL,
    numero_pedido character varying(20) NOT NULL,
    id_carrito integer NOT NULL,
    id_consumidor integer NOT NULL,
    id_comercio integer NOT NULL,
    fecha date NOT NULL,
    total numeric(10,2) NOT NULL,
    id_pago integer NOT NULL,
    id_envio integer NOT NULL,
    estado character varying(30) NOT NULL,
    CONSTRAINT pedido_estado_check CHECK (((estado)::text = ANY ((ARRAY['Pendiente'::character varying, 'En preparación'::character varying, 'Enviado'::character varying, 'Entregado'::character varying, 'Cancelado'::character varying])::text[])))
);


ALTER TABLE public.pedido OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16825)
-- Name: pedido_id_pedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_id_pedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedido_id_pedido_seq OWNER TO postgres;

--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 235
-- Name: pedido_id_pedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_id_pedido_seq OWNED BY public.pedido.id_pedido;


--
-- TOC entry 234 (class 1259 OID 16809)
-- Name: producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto (
    id_producto integer NOT NULL,
    id_comercio integer NOT NULL,
    nombre character varying(50) NOT NULL,
    codigo character varying(20) NOT NULL,
    foto character varying(200),
    descripcion character varying(200),
    activo boolean NOT NULL
);


ALTER TABLE public.producto OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16808)
-- Name: producto_id_producto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producto_id_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.producto_id_producto_seq OWNER TO postgres;

--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 233
-- Name: producto_id_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producto_id_producto_seq OWNED BY public.producto.id_producto;


--
-- TOC entry 220 (class 1259 OID 16694)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    mail character varying(100) NOT NULL,
    contrasena character varying(100) NOT NULL,
    verificado boolean NOT NULL,
    cta_bancaria character(20),
    dni character(10),
    nombre_banco character varying(50),
    nombre_titular character varying(50)
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16693)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- TOC entry 232 (class 1259 OID 16779)
-- Name: valor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.valor (
    id_valor integer NOT NULL,
    id_caracteristica integer NOT NULL,
    nombre_valor character varying(50) NOT NULL
);


ALTER TABLE public.valor OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16778)
-- Name: valor_id_valor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.valor_id_valor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.valor_id_valor_seq OWNER TO postgres;

--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 231
-- Name: valor_id_valor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.valor_id_valor_seq OWNED BY public.valor.id_valor;


--
-- TOC entry 242 (class 1259 OID 16989)
-- Name: variante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variante (
    id_variante integer NOT NULL,
    id_producto integer NOT NULL,
    precio numeric(10,2) NOT NULL,
    stock integer NOT NULL
);


ALTER TABLE public.variante OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16988)
-- Name: variante_id_variante_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.variante_id_variante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.variante_id_variante_seq OWNER TO postgres;

--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 241
-- Name: variante_id_variante_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.variante_id_variante_seq OWNED BY public.variante.id_variante;


--
-- TOC entry 243 (class 1259 OID 17004)
-- Name: variante_valor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variante_valor (
    id_variante integer NOT NULL,
    id_valor integer NOT NULL
);


ALTER TABLE public.variante_valor OWNER TO postgres;

--
-- TOC entry 4832 (class 2604 OID 16738)
-- Name: caracteristica id_caracteristica; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caracteristica ALTER COLUMN id_caracteristica SET DEFAULT nextval('public.caracteristica_id_caracteristica_seq'::regclass);


--
-- TOC entry 4842 (class 2604 OID 17064)
-- Name: carrito id_carrito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito ALTER COLUMN id_carrito SET DEFAULT nextval('public.carrito_id_carrito_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 16711)
-- Name: categoria id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria ALTER COLUMN id_categoria SET DEFAULT nextval('public.categoria_id_categoria_seq'::regclass);


--
-- TOC entry 4833 (class 2604 OID 16765)
-- Name: comercio id_comercio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercio ALTER COLUMN id_comercio SET DEFAULT nextval('public.comercio_id_comercio_seq'::regclass);


--
-- TOC entry 4841 (class 2604 OID 17044)
-- Name: consumidor id_consumidor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumidor ALTER COLUMN id_consumidor SET DEFAULT nextval('public.consumidor_id_consumidor_seq'::regclass);


--
-- TOC entry 4839 (class 2604 OID 16955)
-- Name: detalle_pedido id_detallepedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido ALTER COLUMN id_detallepedido SET DEFAULT nextval('public.detalle_pedido_id_detallepedido_seq'::regclass);


--
-- TOC entry 4838 (class 2604 OID 16874)
-- Name: m_n_cat_prod id_cat_prod; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_n_cat_prod ALTER COLUMN id_cat_prod SET DEFAULT nextval('public.m_n_cat_prod_id_cat_prod_seq'::regclass);


--
-- TOC entry 4831 (class 2604 OID 16729)
-- Name: metodo_envio id_envio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodo_envio ALTER COLUMN id_envio SET DEFAULT nextval('public.metodo_envio_id_envio_seq'::regclass);


--
-- TOC entry 4830 (class 2604 OID 16720)
-- Name: metodo_pago id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodo_pago ALTER COLUMN id_pago SET DEFAULT nextval('public.metodo_pago_id_pago_seq'::regclass);


--
-- TOC entry 4837 (class 2604 OID 16829)
-- Name: pedido id_pedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id_pedido SET DEFAULT nextval('public.pedido_id_pedido_seq'::regclass);


--
-- TOC entry 4836 (class 2604 OID 16812)
-- Name: producto id_producto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto ALTER COLUMN id_producto SET DEFAULT nextval('public.producto_id_producto_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 16697)
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- TOC entry 4835 (class 2604 OID 16782)
-- Name: valor id_valor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valor ALTER COLUMN id_valor SET DEFAULT nextval('public.valor_id_valor_seq'::regclass);


--
-- TOC entry 4840 (class 2604 OID 16992)
-- Name: variante id_variante; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante ALTER COLUMN id_variante SET DEFAULT nextval('public.variante_id_variante_seq'::regclass);


--
-- TOC entry 5064 (class 0 OID 16735)
-- Dependencies: 228
-- Data for Name: caracteristica; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.caracteristica VALUES (2, 'Talle', 1);
INSERT INTO public.caracteristica VALUES (3, 'Color', 1);


--
-- TOC entry 5083 (class 0 OID 17061)
-- Dependencies: 247
-- Data for Name: carrito; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.carrito VALUES (1, 1, 1, 0.00);


--
-- TOC entry 5058 (class 0 OID 16708)
-- Dependencies: 222
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categoria VALUES (1, 'Zapatos', 1);
INSERT INTO public.categoria VALUES (3, 'Mochilas', 1);
INSERT INTO public.categoria VALUES (4, 'Prendas de ropa', 1);
INSERT INTO public.categoria VALUES (5, 'CDs', 4);


--
-- TOC entry 5066 (class 0 OID 16762)
-- Dependencies: 230
-- Data for Name: comercio; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.comercio VALUES (2, 2, 'ONE DIRECTION', 'jjjjjjjjj', NULL, NULL, NULL, true, 'indumentaria', NULL, NULL, NULL);
INSERT INTO public.comercio VALUES (3, 5, 'A', NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL);
INSERT INTO public.comercio VALUES (4, 3, 'reputation', 'musica dea', '205578976  ', '3', '/uploads/imagen-1771004091894-422447543.png', true, 'otro', 'nueva york 2233', NULL, 'reputation');
INSERT INTO public.comercio VALUES (1, 1, 'aaaaaaa28', 'Las mochilas y carteras mas cool', '777558888  ', '3', '/uploads/imagen-1769532277726-483702905.png', true, NULL, 'aaaaaaa 45457', '3425878787', 'comerciopri');


--
-- TOC entry 5081 (class 0 OID 17041)
-- Dependencies: 245
-- Data for Name: consumidor; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.consumidor VALUES (1, 1, 'Bad', 'Bunny', 'badbunny@gmail.com', '$2b$10$D5YI2OXLFxP0k8Rr.Ef.beel0MDMzZX17La2wOoslp9RmcNghFjBS');


--
-- TOC entry 5076 (class 0 OID 16952)
-- Dependencies: 240
-- Data for Name: detalle_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5074 (class 0 OID 16871)
-- Dependencies: 238
-- Data for Name: m_n_cat_prod; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.m_n_cat_prod VALUES (7, 1, 3);
INSERT INTO public.m_n_cat_prod VALUES (8, 9, 1);
INSERT INTO public.m_n_cat_prod VALUES (11, 10, 1);
INSERT INTO public.m_n_cat_prod VALUES (12, 8, 1);
INSERT INTO public.m_n_cat_prod VALUES (14, 11, 3);
INSERT INTO public.m_n_cat_prod VALUES (15, 12, 4);
INSERT INTO public.m_n_cat_prod VALUES (16, 13, 4);


--
-- TOC entry 5084 (class 0 OID 17079)
-- Dependencies: 248
-- Data for Name: m_n_prod_carrito; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5062 (class 0 OID 16726)
-- Dependencies: 226
-- Data for Name: metodo_envio; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5060 (class 0 OID 16717)
-- Dependencies: 224
-- Data for Name: metodo_pago; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5072 (class 0 OID 16826)
-- Dependencies: 236
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5070 (class 0 OID 16809)
-- Dependencies: 234
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.producto VALUES (1, 1, 'Cartera Gutti', '455', NULL, 'jjjjjjjj', true);
INSERT INTO public.producto VALUES (9, 1, 'Zapato LALA', '6656', '/uploads/imagen-1769529629146-149451636.jpg', NULL, true);
INSERT INTO public.producto VALUES (10, 1, 'pepe', '777', NULL, '', true);
INSERT INTO public.producto VALUES (8, 1, 'PPP', '9639', '/uploads/imagen-1769527800065-106042048.jpg', 'dsiooso', true);
INSERT INTO public.producto VALUES (11, 1, 'Cartera ALMA', '9999', '/uploads/imagen-1769616328059-985845264.jpg', '', true);
INSERT INTO public.producto VALUES (12, 1, 'Remera Goku', '88887', '/uploads/imagen-1769984862246-887793938.png', 'pipippii', true);
INSERT INTO public.producto VALUES (13, 1, 'Prueba', '0101', NULL, NULL, true);
INSERT INTO public.producto VALUES (14, 4, 'cd reputation', '1414', '/uploads/imagen-1771005239853-930896603.jpg', '', true);


--
-- TOC entry 5056 (class 0 OID 16694)
-- Dependencies: 220
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuario VALUES (2, 'Styles Harry', 'hs@gmail.com', '$2b$10$p1FifetvO2aZ4SfOuSv0i.0MuoWb/AMyF5x7KWe/VQ8AFFJ32KO6S', false, NULL, NULL, NULL, NULL);
INSERT INTO public.usuario VALUES (3, 'Swift Taylor', 'taylor@gmail.com', '$2b$10$bdjCNDFryeVaxToClWv7..dY/OO69.N1HTlORXJF2w.ayieUexFI6', false, NULL, NULL, NULL, NULL);
INSERT INTO public.usuario VALUES (4, 'Lalo Lola', 'lola@gmail.com', '$2b$10$XTwi4tM3gnIrzzPx4eABV.THcCu9cmgpPr8LfSmW0.OS.PNQwCx1G', false, NULL, NULL, NULL, NULL);
INSERT INTO public.usuario VALUES (5, 'Bb Aa', 'a@gmail.com', '$2b$10$sGq3VqJGgJ2DItfFFKZ5qer0sJszo8r7mzyLOXWxIicqI4pg.4MUK', false, NULL, NULL, NULL, NULL);
INSERT INTO public.usuario VALUES (1, 'Rouiller Priscila', 'pripri@gmail.com', '$2b$10$fhET3mRxJZge45QmiQY4NeJZ1ecGA9Bt/bn9fRcLPfHbl4caBsV/.', false, 'aaaaaaa             ', NULL, 'aaaaaaaaaaa', 'bbbbb');
INSERT INTO public.usuario VALUES (6, 'Ala Ramona', 'ramona@gmail.com', '$2b$10$BVXTfogluyTz3kdrqg2P3esIno5qei7mUZqzafFO1JKnEQ2emgg8.', false, NULL, NULL, NULL, NULL);


--
-- TOC entry 5068 (class 0 OID 16779)
-- Dependencies: 232
-- Data for Name: valor; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.valor VALUES (1, 2, 'S');
INSERT INTO public.valor VALUES (2, 2, 'M');
INSERT INTO public.valor VALUES (3, 2, 'L');
INSERT INTO public.valor VALUES (4, 3, 'Rojo');
INSERT INTO public.valor VALUES (5, 3, 'Verde');
INSERT INTO public.valor VALUES (6, 3, 'Amarillo');
INSERT INTO public.valor VALUES (7, 3, 'Rosa-Marron');
INSERT INTO public.valor VALUES (8, 3, 'Verde-Negro');


--
-- TOC entry 5078 (class 0 OID 16989)
-- Dependencies: 242
-- Data for Name: variante; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.variante VALUES (1, 9, 5000.00, 3);
INSERT INTO public.variante VALUES (8, 10, 5000.00, 3);
INSERT INTO public.variante VALUES (9, 10, 6000.00, 3);
INSERT INTO public.variante VALUES (10, 8, 5000.00, 3);
INSERT INTO public.variante VALUES (11, 8, 5000.00, 3);
INSERT INTO public.variante VALUES (14, 11, 4000.00, 5);
INSERT INTO public.variante VALUES (15, 11, 4000.00, 5);
INSERT INTO public.variante VALUES (16, 12, 8000.00, 20);
INSERT INTO public.variante VALUES (17, 12, 8000.00, 25);
INSERT INTO public.variante VALUES (18, 13, 10000.00, 10);
INSERT INTO public.variante VALUES (21, 14, 15000.00, 100);


--
-- TOC entry 5079 (class 0 OID 17004)
-- Dependencies: 243
-- Data for Name: variante_valor; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.variante_valor VALUES (8, 3);
INSERT INTO public.variante_valor VALUES (9, 2);
INSERT INTO public.variante_valor VALUES (10, 4);
INSERT INTO public.variante_valor VALUES (11, 6);
INSERT INTO public.variante_valor VALUES (14, 7);
INSERT INTO public.variante_valor VALUES (15, 8);
INSERT INTO public.variante_valor VALUES (16, 4);
INSERT INTO public.variante_valor VALUES (17, 6);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 227
-- Name: caracteristica_id_caracteristica_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caracteristica_id_caracteristica_seq', 3, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 246
-- Name: carrito_id_carrito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrito_id_carrito_seq', 1, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 221
-- Name: categoria_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoria_id_categoria_seq', 5, true);


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 229
-- Name: comercio_id_comercio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comercio_id_comercio_seq', 4, true);


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 244
-- Name: consumidor_id_consumidor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consumidor_id_consumidor_seq', 1, true);


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 239
-- Name: detalle_pedido_id_detallepedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_pedido_id_detallepedido_seq', 1, false);


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 237
-- Name: m_n_cat_prod_id_cat_prod_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.m_n_cat_prod_id_cat_prod_seq', 16, true);


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 225
-- Name: metodo_envio_id_envio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metodo_envio_id_envio_seq', 1, false);


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 223
-- Name: metodo_pago_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metodo_pago_id_pago_seq', 1, false);


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 235
-- Name: pedido_id_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_id_pedido_seq', 1, false);


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 233
-- Name: producto_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producto_id_producto_seq', 14, true);


--
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 9, true);


--
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 231
-- Name: valor_id_valor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.valor_id_valor_seq', 8, true);


--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 241
-- Name: variante_id_variante_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.variante_id_variante_seq', 21, true);


--
-- TOC entry 4855 (class 2606 OID 16742)
-- Name: caracteristica caracteristica_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caracteristica
    ADD CONSTRAINT caracteristica_pk PRIMARY KEY (id_caracteristica);


--
-- TOC entry 4883 (class 2606 OID 17068)
-- Name: carrito carrito_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_pk PRIMARY KEY (id_carrito);


--
-- TOC entry 4849 (class 2606 OID 16715)
-- Name: categoria categoria_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pk PRIMARY KEY (id_categoria);


--
-- TOC entry 4857 (class 2606 OID 16772)
-- Name: comercio comercio_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercio
    ADD CONSTRAINT comercio_pk PRIMARY KEY (id_comercio);


--
-- TOC entry 4859 (class 2606 OID 17022)
-- Name: comercio comercio_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercio
    ADD CONSTRAINT comercio_slug_key UNIQUE (slug);


--
-- TOC entry 4877 (class 2606 OID 17054)
-- Name: consumidor consumidor_mail_comercio_uk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumidor
    ADD CONSTRAINT consumidor_mail_comercio_uk UNIQUE (mail, id_comercio);


--
-- TOC entry 4879 (class 2606 OID 17052)
-- Name: consumidor consumidor_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumidor
    ADD CONSTRAINT consumidor_pk PRIMARY KEY (id_consumidor);


--
-- TOC entry 4871 (class 2606 OID 16962)
-- Name: detalle_pedido detalle_pedido_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_pk PRIMARY KEY (id_detallepedido);


--
-- TOC entry 4869 (class 2606 OID 16879)
-- Name: m_n_cat_prod m_n_cat_prod_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_n_cat_prod
    ADD CONSTRAINT m_n_cat_prod_pk PRIMARY KEY (id_cat_prod);


--
-- TOC entry 4887 (class 2606 OID 17087)
-- Name: m_n_prod_carrito m_n_prod_carrito_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_n_prod_carrito
    ADD CONSTRAINT m_n_prod_carrito_pk PRIMARY KEY (id_carrito, id_producto);


--
-- TOC entry 4853 (class 2606 OID 16733)
-- Name: metodo_envio metodo_envio_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodo_envio
    ADD CONSTRAINT metodo_envio_pk PRIMARY KEY (id_envio);


--
-- TOC entry 4851 (class 2606 OID 16724)
-- Name: metodo_pago metodo_pago_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodo_pago
    ADD CONSTRAINT metodo_pago_pk PRIMARY KEY (id_pago);


--
-- TOC entry 4865 (class 2606 OID 16844)
-- Name: pedido pedido_numero_uk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_numero_uk UNIQUE (numero_pedido);


--
-- TOC entry 4867 (class 2606 OID 16842)
-- Name: pedido pedido_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pk PRIMARY KEY (id_pedido);


--
-- TOC entry 4863 (class 2606 OID 16819)
-- Name: producto producto_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pk PRIMARY KEY (id_producto);


--
-- TOC entry 4845 (class 2606 OID 16706)
-- Name: usuario usuario_mail_uk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_mail_uk UNIQUE (mail);


--
-- TOC entry 4847 (class 2606 OID 16704)
-- Name: usuario usuario_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pk PRIMARY KEY (id_usuario);


--
-- TOC entry 4861 (class 2606 OID 16787)
-- Name: valor valor_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valor
    ADD CONSTRAINT valor_pk PRIMARY KEY (id_valor);


--
-- TOC entry 4873 (class 2606 OID 16998)
-- Name: variante variante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante
    ADD CONSTRAINT variante_pkey PRIMARY KEY (id_variante);


--
-- TOC entry 4875 (class 2606 OID 17010)
-- Name: variante_valor variante_valor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante_valor
    ADD CONSTRAINT variante_valor_pkey PRIMARY KEY (id_variante, id_valor);


--
-- TOC entry 4884 (class 1259 OID 17099)
-- Name: idx_carrito_comercio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carrito_comercio ON public.carrito USING btree (id_comercio);


--
-- TOC entry 4885 (class 1259 OID 17098)
-- Name: idx_carrito_consumidor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carrito_consumidor ON public.carrito USING btree (id_consumidor);


--
-- TOC entry 4880 (class 1259 OID 17100)
-- Name: idx_consumidor_comercio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumidor_comercio ON public.consumidor USING btree (id_comercio);


--
-- TOC entry 4881 (class 1259 OID 17101)
-- Name: idx_consumidor_mail; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consumidor_mail ON public.consumidor USING btree (mail);


--
-- TOC entry 4889 (class 2606 OID 16983)
-- Name: caracteristica carac_fk_comercio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caracteristica
    ADD CONSTRAINT carac_fk_comercio FOREIGN KEY (id_comercio) REFERENCES public.comercio(id_comercio);


--
-- TOC entry 4904 (class 2606 OID 17074)
-- Name: carrito carrito_fk_comercio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_fk_comercio FOREIGN KEY (id_comercio) REFERENCES public.comercio(id_comercio);


--
-- TOC entry 4905 (class 2606 OID 17069)
-- Name: carrito carrito_fk_consumidor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrito
    ADD CONSTRAINT carrito_fk_consumidor FOREIGN KEY (id_consumidor) REFERENCES public.consumidor(id_consumidor);


--
-- TOC entry 4888 (class 2606 OID 16977)
-- Name: categoria categoria_fk_comercio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_fk_comercio FOREIGN KEY (id_comercio) REFERENCES public.comercio(id_comercio);


--
-- TOC entry 4890 (class 2606 OID 16773)
-- Name: comercio comercio_fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comercio
    ADD CONSTRAINT comercio_fk_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4903 (class 2606 OID 17055)
-- Name: consumidor consumidor_fk_comercio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consumidor
    ADD CONSTRAINT consumidor_fk_comercio FOREIGN KEY (id_comercio) REFERENCES public.comercio(id_comercio);


--
-- TOC entry 4898 (class 2606 OID 16963)
-- Name: detalle_pedido detalle_pedido_fk_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_fk_pedido FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido);


--
-- TOC entry 4899 (class 2606 OID 16968)
-- Name: detalle_pedido detalle_pedido_fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_fk_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- TOC entry 4896 (class 2606 OID 16885)
-- Name: m_n_cat_prod m_n_cat_prod_fk_categoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_n_cat_prod
    ADD CONSTRAINT m_n_cat_prod_fk_categoria FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria);


--
-- TOC entry 4897 (class 2606 OID 16880)
-- Name: m_n_cat_prod m_n_cat_prod_fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_n_cat_prod
    ADD CONSTRAINT m_n_cat_prod_fk_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- TOC entry 4906 (class 2606 OID 17088)
-- Name: m_n_prod_carrito m_n_prod_carrito_fk_carrito; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_n_prod_carrito
    ADD CONSTRAINT m_n_prod_carrito_fk_carrito FOREIGN KEY (id_carrito) REFERENCES public.carrito(id_carrito) ON DELETE CASCADE;


--
-- TOC entry 4907 (class 2606 OID 17093)
-- Name: m_n_prod_carrito m_n_prod_carrito_fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.m_n_prod_carrito
    ADD CONSTRAINT m_n_prod_carrito_fk_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- TOC entry 4893 (class 2606 OID 16855)
-- Name: pedido pedido_fk_comercio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_fk_comercio FOREIGN KEY (id_comercio) REFERENCES public.comercio(id_comercio);


--
-- TOC entry 4894 (class 2606 OID 16865)
-- Name: pedido pedido_fk_envio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_fk_envio FOREIGN KEY (id_envio) REFERENCES public.metodo_envio(id_envio);


--
-- TOC entry 4895 (class 2606 OID 16860)
-- Name: pedido pedido_fk_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_fk_pago FOREIGN KEY (id_pago) REFERENCES public.metodo_pago(id_pago);


--
-- TOC entry 4892 (class 2606 OID 16820)
-- Name: producto producto_fk_comercio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_fk_comercio FOREIGN KEY (id_comercio) REFERENCES public.comercio(id_comercio);


--
-- TOC entry 4891 (class 2606 OID 16788)
-- Name: valor valor_fk_caracteristica; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.valor
    ADD CONSTRAINT valor_fk_caracteristica FOREIGN KEY (id_caracteristica) REFERENCES public.caracteristica(id_caracteristica);


--
-- TOC entry 4900 (class 2606 OID 16999)
-- Name: variante variante_fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante
    ADD CONSTRAINT variante_fk_producto FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto);


--
-- TOC entry 4901 (class 2606 OID 17016)
-- Name: variante_valor variante_valor_fk_valor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante_valor
    ADD CONSTRAINT variante_valor_fk_valor FOREIGN KEY (id_valor) REFERENCES public.valor(id_valor);


--
-- TOC entry 4902 (class 2606 OID 17011)
-- Name: variante_valor variante_valor_fk_variante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variante_valor
    ADD CONSTRAINT variante_valor_fk_variante FOREIGN KEY (id_variante) REFERENCES public.variante(id_variante);


-- Completed on 2026-02-26 12:31:50

--
-- PostgreSQL database dump complete
--

