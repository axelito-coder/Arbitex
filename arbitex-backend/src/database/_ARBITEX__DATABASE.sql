--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: arbitex; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE arbitex WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Argentina.1252';



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
-- Name: clientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100),
    telefono character varying(20),
    dni character varying(10)
);


--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config (
    id integer NOT NULL,
    semana_activa integer NOT NULL,
    "año_activo" integer NOT NULL,
    presupuesto_bonus numeric(12,2) DEFAULT 0,
    presupuesto_usado numeric(12,2) DEFAULT 0
);


--
-- Name: config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.config_id_seq OWNED BY public.config.id;


--
-- Name: empleados; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: empleados_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.empleados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: empleados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.empleados_id_seq OWNED BY public.empleados.id;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facturas (
    id integer NOT NULL,
    nro_factura character varying(30),
    id_turno integer,
    fecha date NOT NULL,
    total numeric(12,2)
);


--
-- Name: facturas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.facturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: facturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.facturas_id_seq OWNED BY public.facturas.id;


--
-- Name: items_turno; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items_turno (
    id integer NOT NULL,
    id_turno integer,
    descripcion character varying(150) NOT NULL,
    cantidad numeric(8,2) NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    tipo character varying(20)
);


--
-- Name: items_turno_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_turno_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_turno_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_turno_id_seq OWNED BY public.items_turno.id;


--
-- Name: turnos; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: turnos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.turnos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: turnos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.turnos_id_seq OWNED BY public.turnos.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    rol character varying(20) NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: vehiculo_cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehiculo_cliente (
    id integer NOT NULL,
    id_vehiculo integer,
    id_cliente integer,
    nro_serie character varying(50),
    km integer,
    patente character varying(10)
);


--
-- Name: vehiculo_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehiculo_cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehiculo_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehiculo_cliente_id_seq OWNED BY public.vehiculo_cliente.id;


--
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehiculos (
    id integer NOT NULL,
    marca character varying(50) NOT NULL,
    modelo character varying(50) NOT NULL,
    version character varying(100)
);


--
-- Name: vehiculos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehiculos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehiculos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehiculos_id_seq OWNED BY public.vehiculos.id;


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: config id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config ALTER COLUMN id SET DEFAULT nextval('public.config_id_seq'::regclass);


--
-- Name: empleados id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleados ALTER COLUMN id SET DEFAULT nextval('public.empleados_id_seq'::regclass);


--
-- Name: facturas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id SET DEFAULT nextval('public.facturas_id_seq'::regclass);


--
-- Name: items_turno id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_turno ALTER COLUMN id SET DEFAULT nextval('public.items_turno_id_seq'::regclass);


--
-- Name: turnos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos ALTER COLUMN id SET DEFAULT nextval('public.turnos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: vehiculo_cliente id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehiculo_cliente ALTER COLUMN id SET DEFAULT nextval('public.vehiculo_cliente_id_seq'::regclass);


--
-- Name: vehiculos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehiculos ALTER COLUMN id SET DEFAULT nextval('public.vehiculos_id_seq'::regclass);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: config config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (id);


--
-- Name: empleados empleados_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_id_usuario_key UNIQUE (id_usuario);


--
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);


--
-- Name: facturas facturas_id_turno_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_turno_key UNIQUE (id_turno);


--
-- Name: facturas facturas_nro_factura_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_nro_factura_key UNIQUE (nro_factura);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (id);


--
-- Name: items_turno items_turno_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_turno
    ADD CONSTRAINT items_turno_pkey PRIMARY KEY (id);


--
-- Name: turnos turnos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: vehiculo_cliente vehiculo_cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehiculo_cliente
    ADD CONSTRAINT vehiculo_cliente_pkey PRIMARY KEY (id);


--
-- Name: vehiculos vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_pkey PRIMARY KEY (id);


--
-- Name: empleados empleados_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);


--
-- Name: facturas facturas_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id);


--
-- Name: items_turno items_turno_id_turno_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_turno
    ADD CONSTRAINT items_turno_id_turno_fkey FOREIGN KEY (id_turno) REFERENCES public.turnos(id);


--
-- Name: turnos turnos_id_asesor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_id_asesor_fkey FOREIGN KEY (id_asesor) REFERENCES public.empleados(id);


--
-- Name: turnos turnos_id_vehiculo_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_id_vehiculo_cliente_fkey FOREIGN KEY (id_vehiculo_cliente) REFERENCES public.vehiculo_cliente(id);


--
-- Name: vehiculo_cliente vehiculo_cliente_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehiculo_cliente
    ADD CONSTRAINT vehiculo_cliente_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id);


--
-- Name: vehiculo_cliente vehiculo_cliente_id_vehiculo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehiculo_cliente
    ADD CONSTRAINT vehiculo_cliente_id_vehiculo_fkey FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculos(id);


--
-- PostgreSQL database dump complete
--
