<?php
// login.php
header('Content-Type: application/json');
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

require_once 'conexion.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (empty($data['usuario']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Usuario y contraseña son requeridos']);
    exit();
}

$user = trim((string)$data['usuario']);
$password = (string)$data['password'];

// Buscar usuario en la base de datos
$stmt = $conn->prepare("SELECT id, nombre, usuario, password_hash, rol, estado FROM usuarios WHERE usuario = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$res = $stmt->get_result();
$dbUser = $res->fetch_assoc();
$stmt->close();

if (!$dbUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit();
}

// Verificar contraseña
if (!password_verify($password, $dbUser['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit();
}

// Verificar estado del usuario
if ($dbUser['estado'] === 'pendiente') {
    http_response_code(403);
    echo json_encode(['error' => 'Tu cuenta está pendiente de aprobación por el administrador.']);
    exit();
}

if ($dbUser['estado'] === 'inactivo') {
    http_response_code(403);
    echo json_encode(['error' => 'Tu cuenta ha sido desactivada. Comunícate con el administrador.']);
    exit();
}

// Iniciar sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION['usuario_id'] = $dbUser['id'];
$_SESSION['rol'] = $dbUser['rol'];

echo json_encode([
    'success' => true,
    'usuario' => [
        'id' => $dbUser['id'],
        'nombre' => $dbUser['nombre'],
        'usuario' => $dbUser['usuario'],
        'rol' => $dbUser['rol']
    ]
]);
?>
