<?php
require_once 'middleware_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de caso requerido']);
    exit();
}

$id = (int)$data['id'];

// Si el usuario es técnico, verificar que el caso le pertenezca
if ($usuario_actual['rol'] === 'tecnico') {
    $checkOwner = $conn->prepare("SELECT id FROM casos WHERE id = ? AND usuario_id = ?");
    $checkOwner->bind_param("ii", $id, $usuario_actual['id']);
    $checkOwner->execute();
    $checkOwner->store_result();
    if ($checkOwner->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Acceso denegado. No tienes permisos para eliminar este caso.']);
        $checkOwner->close();
        $conn->close();
        exit();
    }
    $checkOwner->close();
}

// Eliminar caso
$stmt = $conn->prepare("DELETE FROM casos WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Caso eliminado correctamente'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar el caso: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
