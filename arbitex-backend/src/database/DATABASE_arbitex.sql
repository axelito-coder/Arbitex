--
-- PostgreSQL database dump
--

\restrict m8XELuuC8pG5gJeBggHfHggHdSYZ2jPuwi1XE8pvM2hZFkmvIPYsOdTAy07od2t

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-08-10 23:31:09

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
-- TOC entry 226 (class 1259 OID 16473)
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100),
    telefono character varying(20)
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16472)
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 225
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- TOC entry 220 (class 1259 OID 16430)
-- Name: config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.config (
    id integer NOT NULL,
    semana_activa integer NOT NULL,
    "año_activo" integer NOT NULL,
    presupuesto_bonus numeric(12,2) DEFAULT 0,
    presupuesto_usado numeric(12,2) DEFAULT 0
);


ALTER TABLE public.config OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16429)
-- Name: config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.config_id_seq OWNER TO postgres;

--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 219
-- Name: config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.config_id_seq OWNED BY public.config.id;


--
-- TOC entry 224 (class 1259 OID 16454)
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    id integer NOT NULL,
    id_usuario integer,
    acumulado_semanal numeric(12,2) DEFAULT 0,
    acumulado_semana_anterior numeric(12,2) DEFAULT 0,
    orden_compensacion integer,
    tiempo_promedio integer DEFAULT 20,
    sesion_activa boolean DEFAULT false,
    ultimo_dia_trabajado date,
    dias_trabajados_semana integer DEFAULT 0,
    acumulado_distribucion numeric(12,2) DEFAULT 0,
    bonus_disponible boolean DEFAULT false,
    bonus_maximo numeric(12,2) DEFAULT 0,
    bonus_semana numeric(12,2) DEFAULT 0
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16453)
-- Name: empleados_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empleados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empleados_id_seq OWNER TO postgres;

--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 223
-- Name: empleados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empleados_id_seq OWNED BY public.empleados.id;


--
-- TOC entry 236 (class 1259 OID 16547)
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    id integer NOT NULL,
    nro_factura character varying(30),
    id_turno integer,
    fecha date NOT NULL,
    total numeric(12,2)
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16546)
-- Name: facturas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_id_seq OWNER TO postgres;

--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 235
-- Name: facturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_id_seq OWNED BY public.facturas.id;


--
-- TOC entry 234 (class 1259 OID 16531)
-- Name: items_turno; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items_turno (
    id integer NOT NULL,
    id_turno integer,
    descripcion character varying(150) NOT NULL,
    cantidad numeric(8,2) NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    tipo character varying(20)
);


ALTER TABLE public.items_turno OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16530)
-- Name: items_turno_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_turno_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_turno_id_seq OWNER TO postgres;

--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 233
-- Name: items_turno_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_turno_id_seq OWNED BY public.items_turno.id;


--
-- TOC entry 232 (class 1259 OID 16510)
-- Name: turnos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.turnos (
    id integer NOT NULL,
    id_vehiculo_cliente integer,
    id_asesor integer,
    horario timestamp without time zone,
    tipo_service character varying(50),
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    es_compensacion boolean DEFAULT false,
    fecha date NOT NULL,
    hora_inicio_atencion timestamp without time zone,
    hora_cierre_atencion timestamp without time zone,
    duracion_minutos integer,
    hora_carga timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.turnos OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16509)
-- Name: turnos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.turnos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.turnos_id_seq OWNER TO postgres;

--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 231
-- Name: turnos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.turnos_id_seq OWNED BY public.turnos.id;


--
-- TOC entry 222 (class 1259 OID 16440)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    rol character varying(20) NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16439)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 221
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 230 (class 1259 OID 16492)
-- Name: vehiculo_cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculo_cliente (
    id integer NOT NULL,
    id_vehiculo integer,
    id_cliente integer,
    nro_serie character varying(50),
    km integer,
    patente character varying(10)
);


ALTER TABLE public.vehiculo_cliente OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16491)
-- Name: vehiculo_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculo_cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculo_cliente_id_seq OWNER TO postgres;

--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 229
-- Name: vehiculo_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculo_cliente_id_seq OWNED BY public.vehiculo_cliente.id;


--
-- TOC entry 228 (class 1259 OID 16482)
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    id integer NOT NULL,
    marca character varying(50) NOT NULL,
    modelo character varying(50) NOT NULL,
    version character varying(100)
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16481)
-- Name: vehiculos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculos_id_seq OWNER TO postgres;

--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 227
-- Name: vehiculos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculos_id_seq OWNED BY public.vehiculos.id;


--
-- TOC entry 4910 (class 2604 OID 16476)
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16433)
-- Name: config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config ALTER COLUMN id SET DEFAULT nextval('public.config_id_seq'::regclass);


--
-- TOC entry 4900 (class 2604 OID 16457)
-- Name: empleados id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados ALTER COLUMN id SET DEFAULT nextval('public.empleados_id_seq'::regclass);


--
-- TOC entry 4918 (class 2604 OID 16550)
-- Name: facturas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id SET DEFAULT nextval('public.facturas_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 16534)
-- Name: items_turno id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_turno ALTER COLUMN id SET DEFAULT nextval('public.items_turno_id_seq'::regclass);


--
-- TOC entry 4913 (class 2604 OID 16513)
-- Name: turnos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos ALTER COLUMN id SET DEFAULT nextval('public.turnos_id_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 16443)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 16495)
-- Name: vehiculo_cliente id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo_cliente ALTER COLUMN id SET DEFAULT nextval('public.vehiculo_cliente_id_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 16485)
-- Name: vehiculos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos ALTER COLUMN id SET DEFAULT nextval('public.vehiculos_id_seq'::regclass);


--
-- TOC entry 4930 (class 2606 OID 16480)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 2606 OID 16438)
-- Name: config config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 16466)
-- Name: empleados empleados_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_id_usuario_key UNIQUE (id_usuario);


--
-- TOC entry 4928 (class 2606 OID 16464)
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 16558)
-- Name: facturas facturas_id_turno_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_turno_key UNIQUE (id_turno);


--
-- TOC entry 4942 (class 2606 OID 16556)
-- Name: facturas facturas_nro_factura_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_nro_factura_key UNIQUE (nro_factura);


--
-- TOC entry 4944 (class 2606 OID 16554)
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 16540)
-- Name: items_turno items_turno_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_turno
    ADD CONSTRAINT items_turno_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 16519)
-- Name: turnos turnos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_pkey PRIMARY KEY (id);


--
-- TOC entry 4922 (class 2606 OID 16452)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4924 (class 2606 OID 16450)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 16498)
-- Name: vehiculo_cliente vehiculo_cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo_cliente
    ADD CONSTRAINT vehiculo_cliente_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 16490)
-- Name: vehiculos vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 16467)
-- Name: empleados empleados_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);


--
-- TOC entry 4951 (class 2606 OID 16559)
-- Name: facturas facturas_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id);


--
-- TOC entry 4950 (class 2606 OID 16541)
-- Name: items_turno items_turno_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_turno
    ADD CONSTRAINT items_turno_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id);


--
-- TOC entry 4948 (class 2606 OID 16525)
-- Name: turnos turnos_id_asesor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_id_asesor_fkey FOREIGN KEY (id_asesor) REFERENCES public.empleados(id);


--
-- TOC entry 4949 (class 2606 OID 16520)
-- Name: turnos turnos_id_vehiculo_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_id_vehiculo_cliente_fkey FOREIGN KEY (id_vehiculo_cliente) REFERENCES public.vehiculo_cliente(id);


--
-- TOC entry 4946 (class 2606 OID 16504)
-- Name: vehiculo_cliente vehiculo_cliente_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo_cliente
    ADD CONSTRAINT vehiculo_cliente_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id);


--
-- TOC entry 4947 (class 2606 OID 16499)
-- Name: vehiculo_cliente vehiculo_cliente_id_vehiculo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo_cliente
    ADD CONSTRAINT vehiculo_cliente_id_vehiculo_fkey FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculos(id);


-- Completed on 2026-08-10 23:31:09

--
-- PostgreSQL database dump complete
--

\unrestrict m8XELuuC8pG5gJeBggHfHggHdSYZ2jPuwi1XE8pvM2hZFkmvIPYsOdTAy07od2t

