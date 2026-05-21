<?php
require_once 'middleware_auth.php';

// Registrar manejadores de error para depuración
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $msg = "[" . date('Y-m-d H:i:s') . "] ERROR PHP ($errno): $errstr en $errfile:$errline\n";
    file_put_contents(__DIR__ . '/debug_error.log', $msg, FILE_APPEND);
    return false;
});

set_exception_handler(function($exception) {
    $msg = "[" . date('Y-m-d H:i:s') . "] EXCEPCIÓN PHP: " . $exception->getMessage() . "\n" . $exception->getTraceAsString() . "\n";
    file_put_contents(__DIR__ . '/debug_error.log', $msg, FILE_APPEND);
});

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['error' => 'No se recibieron datos']);
    exit();
}

if (empty($data['af']) || empty($data['modelo']) || empty($data['estado']) || empty($data['ubicacion'])) {
    echo json_encode(['error' => 'Campos requeridos: af, modelo, estado, ubicacion']);
    exit();
}

// Validar AF de 8 dígitos
if (!preg_match('/^\d{8}$/', $data['af'])) {
    echo json_encode(['error' => 'El AF debe tener exactamente 8 dígitos numéricos']);
    exit();
}

// Verificar si AF ya existe
$check = $conn->prepare("SELECT id FROM equipos WHERE af = ?");
$check->bind_param("s", $data['af']);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(['error' => 'El AF ' . $data['af'] . ' ya está registrado']);
    $check->close();
    $conn->close();
    exit();
}
$check->close();

// Convertir fecha
$fecha_registro = $data['fecha_registro'];
if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $fecha_registro)) {
    $parts = explode('/', $fecha_registro);
    $fecha_registro = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
}

// Capturar campos opcionales
$serie = isset($data['serie']) ? trim((string)$data['serie']) : '';
$contrato = isset($data['contrato']) ? trim((string)$data['contrato']) : '';
$observaciones = isset($data['observaciones']) ? trim((string)$data['observaciones']) : '';

$sql = "INSERT INTO equipos (af, modelo, serie, estado, ubicacion, contrato, fecha_registro, observaciones, usuario_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssssi", 
    $data['af'], 
    $data['modelo'], 
    $serie,
    $data['estado'], 
    $data['ubicacion'],
    $contrato, 
    $fecha_registro, 
    $observaciones,
    $usuario_actual['id']
);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true, 
        'message' => 'Equipo guardado correctamente',
        'id' => $stmt->insert_id
    ]);
} else {
    $msg = "[" . date('Y-m-d H:i:s') . "] ERROR SQL AL EJECUTAR: " . $stmt->error . "\n";
    file_put_contents(__DIR__ . '/debug_error.log', $msg, FILE_APPEND);
    echo json_encode(['error' => 'Error al guardar: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>