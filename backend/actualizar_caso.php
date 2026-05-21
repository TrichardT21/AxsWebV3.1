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
        echo json_encode(['error' => 'Acceso denegado. No tienes permisos para editar este caso.']);
        $checkOwner->close();
        $conn->close();
        exit();
    }
    $checkOwner->close();
}

// Convertir fecha
$fecha = $data['fecha'];
if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $fecha)) {
    $parts = explode('/', $fecha);
    $fecha = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
}

// Sanitizar campos
$contrato = isset($data['contrato']) ? trim((string)$data['contrato']) : '';
$hora_inicio = isset($data['hora_inicio']) ? (string)$data['hora_inicio'] : null;
$hora_fin = isset($data['hora_fin']) ? (string)$data['hora_fin'] : null;
$incidencia = isset($data['incidencia']) ? trim((string)$data['incidencia']) : '';
$diagnostico = isset($data['diagnostico']) ? trim((string)$data['diagnostico']) : '';
$solucion = isset($data['solucion']) ? trim((string)$data['solucion']) : '';

$af_recogido = isset($data['af_recogido']) ? trim((string)$data['af_recogido']) : '';
$modelo_recogido = isset($data['modelo_recogido']) ? trim((string)$data['modelo_recogido']) : '';
$serie_antigua = isset($data['serie_antigua']) ? trim((string)$data['serie_antigua']) : '';
$estado_recogido = isset($data['estado_recogido']) ? trim((string)$data['estado_recogido']) : 'Funcional';

$af_instalado = isset($data['af_instalado']) ? trim((string)$data['af_instalado']) : '';
$modelo_instalado = isset($data['modelo_instalado']) ? trim((string)$data['modelo_instalado']) : '';
$serie_nueva = isset($data['serie_nueva']) ? trim((string)$data['serie_nueva']) : '';
$estado_instalado = isset($data['estado_instalado']) ? trim((string)$data['estado_instalado']) : 'Nuevo';

$observaciones = isset($data['observaciones']) ? trim((string)$data['observaciones']) : '';
$estado = isset($data['estado']) ? trim((string)$data['estado']) : '';

$velocidad_eth_down = isset($data['velocidad_eth_down']) ? (float)$data['velocidad_eth_down'] : 0;
$velocidad_eth_up = isset($data['velocidad_eth_up']) ? (float)$data['velocidad_eth_up'] : 0;
$velocidad_wifi24_down = isset($data['velocidad_wifi24_down']) ? (float)$data['velocidad_wifi24_down'] : 0;
$velocidad_wifi24_up = isset($data['velocidad_wifi24_up']) ? (float)$data['velocidad_wifi24_up'] : 0;
$velocidad_wifi5_down = isset($data['velocidad_wifi5_down']) ? (float)$data['velocidad_wifi5_down'] : 0;
$velocidad_wifi5_up = isset($data['velocidad_wifi5_up']) ? (float)$data['velocidad_wifi5_up'] : 0;

$sql = "UPDATE casos SET 
        contrato = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, incidencia = ?, diagnostico = ?, solucion = ?,
        af_recogido = ?, modelo_recogido = ?, serie_antigua = ?,
        af_instalado = ?, modelo_instalado = ?, serie_nueva = ?,
        estado_recogido = ?, estado_instalado = ?,
        velocidad_eth_down = ?, velocidad_eth_up = ?,
        velocidad_wifi24_down = ?, velocidad_wifi24_up = ?,
        velocidad_wifi5_down = ?, velocidad_wifi5_up = ?,
        observaciones = ?, estado = ?
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssssssssssssddddddssi",
    $contrato, $fecha, $hora_inicio, $hora_fin, $incidencia, $diagnostico, $solucion,
    $af_recogido, $modelo_recogido, $serie_antigua,
    $af_instalado, $modelo_instalado, $serie_nueva,
    $estado_recogido, $estado_instalado,
    $velocidad_eth_down, $velocidad_eth_up,
    $velocidad_wifi24_down, $velocidad_wifi24_up,
    $velocidad_wifi5_down, $velocidad_wifi5_up,
    $observaciones, $estado, $id
);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Caso actualizado correctamente'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar el caso: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
