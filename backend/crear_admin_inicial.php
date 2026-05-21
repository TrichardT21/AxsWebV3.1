<?php
// crear_admin_inicial.php
header('Content-Type: application/json');
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');

require_once 'conexion.php';

// Verificar si ya existe algún administrador para evitar ejecuciones maliciosas posteriores
$checkAdmin = $conn->query("SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1");
if ($checkAdmin && $checkAdmin->num_rows > 0) {
    http_response_code(403);
    echo json_encode([
        'error' => 'Ya existe un administrador en el sistema. Este script de inicialización está deshabilitado por seguridad.'
    ]);
    exit();
}

$conn->begin_transaction();

try {
    // 1. Crear el usuario administrador
    $nombre = 'Administrador Principal';
    $usuario = 'admin@axs.com';
    $password = 'AxsAdmin123!';
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $rol = 'admin';
    $estado = 'activo';
    
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, usuario, password_hash, rol, estado) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $nombre, $usuario, $password_hash, $rol, $estado);
    if (!$stmt->execute()) {
        throw new Exception('Error al insertar el administrador: ' . $stmt->error);
    }
    
    $adminId = $stmt->insert_id;
    $stmt->close();
    
    // 2. Migrar registros históricos
    // Asignar todos los casos con usuario_id NULL al nuevo administrador
    $migracionCasos = $conn->query("UPDATE casos SET usuario_id = $adminId WHERE usuario_id IS NULL");
    if (!$migracionCasos) {
        throw new Exception('Error al migrar casos históricos: ' . $conn->error);
    }
    $casosMigrados = $conn->affected_rows;
    
    // Asignar todos los equipos con usuario_id NULL al nuevo administrador
    $migracionEquipos = $conn->query("UPDATE equipos SET usuario_id = $adminId WHERE usuario_id IS NULL");
    if (!$migracionEquipos) {
        throw new Exception('Error al migrar equipos históricos: ' . $conn->error);
    }
    $equiposMigrados = $conn->affected_rows;
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => '¡Administrador inicial creado correctamente y base de datos migrada!',
        'credenciales' => [
            'usuario' => $usuario,
            'password' => $password,
            'mensaje' => 'Por favor, inicia sesión con estas credenciales y cámbialas en la sección de Gestión de Cuentas.'
        ],
        'migracion' => [
            'casos_re_asignados' => $casosMigrados,
            'equipos_re_asignados' => $equiposMigrados
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'Ocurrió un error al inicializar el sistema: ' . $e->getMessage()]);
}

$conn->close();
?>
