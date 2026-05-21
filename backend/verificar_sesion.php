<?php
// verificar_sesion.php
header('Content-Type: application/json');
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No hay sesión activa']);
    exit();
}

require_once 'conexion.php';

$userId = $_SESSION['usuario_id'];

$stmt = $conn->prepare("SELECT id, nombre, usuario, rol, estado FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$res = $stmt->get_result();
$usuario_actual = $res->fetch_assoc();
$stmt->close();

if (!$usuario_actual || $usuario_actual['estado'] !== 'activo') {
    session_destroy();
    http_response_code(401);
    echo json_encode(['error' => 'Usuario inactivo o ya no existe']);
    exit();
}

echo json_encode([
    'success' => true,
    'usuario' => [
        'id' => $usuario_actual['id'],
        'nombre' => $usuario_actual['nombre'],
        'usuario' => $usuario_actual['usuario'],
        'rol' => $usuario_actual['rol']
    ]
]);
?>
