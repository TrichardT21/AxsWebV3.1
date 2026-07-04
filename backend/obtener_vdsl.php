<?php
require_once 'middleware_auth.php';

$sql = "SELECT * FROM conf_vdsl ORDER BY id DESC LIMIT 50";

$result = $conn->query($sql);
if (!$result) {
    echo json_encode(['error' => 'Error al obtener registros: ' . $conn->error]);
    exit();
}

$registros = [];
while ($row = $result->fetch_assoc()) {
    $registros[] = $row;
}

echo json_encode($registros);
$conn->close();
?>
