<?php
require_once 'middleware_auth.php';

$targetUserId = $usuario_actual['id'];
if ($usuario_actual['rol'] === 'admin') {
    if (isset($_GET['tecnico_id']) && (int)$_GET['tecnico_id'] > 0) {
        $targetUserId = (int)$_GET['tecnico_id'];
    } else if (isset($_GET['personal']) && $_GET['personal'] === 'true') {
        // El admin está en su vista personal de "Mis Casos"
        $targetUserId = $usuario_actual['id'];
    } else {
        // Vista global de todos los técnicos
        $targetUserId = null;
    }
}

if ($targetUserId !== null) {
    $stmt = $conn->prepare("SELECT c.*, u.nombre as registrado_por 
                            FROM casos c 
                            LEFT JOIN usuarios u ON c.usuario_id = u.id 
                            WHERE c.usuario_id = ? 
                            ORDER BY c.fecha_registro DESC");
    $stmt->bind_param("i", $targetUserId);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query("SELECT c.*, u.nombre as registrado_por 
                            FROM casos c 
                            LEFT JOIN usuarios u ON c.usuario_id = u.id 
                            ORDER BY c.fecha_registro DESC");
}

$casos = [];
while ($row = $result->fetch_assoc()) {
    $casos[] = $row;
}

if ($targetUserId !== null) {
    $stmt->close();
}

echo json_encode($casos);
$conn->close();
?>