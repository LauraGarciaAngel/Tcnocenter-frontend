--
-- PostgreSQL database dump
--

\restrict Cd1ZxWM5lNUjbucgAJ6NshWddVHyG8ADOp4DRXO6DaxODYEzR9BFe7KnjxwcHoi

-- Dumped from database version 18.7
-- Dumped by pg_dump version 18.7

-- Started on 2026-11-26 15:07:21

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

--
-- TOC entry 2 (class 3079 OID 16820)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 16982)
-- Name: carritos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carritos (
    id_carrito bigint NOT NULL,
    id_usuario bigint,
    cantidad integer DEFAULT 0,
    estado character varying(30) DEFAULT 'activo'::character varying,
    creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT carritos_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'abandonado'::character varying, 'convertido'::character varying])::text[])))
);


ALTER TABLE public.carritos OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16981)
-- Name: carritos_id_carrito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carritos_id_carrito_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carritos_id_carrito_seq OWNER TO postgres;

--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 236
-- Name: carritos_id_carrito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carritos_id_carrito_seq OWNED BY public.carritos.id_carrito;


--
-- TOC entry 225 (class 1259 OID 16860)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id_categoria integer NOT NULL,
    nombre character varying(255) NOT NULL,
    estado boolean DEFAULT true
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16859)
-- Name: categorias_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_categoria_seq OWNER TO postgres;

--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 224
-- Name: categorias_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_categoria_seq OWNED BY public.categorias.id_categoria;


--
-- TOC entry 229 (class 1259 OID 16884)
-- Name: colores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colores (
    id_color integer NOT NULL,
    nombre character varying(255) NOT NULL,
    codigo_hex character varying(7)
);


ALTER TABLE public.colores OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16883)
-- Name: colores_id_color_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.colores_id_color_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.colores_id_color_seq OWNER TO postgres;

--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 228
-- Name: colores_id_color_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.colores_id_color_seq OWNED BY public.colores.id_color;


--
-- TOC entry 227 (class 1259 OID 16872)
-- Name: etiquetas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etiquetas (
    id_etiqueta integer NOT NULL,
    nombre character varying(100) NOT NULL,
    color character varying(30),
    etiqueta_url character varying(255),
    estado boolean DEFAULT true
);


ALTER TABLE public.etiquetas OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16871)
-- Name: etiquetas_id_etiqueta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etiquetas_id_etiqueta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etiquetas_id_etiqueta_seq OWNER TO postgres;

--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 226
-- Name: etiquetas_id_etiqueta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etiquetas_id_etiqueta_seq OWNED BY public.etiquetas.id_etiqueta;


--
-- TOC entry 239 (class 1259 OID 17000)
-- Name: items_carritos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items_carritos (
    id_item_carrito bigint NOT NULL,
    id_carrito bigint NOT NULL,
    producto_color_id integer NOT NULL,
    cantidad integer DEFAULT 1 NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT items_carritos_cantidad_check CHECK ((cantidad > 0))
);


ALTER TABLE public.items_carritos OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16999)
-- Name: items_carritos_id_item_carrito_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_carritos_id_item_carrito_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_carritos_id_item_carrito_seq OWNER TO postgres;

--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 238
-- Name: items_carritos_id_item_carrito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_carritos_id_item_carrito_seq OWNED BY public.items_carritos.id_item_carrito;


--
-- TOC entry 223 (class 1259 OID 16846)
-- Name: marcas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marcas (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    logo_url character varying(255),
    estado boolean DEFAULT true
);


ALTER TABLE public.marcas OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16845)
-- Name: marcas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marcas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marcas_id_seq OWNER TO postgres;

--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 222
-- Name: marcas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marcas_id_seq OWNED BY public.marcas.id;


--
-- TOC entry 235 (class 1259 OID 16956)
-- Name: producto_colores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto_colores (
    id integer NOT NULL,
    color_id integer NOT NULL,
    producto_id integer NOT NULL,
    imagen_url character varying(500),
    estado boolean DEFAULT true,
    stock integer DEFAULT 0,
    almacenamiento integer
);


ALTER TABLE public.producto_colores OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16955)
-- Name: producto_colores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producto_colores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.producto_colores_id_seq OWNER TO postgres;

--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 234
-- Name: producto_colores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producto_colores_id_seq OWNED BY public.producto_colores.id;


--
-- TOC entry 233 (class 1259 OID 16919)
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    id_marca integer NOT NULL,
    id_etiqueta integer,
    id_categoria integer NOT NULL,
    sku character varying(50),
    nombre character varying(255) NOT NULL,
    modelo character varying(255) NOT NULL,
    descripcion text,
    almacenamiento integer,
    camara integer,
    os character varying(100),
    precio numeric(12,2) NOT NULL,
    precio_anterior numeric(12,2),
    descuento integer DEFAULT 0,
    stock_total integer DEFAULT 0,
    estado boolean DEFAULT true,
    producto_url character varying(500),
    pantalla character varying(100),
    creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16918)
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_seq OWNER TO postgres;

--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 232
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- TOC entry 241 (class 1259 OID 17027)
-- Name: reseñas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reseñas" (
    "id_reseña" bigint NOT NULL,
    id_usuario bigint NOT NULL,
    producto_id integer NOT NULL,
    comentario text,
    puntuacion smallint NOT NULL,
    creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reseñas_puntuacion_check" CHECK (((puntuacion >= 1) AND (puntuacion <= 5)))
);


ALTER TABLE public."reseñas" OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 17026)
-- Name: reseñas_id_reseña_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."reseñas_id_reseña_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."reseñas_id_reseña_seq" OWNER TO postgres;

--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 240
-- Name: reseñas_id_reseña_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."reseñas_id_reseña_seq" OWNED BY public."reseñas"."id_reseña";


--
-- TOC entry 221 (class 1259 OID 16832)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion character varying(255),
    creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16831)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 220
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 231 (class 1259 OID 16895)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario bigint NOT NULL,
    id_rol bigint NOT NULL,
    nombre_completo character varying(255) NOT NULL,
    correo_electronico character varying(255) NOT NULL,
    contrasena_hash character varying(255) NOT NULL,
    telefono character varying(25),
    estado boolean DEFAULT true,
    creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16894)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 230
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- TOC entry 4939 (class 2604 OID 16985)
-- Name: carritos id_carrito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carritos ALTER COLUMN id_carrito SET DEFAULT nextval('public.carritos_id_carrito_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 16863)
-- Name: categorias id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id_categoria SET DEFAULT nextval('public.categorias_id_categoria_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 16887)
-- Name: colores id_color; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colores ALTER COLUMN id_color SET DEFAULT nextval('public.colores_id_color_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 16875)
-- Name: etiquetas id_etiqueta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiquetas ALTER COLUMN id_etiqueta SET DEFAULT nextval('public.etiquetas_id_etiqueta_seq'::regclass);


--
-- TOC entry 4944 (class 2604 OID 17003)
-- Name: items_carritos id_item_carrito; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_carritos ALTER COLUMN id_item_carrito SET DEFAULT nextval('public.items_carritos_id_item_carrito_seq'::regclass);


--
-- TOC entry 4919 (class 2604 OID 16849)
-- Name: marcas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas ALTER COLUMN id SET DEFAULT nextval('public.marcas_id_seq'::regclass);


--
-- TOC entry 4936 (class 2604 OID 16959)
-- Name: producto_colores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_colores ALTER COLUMN id SET DEFAULT nextval('public.producto_colores_id_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 16922)
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- TOC entry 4947 (class 2604 OID 17030)
-- Name: reseñas id_reseña; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas" ALTER COLUMN "id_reseña" SET DEFAULT nextval('public."reseñas_id_reseña_seq"'::regclass);


--
-- TOC entry 4917 (class 2604 OID 16835)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 16898)
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- TOC entry 5179 (class 0 OID 16982)
-- Dependencies: 237
-- Data for Name: carritos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carritos (id_carrito, id_usuario, cantidad, estado, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5167 (class 0 OID 16860)
-- Dependencies: 225
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id_categoria, nombre, estado) FROM stdin;
1	Celulares	t
\.


--
-- TOC entry 5171 (class 0 OID 16884)
-- Dependencies: 229
-- Data for Name: colores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colores (id_color, nombre, codigo_hex) FROM stdin;
1	Dorado	#D4AF37
2	Gris	#808080
3	Negro	#000000
4	Morado	#800080
5	Azul	#2196F3
6	Blanco	#FFFFFF
7	Celeste	#87CEEB
8	Grafito	#383838
9	Rosado	#FFC0CB
10	Verde	#4CAF50
11	Rojo	#F44336
12	Plata	#C0C0C0
\.


--
-- TOC entry 5169 (class 0 OID 16872)
-- Dependencies: 227
-- Data for Name: etiquetas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etiquetas (id_etiqueta, nombre, color, etiqueta_url, estado) FROM stdin;
1	En oferta	#E53935	\N	t
2	Nuevo	#43A047	\N	t
\.


--
-- TOC entry 5181 (class 0 OID 17000)
-- Dependencies: 239
-- Data for Name: items_carritos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items_carritos (id_item_carrito, id_carrito, producto_color_id, cantidad, precio_unitario, creado_en) FROM stdin;
\.


--
-- TOC entry 5165 (class 0 OID 16846)
-- Dependencies: 223
-- Data for Name: marcas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marcas (id, nombre, logo_url, estado) FROM stdin;
1	Samsung	\N	t
2	Apple	\N	t
3	Xiaomi	\N	t
4	Motorola	\N	t
5	Huawei	\N	t
6	Tecno	\N	t
7	Oppo	\N	t
8	Infinix	\N	t
9	Nubia	\N	t
\.


--
-- TOC entry 5177 (class 0 OID 16956)
-- Dependencies: 235
-- Data for Name: producto_colores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto_colores (id, color_id, producto_id, imagen_url, estado, stock, almacenamiento) FROM stdin;
1	1	1	../assets/images/celulares/01-samsung-galaxy-s24-ultra.jpg	t	4	256
2	2	1	../assets/images/celulares/01-samsung-galaxy-s24-ultra-gris.jpg	t	4	256
3	3	1	../assets/images/celulares/01-samsung-galaxy-s24-ultra-negro.jpg	t	4	256
4	4	1	../assets/images/celulares/01-samsung-galaxy-s24-ultra-morado.jpg	t	3	256
5	5	2	../assets/images/celulares/02-apple-iphone-15-pro.jpg	t	4	256
6	2	2	../assets/images/celulares/02-apple-iphone-15-pro-gris.jpg	t	4	256
7	6	2	../assets/images/celulares/02-apple-iphone-15-pro-blanco.jpg	t	4	256
8	3	2	../assets/images/celulares/02-apple-iphone-15-pro-negro.jpg	t	3	256
9	3	3	../assets/images/celulares/03-samsung-galaxy-s24.jpg	t	4	128
10	2	3	../assets/images/celulares/03-samsung-galaxy-s24-gris.jpg	t	4	128
11	4	3	../assets/images/celulares/03-samsung-galaxy-s24-morado.jpg	t	4	128
12	1	3	../assets/images/celulares/03-samsung-galaxy-s24-dorado.jpg	t	3	128
13	7	4	../assets/images/celulares/04-samsung-galaxy-a55-5g.jpg	t	4	256
14	4	4	../assets/images/celulares/04-samsung-galaxy-a55-5g-morado.jpg	t	4	256
15	8	4	../assets/images/celulares/04-samsung-galaxy-a55-5g-grafito.jpg	t	4	256
16	1	4	../assets/images/celulares/04-samsung-galaxy-a55-5g-dorado.jpg	t	3	256
17	9	5	../assets/images/celulares/05-apple-iphone-15.jpg	t	3	128
18	7	5	../assets/images/celulares/05-apple-iphone-15-celeste.jpg	t	3	128
19	10	5	../assets/images/celulares/05-apple-iphone-15-verde.jpg	t	3	128
20	1	5	../assets/images/celulares/05-apple-iphone-15-dorado.jpg	t	3	128
21	3	5	../assets/images/celulares/05-apple-iphone-15-negro.jpg	t	3	128
22	4	6	../assets/images/celulares/06-xiaomi-redmi-note-13-pro-5g.jpg	t	5	256
23	3	6	../assets/images/celulares/06-xiaomi-redmi-note-13-pro-5g-negro.jpg	t	5	256
24	7	6	../assets/images/celulares/06-xiaomi-redmi-note-13-pro-5g-celeste.jpg	t	5	256
25	6	7	../assets/images/celulares/07-xiaomi-xiaomi-14.jpg	t	5	512
26	3	7	../assets/images/celulares/07-xiaomi-xiaomi-14-negro.jpg	t	5	512
27	10	7	../assets/images/celulares/07-xiaomi-xiaomi-14-verde.jpg	t	5	512
28	5	8	../assets/images/celulares/08-motorola-edge-40-neo.jpg	t	4	256
29	3	8	../assets/images/celulares/08-motorola-edge-40-neo-negro.jpg	t	4	256
30	7	8	../assets/images/celulares/08-motorola-edge-40-neo-celeste.jpg	t	4	256
31	9	8	../assets/images/celulares/08-motorola-edge-40-neo-rosado.jpg	t	3	256
32	11	9	../assets/images/celulares/09-motorola-moto-g84-5g.jpg	t	5	256
33	7	9	../assets/images/celulares/09-motorola-moto-g84-5g-celeste.jpg	t	5	256
34	8	9	../assets/images/celulares/09-motorola-moto-g84-5g-grafito.jpg	t	5	256
35	4	10	../assets/images/celulares/10-huawei-pura-70-pro.jpg	t	5	512
36	6	10	../assets/images/celulares/10-huawei-pura-70-pro-blanco.jpg	t	5	512
37	3	10	../assets/images/celulares/10-huawei-pura-70-pro-negro.jpg	t	5	512
38	10	11	../assets/images/celulares/11-tecno-camon-30-pro-5g.jpg	t	5	256
39	12	11	../assets/images/celulares/11-tecno-camon-30-pro-5g-plata.jpg	t	5	256
40	3	11	../assets/images/celulares/11-tecno-camon-30-pro-5g-negro.jpg	t	5	256
41	3	12	../assets/images/celulares/12-tecno-spark-20-pro.jpg	t	4	256
42	6	12	../assets/images/celulares/12-tecno-spark-20-pro-blanco.jpg	t	4	256
43	1	12	../assets/images/celulares/12-tecno-spark-20-pro-dorado.jpg	t	4	256
44	10	12	../assets/images/celulares/12-tecno-spark-20-pro-verde.jpg	t	3	256
45	10	13	../assets/images/celulares/13-oppo-reno11-5g.jpg	t	8	256
46	2	13	../assets/images/celulares/13-oppo-reno11-5g-gris.jpg	t	7	256
47	10	14	../assets/images/celulares/14-oppo-a78.jpg	t	5	128
48	3	14	../assets/images/celulares/14-oppo-a78-negro.jpg	t	5	128
49	4	14	../assets/images/celulares/14-oppo-a78-morado.jpg	t	5	128
50	12	15	../assets/images/celulares/15-infinix-gt-20-pro-plata.jpg	t	8	256
51	8	15	../assets/images/celulares/15-infinix-gt-20-pro-grafito.jpg	t	7	256
52	8	16	../assets/images/celulares/16-nubia-red-magic-9-pro.jpg	t	5	512
53	3	16	../assets/images/celulares/16-nubia-red-magic-9-pro-negro.jpg	t	5	512
54	12	16	../assets/images/celulares/16-nubia-red-magic-9-pro-plata.jpg	t	5	512
\.


--
-- TOC entry 5175 (class 0 OID 16919)
-- Dependencies: 233
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, id_marca, id_etiqueta, id_categoria, sku, nombre, modelo, descripcion, almacenamiento, camara, os, precio, precio_anterior, descuento, stock_total, estado, producto_url, pantalla, creado_en, actualizado_en) FROM stdin;
1	1	1	1	SM-S928B	Samsung Galaxy S24 Ultra	Galaxy S24 Ultra	\N	256	200	\N	4500000.00	5000000.00	10	15	t	../assets/images/celulares/01-samsung-galaxy-s24-ultra.jpg	6,8″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
2	2	2	1	A3101	Apple iPhone 15 Pro	iPhone 15 Pro	\N	256	48	\N	4700000.00	\N	0	15	t	../assets/images/celulares/02-apple-iphone-15-pro.jpg	6,1″ OLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
3	1	1	1	SM-S921B	Samsung Galaxy S24	Galaxy S24	\N	128	50	\N	3400000.00	4000000.00	15	15	t	../assets/images/celulares/03-samsung-galaxy-s24.jpg	6,2″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
4	1	2	1	SM-A556B	Samsung Galaxy A55 5G	Galaxy A55 5G	\N	256	50	\N	1600000.00	\N	0	15	t	../assets/images/celulares/04-samsung-galaxy-a55-5g.jpg	6,6″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
5	2	1	1	A3090	Apple iPhone 15	iPhone 15	\N	128	48	\N	3600000.00	4000000.00	10	15	t	../assets/images/celulares/05-apple-iphone-15.jpg	6,1″ OLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
6	3	1	1	2312DRA50G	Xiaomi Redmi Note 13 Pro 5G	Redmi Note 13 Pro 5G	\N	256	200	\N	1350000.00	1500000.00	10	15	t	../assets/images/celulares/06-xiaomi-redmi-note-13-pro-5g.jpg	6,67″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
7	3	2	1	23127PN0CG	Xiaomi 14	Xiaomi 14	\N	512	50	\N	3300000.00	\N	0	15	t	../assets/images/celulares/07-xiaomi-xiaomi-14.jpg	6,36″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
8	4	1	1	XT2307-1	Motorola Edge 40 Neo	Edge 40 Neo	\N	256	50	\N	1500000.00	1875000.00	20	15	t	../assets/images/celulares/08-motorola-edge-40-neo.jpg	6,55″ pOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
9	4	\N	1	XT2347-2	Motorola Moto G84 5G	Moto G84 5G	\N	256	50	\N	1000000.00	\N	0	15	t	../assets/images/celulares/09-motorola-moto-g84-5g.jpg	6,5″ pOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
10	5	2	1	HBN-LX9	Huawei Pura 70 Pro	Pura 70 Pro	\N	512	50	\N	4200000.00	\N	0	15	t	../assets/images/celulares/10-huawei-pura-70-pro.jpg	6,8″ LTPO OLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
11	6	1	1	CL8	Tecno Camon 30 Pro 5G	Camon 30 Pro 5G	\N	256	50	\N	1400000.00	1750000.00	20	15	t	../assets/images/celulares/11-tecno-camon-30-pro-5g.jpg	6,78″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
12	6	\N	1	KJ6	Tecno Spark 20 Pro	Spark 20 Pro	\N	256	108	\N	800000.00	\N	0	15	t	../assets/images/celulares/12-tecno-spark-20-pro.jpg	6,78″ LCD	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
13	7	1	1	CPH2599	Oppo Reno11 5G	Reno11 5G	\N	256	50	\N	1900000.00	2000000.00	5	15	t	../assets/images/celulares/13-oppo-reno11-5g.jpg	6,7″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
14	7	\N	1	CPH2565	Oppo A78	A78	\N	128	50	\N	700000.00	\N	0	15	t	../assets/images/celulares/14-oppo-a78.jpg	6,43″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
15	8	1	1	X6871	Infinix GT 20 Pro	GT 20 Pro	\N	256	108	\N	1000000.00	1250000.00	20	15	t	../assets/images/celulares/15-infinix-gt-20-pro.jpg	6,78″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
16	9	2	1	NX769J	Nubia Red Magic 9 Pro	Red Magic 9 Pro	\N	512	50	\N	3600000.00	\N	0	15	t	../assets/images/celulares/16-nubia-red-magic-9-pro.jpg	6,8″ AMOLED	2026-11-26 14:50:14.804969-05	2026-11-26 14:50:14.804969-05
\.


--
-- TOC entry 5183 (class 0 OID 17027)
-- Dependencies: 241
-- Data for Name: reseñas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reseñas" ("id_reseña", id_usuario, producto_id, comentario, puntuacion, creado_en) FROM stdin;
\.


--
-- TOC entry 5163 (class 0 OID 16832)
-- Dependencies: 221
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre, descripcion, creado_en) FROM stdin;
1	cliente	Usuario normal que puede comprar	2026-11-26 14:50:14.804969-05
2	admin	Administrador con acceso total al sistema	2026-11-26 14:50:14.804969-05
\.


--
-- TOC entry 5173 (class 0 OID 16895)
-- Dependencies: 231
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, id_rol, nombre_completo, correo_electronico, contrasena_hash, telefono, estado, creado_en, actualizado_en) FROM stdin;
\.


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 236
-- Name: carritos_id_carrito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carritos_id_carrito_seq', 1, false);


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 224
-- Name: categorias_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_categoria_seq', 1, true);


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 228
-- Name: colores_id_color_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colores_id_color_seq', 12, true);


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 226
-- Name: etiquetas_id_etiqueta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etiquetas_id_etiqueta_seq', 2, true);


--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 238
-- Name: items_carritos_id_item_carrito_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_carritos_id_item_carrito_seq', 1, false);


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 222
-- Name: marcas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marcas_id_seq', 9, true);


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 234
-- Name: producto_colores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producto_colores_id_seq', 54, true);


--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 232
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_seq', 16, true);


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 240
-- Name: reseñas_id_reseña_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reseñas_id_reseña_seq"', 1, false);


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 220
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 230
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 1, false);


--
-- TOC entry 4992 (class 2606 OID 16993)
-- Name: carritos carritos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carritos
    ADD CONSTRAINT carritos_pkey PRIMARY KEY (id_carrito);


--
-- TOC entry 4961 (class 2606 OID 16870)
-- Name: categorias categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);


--
-- TOC entry 4963 (class 2606 OID 16868)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 4969 (class 2606 OID 16893)
-- Name: colores colores_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colores
    ADD CONSTRAINT colores_nombre_key UNIQUE (nombre);


--
-- TOC entry 4971 (class 2606 OID 16891)
-- Name: colores colores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colores
    ADD CONSTRAINT colores_pkey PRIMARY KEY (id_color);


--
-- TOC entry 4965 (class 2606 OID 16882)
-- Name: etiquetas etiquetas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiquetas
    ADD CONSTRAINT etiquetas_nombre_key UNIQUE (nombre);


--
-- TOC entry 4967 (class 2606 OID 16880)
-- Name: etiquetas etiquetas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiquetas
    ADD CONSTRAINT etiquetas_pkey PRIMARY KEY (id_etiqueta);


--
-- TOC entry 4996 (class 2606 OID 17015)
-- Name: items_carritos items_carritos_id_carrito_producto_color_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_carritos
    ADD CONSTRAINT items_carritos_id_carrito_producto_color_id_key UNIQUE (id_carrito, producto_color_id);


--
-- TOC entry 4998 (class 2606 OID 17013)
-- Name: items_carritos items_carritos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_carritos
    ADD CONSTRAINT items_carritos_pkey PRIMARY KEY (id_item_carrito);


--
-- TOC entry 4957 (class 2606 OID 16858)
-- Name: marcas marcas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_nombre_key UNIQUE (nombre);


--
-- TOC entry 4959 (class 2606 OID 16856)
-- Name: marcas marcas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 16968)
-- Name: producto_colores producto_colores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_colores
    ADD CONSTRAINT producto_colores_pkey PRIMARY KEY (id);


--
-- TOC entry 4990 (class 2606 OID 16970)
-- Name: producto_colores producto_colores_producto_id_color_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_colores
    ADD CONSTRAINT producto_colores_producto_id_color_id_key UNIQUE (producto_id, color_id);


--
-- TOC entry 4982 (class 2606 OID 16937)
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 16939)
-- Name: productos productos_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_sku_key UNIQUE (sku);


--
-- TOC entry 5001 (class 2606 OID 17042)
-- Name: reseñas reseñas_id_usuario_producto_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_id_usuario_producto_id_key" UNIQUE (id_usuario, producto_id);


--
-- TOC entry 5003 (class 2606 OID 17040)
-- Name: reseñas reseñas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_pkey" PRIMARY KEY ("id_reseña");


--
-- TOC entry 4953 (class 2606 OID 16844)
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- TOC entry 4955 (class 2606 OID 16842)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 16912)
-- Name: usuarios usuarios_correo_electronico_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_electronico_key UNIQUE (correo_electronico);


--
-- TOC entry 4977 (class 2606 OID 16910)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4993 (class 1259 OID 17060)
-- Name: idx_carritos_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carritos_usuario ON public.carritos USING btree (id_usuario);


--
-- TOC entry 4994 (class 1259 OID 17061)
-- Name: idx_items_carrito; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_carrito ON public.items_carritos USING btree (id_carrito);


--
-- TOC entry 4985 (class 1259 OID 17059)
-- Name: idx_producto_colores_color; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producto_colores_color ON public.producto_colores USING btree (color_id);


--
-- TOC entry 4986 (class 1259 OID 17058)
-- Name: idx_producto_colores_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producto_colores_producto ON public.producto_colores USING btree (producto_id);


--
-- TOC entry 4978 (class 1259 OID 17056)
-- Name: idx_productos_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_categoria ON public.productos USING btree (id_categoria);


--
-- TOC entry 4979 (class 1259 OID 17057)
-- Name: idx_productos_etiqueta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_etiqueta ON public.productos USING btree (id_etiqueta);


--
-- TOC entry 4980 (class 1259 OID 17055)
-- Name: idx_productos_marca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_marca ON public.productos USING btree (id_marca);


--
-- TOC entry 4999 (class 1259 OID 17062)
-- Name: idx_reseñas_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_reseñas_producto" ON public."reseñas" USING btree (producto_id);


--
-- TOC entry 4972 (class 1259 OID 17054)
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (correo_electronico);


--
-- TOC entry 4973 (class 1259 OID 17053)
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (id_rol);


--
-- TOC entry 5010 (class 2606 OID 16994)
-- Name: carritos carritos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carritos
    ADD CONSTRAINT carritos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 5011 (class 2606 OID 17016)
-- Name: items_carritos items_carritos_id_carrito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_carritos
    ADD CONSTRAINT items_carritos_id_carrito_fkey FOREIGN KEY (id_carrito) REFERENCES public.carritos(id_carrito) ON DELETE CASCADE;


--
-- TOC entry 5012 (class 2606 OID 17021)
-- Name: items_carritos items_carritos_producto_color_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_carritos
    ADD CONSTRAINT items_carritos_producto_color_id_fkey FOREIGN KEY (producto_color_id) REFERENCES public.producto_colores(id);


--
-- TOC entry 5008 (class 2606 OID 16971)
-- Name: producto_colores producto_colores_color_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_colores
    ADD CONSTRAINT producto_colores_color_id_fkey FOREIGN KEY (color_id) REFERENCES public.colores(id_color);


--
-- TOC entry 5009 (class 2606 OID 16976)
-- Name: producto_colores producto_colores_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto_colores
    ADD CONSTRAINT producto_colores_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- TOC entry 5005 (class 2606 OID 16950)
-- Name: productos productos_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria);


--
-- TOC entry 5006 (class 2606 OID 16945)
-- Name: productos productos_id_etiqueta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_etiqueta_fkey FOREIGN KEY (id_etiqueta) REFERENCES public.etiquetas(id_etiqueta);


--
-- TOC entry 5007 (class 2606 OID 16940)
-- Name: productos productos_id_marca_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_id_marca_fkey FOREIGN KEY (id_marca) REFERENCES public.marcas(id);


--
-- TOC entry 5013 (class 2606 OID 17043)
-- Name: reseñas reseñas_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 5014 (class 2606 OID 17048)
-- Name: reseñas reseñas_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_producto_id_fkey" FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- TOC entry 5004 (class 2606 OID 16913)
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id);


-- Completed on 2026-11-26 15:07:22

--
-- PostgreSQL database dump complete
--

\unrestrict Cd1ZxWM5lNUjbucgAJ6NshWddVHyG8ADOp4DRXO6DaxODYEzR9BFe7KnjxwcHoi

