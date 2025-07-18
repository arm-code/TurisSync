-- Borrar y crear base de datos
DROP DATABASE IF EXISTS turisync;
CREATE DATABASE turisync CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE turisync;

-- Tabla: user_types
CREATE TABLE user_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla: usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  id_chofer VARCHAR(20) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  user_type_id INT NOT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_type_id) REFERENCES user_types(id)
);

-- Tabla: rutas
CREATE TABLE rutas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: horarios
CREATE TABLE horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  ruta_id INT,
  chofer_id INT,
  estado ENUM('activo', 'inactivo', 'completado') DEFAULT 'activo',
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ruta_id) REFERENCES rutas(id),
  FOREIGN KEY (chofer_id) REFERENCES usuarios(id)
);

-- Tabla: paradas
CREATE TABLE paradas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion TEXT DEFAULT NULL,
  orden INT DEFAULT NULL,
  ruta_id INT NOT NULL,
  FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE
);

-- Tabla: vehiculos (opcional sugerida)
CREATE TABLE vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modelo VARCHAR(100) NOT NULL,
  placas VARCHAR(20) NOT NULL UNIQUE,
  capacidad INT NOT NULL,
  chofer_id INT,
  FOREIGN KEY (chofer_id) REFERENCES usuarios(id)
);

-- Tabla: bitacora (opcional sugerida)
CREATE TABLE bitacora (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  accion TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Inserción de tipos de usuario
INSERT INTO user_types (id, name) VALUES
(1, 'administrador'),
(2, 'chofer');

-- Inserción de usuarios
INSERT INTO usuarios (id, nombre, email, id_chofer, password, user_type_id, fecha_registro) VALUES
(1, 'Juan Perez', 'homeroharos28@gmail.com', '5458', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 2, '2025-06-03 23:43:18'),
(2, 'Pedro Munoz', 'kk@kk', '5456', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 2, '2025-06-05 20:25:44');

-- Inserción de rutas
INSERT INTO rutas (id, nombre, descripcion, fecha_creacion) VALUES
(1, 'Riveras del Bravo', '', '2025-06-03 23:47:15'),
(2, 'Finca Bonita', '', '2025-06-03 23:47:15')
(3, 'Valle de Juarez', '', '2025-06-03 23:47:15'),
(4, 'Valle de Juarez 2', '', '2025-06-03 23:47:15'),
(5, 'Tierra Nueva 1', '', '2025-06-03 23:47:15'),
(6, 'Tierra Nueva 2', '', '2025-06-03 23:47:15'),
(7, 'Express 1A', '', '2025-06-03 23:47:15'),
(8, 'Express 1B', '', '2025-06-03 23:47:15');


-- Inserción de horarios
INSERT INTO horarios (id, fecha, hora_inicio, hora_fin, ruta_id, chofer_id, estado, fecha_creacion) VALUES
(2, '2025-06-05', '14:51:00', '16:51:00', 1, 1, 'activo', '2025-06-05 20:52:11');

-- Inserción de paradas
INSERT INTO paradas (id, nombre, direccion, orden, ruta_id) VALUES
(1, 'Smart Talamas', 'Av Talamas 1515', 0, 1),
(2, 'Smart Independencia', 'Av Independencia 1515', 1, 1),
(3, 'Smart Plaza Sendero', 'Plaza Sendero 1515', 2, 1),
(4, 'Smart Plaza Juarez', 'Plaza Juarez 1515', 3, 1),
(5, 'Smart Plaza Juarez Norte', 'Plaza Juarez Norte 1515', 4, 1),
(6, 'Smart Plaza Juarez Sur', 'Plaza Juarez Sur 1515', 5, 1);


