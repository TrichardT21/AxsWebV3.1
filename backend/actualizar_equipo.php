<?php
require_once 'middleware_auth.php';

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

if (empty($data['id']) || empty($data['estado']) || empty($data['ubicacion'])) {
    echo json_encode(['error' => 'Campos requeridos: id, estado, ubicacion']);
    exit();
}

// Si el rol es técnico, validar que el equipo le pertenezca
if ($usuario_actual['rol'] === 'tecnico') {
    $checkOwner = $conn->prepare("SELECT id FROM equipos WHERE id = ? AND usuario_id = ?");
    $checkOwner->bind_param("ii", $data['id'], $usuario_actual['id']);
    $checkOwner->execute();
    $checkOwner->store_result();
    if ($checkOwner->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Acceso denegado. No tienes permisos para actualizar este equipo.']);
        $checkOwner->close();
        $conn->close();
        exit();
    }
    $checkOwner->close();
}

// Convertir fecha
$fecha_registro = $data['fecha_registro'];
if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $fecha_registro)) {
    $parts = explode('/', $fecha_registro);
    $fecha_registro = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
}

// NOTA: NO actualizamos af, modelo, serie - son campos únicos que no deben modificarse
$contrato = isset($data['contrato']) ? trim((string)$data['contrato']) : '';
$observaciones = isset($data['observaciones']) ? trim((string)$data['observaciones']) : '';

$sql = "UPDATE equipos SET 
        estado = ?, 
        ubicacion = ?, 
        contrato = ?, 
        fecha_registro = ?,
        observaciones = ?
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssi", 
    $data['estado'], 
    $data['ubicacion'],
    $contrato, 
    $fecha_registro, 
    $observaciones,
    $data['id']
);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true, 
        'message' => 'Equipo actualizado correctamente',
        'id' => $data['id']
    ]);
} else {
    echo json_encode(['error' => 'Error al actualizar: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>