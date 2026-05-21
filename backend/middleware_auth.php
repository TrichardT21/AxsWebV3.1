<?php
// middleware_auth.php
// Configurar cabeceras CORS dinámicas para soportar cookies de sesión
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar si el usuario está autenticado por sesión
$userId = null;
if (isset($_SESSION['usuario_id'])) {
    $userId = $_SESSION['usuario_id'];
}

if (!$userId) {
    // Si no hay sesión, responder con 401 No Autorizado
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Debe iniciar sesión.']);
    exit();
}

// Cargar datos completos del usuario actual
require_once 'conexion.php';
$stmt = $conn->prepare("SELECT id, nombre, usuario, rol, estado FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$res = $stmt->get_result();
$usuario_actual = $res->fetch_assoc();
$stmt->close();

if (!$usuario_actual || $usuario_actual['estado'] !== 'activo') {
    // Si el usuario ya no existe o no está activo, destruir sesión
    session_destroy();
    http_response_code(401);
    echo json_encode(['error' => 'Usuario inactivo o no existe.']);
    exit();
}
?>
