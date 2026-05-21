<?php
// registro_solicitud.php
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

if (empty($data['nombre']) || empty($data['usuario']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Todos los campos (nombre, usuario, contraseña) son obligatorios.']);
    exit();
}

$nombre = trim((string)$data['nombre']);
$usuario = trim((string)$data['usuario']);
$password = (string)$data['password'];

// Validar longitud
if (strlen($usuario) < 3) {
    http_response_code(400);
    echo json_encode(['error' => 'El usuario debe tener al menos 3 caracteres.']);
    exit();
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres.']);
    exit();
}

// Verificar si el usuario ya existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$res = $stmt->get_result();
$exists = $res->fetch_assoc();
$stmt->close();

if ($exists) {
    http_response_code(409);
    echo json_encode(['error' => 'El usuario o correo ingresado ya está registrado.']);
    exit();
}

// Hashear la contraseña con bcrypt
$password_hash = password_hash($password, PASSWORD_BCRYPT);
$rol = 'tecnico';
$estado = 'pendiente';

$stmt = $conn->prepare("INSERT INTO usuarios (nombre, usuario, password_hash, password_plano, rol, estado) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $nombre, $usuario, $password_hash, $password, $rol, $estado);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Solicitud enviada correctamente. El administrador debe aprobar tu cuenta antes de que puedas iniciar sesión.'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al procesar la solicitud: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
