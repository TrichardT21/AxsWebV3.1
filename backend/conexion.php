<?php
// Configuración
$host = getenv('DB_HOST') ?: 'localhost';
$user = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: 'Mamacita.com921';
$database = getenv('DB_NAME') ?: 'axs_sistema';

// 1. Conectar sin seleccionar base de datos
$conn = new mysqli($host, $user, $password);

// Verificar conexión a MySQL
if ($conn->connect_error) {
    die(json_encode(['error' => 'Error de conexión a MySQL: ' . $conn->connect_error]));
}

// 2. Crear la base de datos si no existe
$sql = "CREATE DATABASE IF NOT EXISTS $database CHARACTER SET utf8 COLLATE utf8_unicode_ci";
if (!$conn->query($sql)) {
    die(json_encode(['error' => 'Error al crear base de datos: ' . $conn->error]));
}

// 3. Seleccionar la base de datos
if (!$conn->select_db($database)) {
    die(json_encode(['error' => 'Error al seleccionar base de datos: ' . $conn->error]));
}

// 4. Configurar charset
$conn->set_charset("utf8");

// 5. Crear tabla equipos si no existe
$tableEquipos = "CREATE TABLE IF NOT EXISTS equipos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    af VARCHAR(50) NOT NULL UNIQUE,
    modelo VARCHAR(100) NOT NULL,
    serie VARCHAR(100),
    estado VARCHAR(50) NOT NULL,
    ubicacion VARCHAR(100) NOT NULL,
    contrato VARCHAR(50),
    fecha_registro DATE NOT NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if (!$conn->query($tableEquipos)) {
    die(json_encode(['error' => 'Error al crear tabla equipos: ' . $conn->error]));
}

// 6. Crear tabla casos si no existe (con todos los campos)
$tableCasos = "CREATE TABLE IF NOT EXISTS casos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contrato VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    incidencia VARCHAR(100),
    diagnostico TEXT,
    solucion TEXT,
    af_recogido VARCHAR(50),
    modelo_recogido VARCHAR(100),
    serie_antigua VARCHAR(100),
    af_instalado VARCHAR(50),
    modelo_instalado VARCHAR(100),
    serie_nueva VARCHAR(100),
    estado_recogido VARCHAR(50) DEFAULT 'Funcional',
    estado_instalado VARCHAR(50) DEFAULT 'Nuevo',
    velocidad_eth_down DECIMAL(10,2),
    velocidad_eth_up DECIMAL(10,2),
    velocidad_wifi24_down DECIMAL(10,2),
    velocidad_wifi24_up DECIMAL(10,2),
    velocidad_wifi5_down DECIMAL(10,2),
    velocidad_wifi5_up DECIMAL(10,2),
    observaciones TEXT,
    estado VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if (!$conn->query($tableCasos)) {
    die(json_encode(['error' => 'Error al crear tabla casos: ' . $conn->error]));
}

// Si la tabla ya existía pero sin los nuevos campos, agregarlos
$checkColumn1 = $conn->query("SHOW COLUMNS FROM casos LIKE 'estado_recogido'");
if ($checkColumn1->num_rows == 0) {
    $conn->query("ALTER TABLE casos ADD COLUMN estado_recogido VARCHAR(50) DEFAULT 'Funcional'");
}

$checkColumn2 = $conn->query("SHOW COLUMNS FROM casos LIKE 'estado_instalado'");
if ($checkColumn2->num_rows == 0) {
    $conn->query("ALTER TABLE casos ADD COLUMN estado_instalado VARCHAR(50) DEFAULT 'Nuevo'");
}

// Agregar columnas de modelo si no existen
$checkColumn3 = $conn->query("SHOW COLUMNS FROM casos LIKE 'modelo_recogido'");
if ($checkColumn3->num_rows == 0) {
    $conn->query("ALTER TABLE casos ADD COLUMN modelo_recogido VARCHAR(100) DEFAULT NULL");
}

$checkColumn4 = $conn->query("SHOW COLUMNS FROM casos LIKE 'modelo_instalado'");
if ($checkColumn4->num_rows == 0) {
    $conn->query("ALTER TABLE casos ADD COLUMN modelo_instalado VARCHAR(100) DEFAULT NULL");
}

// 7. Crear tabla usuarios si no existe
$tableUsuarios = "CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('tecnico', 'admin') DEFAULT 'tecnico',
    estado ENUM('pendiente', 'activo', 'inactivo') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if (!$conn->query($tableUsuarios)) {
    die(json_encode(['error' => 'Error al crear tabla usuarios: ' . $conn->error]));
}

// Agregar columna usuario_id a tabla casos si no existe
$checkColumnUsuarioCasos = $conn->query("SHOW COLUMNS FROM casos LIKE 'usuario_id'");
if ($checkColumnUsuarioCasos->num_rows == 0) {
    $conn->query("ALTER TABLE casos ADD COLUMN usuario_id INT NULL");
}

// Agregar columna usuario_id a tabla equipos si no existe
$checkColumnUsuarioEquipos = $conn->query("SHOW COLUMNS FROM equipos LIKE 'usuario_id'");
if ($checkColumnUsuarioEquipos->num_rows == 0) {
    $conn->query("ALTER TABLE equipos ADD COLUMN usuario_id INT NULL");
}

// Agregar columna password_plano a tabla usuarios si no existe para permitir recuperación/consulta por el Administrador
$checkColumnPasswordPlano = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'password_plano'");
if ($checkColumnPasswordPlano->num_rows == 0) {
    $conn->query("ALTER TABLE usuarios ADD COLUMN password_plano VARCHAR(255) NULL");
}

// Backfill password_plano para el administrador principal si es NULL
$conn->query("UPDATE usuarios SET password_plano = 'AxsAdmin123!' WHERE usuario = 'admin@axs.com' AND password_plano IS NULL");

// Crear tabla conf_vdsl si no existe, y limpiar la anterior si existiera
$conn->query("DROP TABLE IF EXISTS configuraciones_vdsl");

$tableVdsl = "CREATE TABLE IF NOT EXISTS conf_vdsl (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contrato VARCHAR(50) NOT NULL UNIQUE,
    fecha DATE NOT NULL,
    nodo VARCHAR(50) NOT NULL,
    puerto VARCHAR(50) NOT NULL,
    ssid_24 VARCHAR(100),
    ssid_5g VARCHAR(100),
    wlan_password VARCHAR(100),
    pppoe_usuario VARCHAR(100),
    pppoe_password VARCHAR(100),
    puerta_enlace VARCHAR(100),
    mascara VARCHAR(100),
    inicio_dhcp VARCHAR(100),
    fin_dhcp VARCHAR(100),
    dns_primario VARCHAR(100),
    dns_secundario VARCHAR(100),
    admin_usuario VARCHAR(100),
    admin_password_defecto VARCHAR(100),
    admin_password_1 VARCHAR(100),
    admin_password_2 VARCHAR(100)
)";

if (!$conn->query($tableVdsl)) {
    die(json_encode(['error' => 'Error al crear tabla conf_vdsl: ' . $conn->error]));
}

// Agregar columnas para IPoE a la tabla conf_vdsl
$checkColumnVdslTipo = $conn->query("SHOW COLUMNS FROM conf_vdsl LIKE 'tipo_servicio'");
if ($checkColumnVdslTipo->num_rows == 0) {
    $conn->query("ALTER TABLE conf_vdsl ADD COLUMN tipo_servicio VARCHAR(20) DEFAULT 'PPPoE'");
}
$checkColumnVdslIp = $conn->query("SHOW COLUMNS FROM conf_vdsl LIKE 'ip_publica'");
if ($checkColumnVdslIp->num_rows == 0) {
    $conn->query("ALTER TABLE conf_vdsl ADD COLUMN ip_publica VARCHAR(100) DEFAULT NULL");
}
$checkColumnVdslRem = $conn->query("SHOW COLUMNS FROM conf_vdsl LIKE 'rem_address'");
if ($checkColumnVdslRem->num_rows == 0) {
    $conn->query("ALTER TABLE conf_vdsl ADD COLUMN rem_address VARCHAR(100) DEFAULT NULL");
}
$checkColumnVdslRemMask = $conn->query("SHOW COLUMNS FROM conf_vdsl LIKE 'rem_mascara'");
if ($checkColumnVdslRemMask->num_rows == 0) {
    $conn->query("ALTER TABLE conf_vdsl ADD COLUMN rem_mascara VARCHAR(50) DEFAULT NULL");
}

// Todo está bien, pero no enviamos nada para no romper el JSON
// Las funciones que incluyen este archivo enviarán su propia respuesta
?>