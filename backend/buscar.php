<?php
require_once 'middleware_auth.php';

$termino = isset($_GET['q']) ? trim($_GET['q']) : '';
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'equipos';

if (empty($termino)) {
    echo json_encode([]);
    exit();
}

$targetUserId = $usuario_actual['id'];
if ($usuario_actual['rol'] === 'admin') {
    if (isset($_GET['tecnico_id']) && (int)$_GET['tecnico_id'] > 0) {
        $targetUserId = (int)$_GET['tecnico_id'];
    } else if (isset($_GET['personal']) && $_GET['personal'] === 'true') {
        $targetUserId = $usuario_actual['id'];
    } else {
        $targetUserId = null;
    }
}

$likeTermino = "%$termino%";

// Buscar en equipos o casos
if ($tipo === 'equipos') {
    if ($targetUserId !== null) {
        $sql = "SELECT id, af, modelo, serie, estado, ubicacion, contrato, fecha_registro, observaciones, usuario_id
                FROM equipos 
                WHERE (af LIKE ? OR 
                      modelo LIKE ? OR 
                      serie LIKE ? OR
                      contrato LIKE ? OR 
                      ubicacion LIKE ?) AND usuario_id = ?
                ORDER BY fecha_registro DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssi", $likeTermino, $likeTermino, $likeTermino, $likeTermino, $likeTermino, $targetUserId);
    } else {
        $sql = "SELECT e.*, u.nombre as tecnico_responsable 
                FROM equipos e 
                LEFT JOIN usuarios u ON e.usuario_id = u.id 
                WHERE e.af LIKE ? OR 
                      e.modelo LIKE ? OR 
                      e.serie LIKE ? OR
                      e.contrato LIKE ? OR 
                      e.ubicacion LIKE ? 
                ORDER BY e.fecha_registro DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", $likeTermino, $likeTermino, $likeTermino, $likeTermino, $likeTermino);
    }
} else {
    // Búsqueda en casos
    if ($targetUserId !== null) {
        $sql = "SELECT * FROM casos 
                WHERE (contrato LIKE ? OR 
                      diagnostico LIKE ? OR 
                      solucion LIKE ? OR 
                      observaciones LIKE ?) AND usuario_id = ?
                ORDER BY fecha_registro DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssi", $likeTermino, $likeTermino, $likeTermino, $likeTermino, $targetUserId);
    } else {
        $sql = "SELECT c.*, u.nombre as registrado_por 
                FROM casos c 
                LEFT JOIN usuarios u ON c.usuario_id = u.id 
                WHERE c.contrato LIKE ? OR 
                      c.diagnostico LIKE ? OR 
                      c.solucion LIKE ? OR 
                      c.observaciones LIKE ? 
                ORDER BY c.fecha_registro DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $likeTermino, $likeTermino, $likeTermino, $likeTermino);
    }
}

$stmt->execute();
$result = $stmt->get_result();

$datos = [];
while ($row = $result->fetch_assoc()) {
    $datos[] = $row;
}

echo json_encode($datos);

$stmt->close();
$conn->close();
?>