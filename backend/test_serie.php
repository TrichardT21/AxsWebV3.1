<?php
require_once 'conexion.php';

// Datos de prueba
$contrato = 'TEST_SERIE3';
$serie_nueva = 'ZTEGDAD0A2EC';

$sql = "INSERT INTO casos (contrato, fecha, incidencia, serie_nueva, estado) 
        VALUES (?, CURDATE(), 'PRUEBA', ?, 'CON SERVICIO NORMAL')";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $contrato, $serie_nueva);

if ($stmt->execute()) {
    echo "✅ Éxito! ID: " . $stmt->insert_id . "<br>";
    echo "serie_nueva guardado: " . $serie_nueva;
} else {
    echo "❌ Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>