-- ============================================
-- ARBITEX — DATABASE SCHEMA ACTUALIZADO
-- ============================================
-- INSTRUCCIONES:
-- 1. Crear la base de datos: CREATE DATABASE arbitex;
-- 2. En pgAdmin conectarse a la base y ejecutar este script
-- ============================================
 
-- Tabla de configuración
CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    semana_activa DATE,
    ultima_actualizacion TIMESTAMP DEFAULT NOW()
);
 
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('encargado', 'asesor'))
);
 
-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    acumulado_semanal DECIMAL(12,2) DEFAULT 0,
    acumulado_semana_anterior DECIMAL(12,2) DEFAULT 0,
    orden_compensacion INTEGER DEFAULT 0,
    tiempo_promedio DECIMAL(8,2) DEFAULT 0,
    sesion_activa BOOLEAN DEFAULT false,
    ultimo_dia_trabajado DATE,
    dias_trabajados_semana INTEGER DEFAULT 0,
    acumulado_distribucion DECIMAL(12,2) DEFAULT 0,
    bonus_disponible BOOLEAN DEFAULT false,
    bonus_maximo DECIMAL(12,2) DEFAULT 0,
    bonus_semana DECIMAL(12,2) DEFAULT 0
);
 
-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(30),
    dni VARCHAR(20) UNIQUE
);
 
-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    version VARCHAR(50)
);
 
-- Tabla de vehiculo_cliente
-- NOTA: id_vehiculo es nullable (se asigna al finalizar el turno)
CREATE TABLE IF NOT EXISTS vehiculo_cliente (
    id SERIAL PRIMARY KEY,
    id_vehiculo INTEGER REFERENCES vehiculos(id) ON DELETE SET NULL,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nro_serie VARCHAR(50),
    km INTEGER,
    patente VARCHAR(20)
);
 
-- Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    id_vehiculo_cliente INTEGER NOT NULL REFERENCES vehiculo_cliente(id) ON DELETE CASCADE,
    id_asesor INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    horario TIMESTAMP,
    tipo_service VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'finalizado')),
    es_compensacion BOOLEAN DEFAULT false,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_inicio_atencion TIMESTAMP,
    hora_cierre_atencion TIMESTAMP,
    duracion_minutos DECIMAL(8,2),
    hora_carga TIMESTAMP DEFAULT NOW()
);
 
-- Tabla de items_turno
CREATE TABLE IF NOT EXISTS items_turno (
    id SERIAL PRIMARY KEY,
    id_turno INTEGER NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,
    descripcion VARCHAR(200) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,2) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('repuesto', 'mano_de_obra', 'otro'))
);
 
-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    nro_factura VARCHAR(30) UNIQUE NOT NULL,
    id_turno INTEGER NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    total DECIMAL(12,2) NOT NULL
);
 
-- ============================================
-- USUARIOS Y CONTRASEÑAS
-- Encargado: admin123
-- Asesores (Julieta, B, C, D): asesor123
-- Dante Gomez: 48796734
-- ============================================
 
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Encargado', 'encargado@arbitex.com', '$2b$10$oiIeoEMwCueZe9gk3Oa9DezFbJbHRjPOhZL7jPzS2Ek8xcarxgfzC', 'encargado'),
('Julieta Breitman', 'asesora@arbitex.com', '$2b$10$umDqewWezwo6kaCX/3vwI.Wf4eLKaUU.jttdAn9dqzuRgFaULUOl2', 'asesor'),
('Asesor B', 'asesorb@arbitex.com', '$2b$10$BTm3LwF/QD.hZkSwCRiS/.sdV3ND2estSk47me8A8DE3AwuJWXoE2', 'asesor'),
('Asesor C', 'asesorc@arbitex.com', '$2b$10$Yg56Y5Kqi3qndu/aiTq68uDSffspYBqXsf4AyJmjOkrwYNfhpxMKq', 'asesor'),
('Asesor D', 'asesord@arbitex.com', '$2b$10$Ee//yyRE2HupwQX/6oc3Cej/Rdk0Ce364T0pYZZNqk6oHu91BgFKG', 'asesor'),
('Dante Gomez', 'danteruto2008@gmail.com', '$2b$10$beBtYJrnkF.ksLeQszOZr.00CuvigBijHv.09a2jndpdM6F8T03tC', 'asesor')
ON CONFLICT (email) DO NOTHING;
 
-- Crear empleados para cada asesor
INSERT INTO empleados (id_usuario)
SELECT id FROM usuarios WHERE rol = 'asesor'
ON CONFLICT DO NOTHING;
 
-- Modelos Toyota precargados en mayúsculas
INSERT INTO vehiculos (marca, modelo) VALUES
('TOYOTA', 'COROLLA'),
('TOYOTA', 'COROLLA CROSS'),
('TOYOTA', 'COROLLA GR SPORT'),
('TOYOTA', 'YARIS'),
('TOYOTA', 'YARIS CROSS'),
('TOYOTA', 'RAV4'),
('TOYOTA', 'HILUX'),
('TOYOTA', 'SW4'),
('TOYOTA', 'FORTUNER'),
('TOYOTA', 'LAND CRUISER'),
('TOYOTA', 'GR SUPRA'),
('TOYOTA', 'ETIOS');