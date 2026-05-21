<?php
require_once 'middleware_auth.php';

$af = isset($_GET['af']) ? $_GET['af'] : '';

if (empty($af)) {
    echo json_encode(['existe' => false]);
    exit();
}

$stmt = $conn->prepare("SELECT * FROM equipos WHERE af = ?");
$stmt->bind_param("s", $af);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $equipo = $result->fetch_assoc();
    echo json_encode([
        'existe' => true,
        'equipo' => $equipo
    ]);
} else {
    echo json_encode(['existe' => false]);
}

$stmt->close();
$conn->close();
?>