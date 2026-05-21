<?php
require_once 'middleware_auth.php';

$targetUserId = $usuario_actual['id'];
if ($usuario_actual['rol'] === 'admin') {
    if (isset($_GET['tecnico_id']) && (int)$_GET['tecnico_id'] > 0) {
        $targetUserId = (int)$_GET['tecnico_id'];
    } else if (isset($_GET['personal']) && $_GET['personal'] === 'true') {
        // El admin está en su vista personal de "Mis Equipos"
        $targetUserId = $usuario_actual['id'];
    } else {
        // Vista global de todos los técnicos
        $targetUserId = null;
    }
}

if ($targetUserId !== null) {
    $stmt = $conn->prepare("SELECT e.*, u.nombre as tecnico_responsable 
                            FROM equipos e 
                            LEFT JOIN usuarios u ON e.usuario_id = u.id 
                            WHERE e.usuario_id = ? 
                            ORDER BY e.fecha_creacion DESC");
    $stmt->bind_param("i", $targetUserId);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query("SELECT e.*, u.nombre as tecnico_responsable 
                            FROM equipos e 
                            LEFT JOIN usuarios u ON e.usuario_id = u.id 
                            ORDER BY e.fecha_creacion DESC");
}

$equipos = [];
while ($row = $result->fetch_assoc()) {
    $equipos[] = $row;
}

if ($targetUserId !== null) {
    $stmt->close();
}

echo json_encode($equipos);
$conn->close();
?>