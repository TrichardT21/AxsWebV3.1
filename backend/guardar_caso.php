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

if (empty($data['contrato']) || empty($data['fecha'])) {
    echo json_encode(['error' => 'Contrato y fecha son requeridos']);
    exit();
}

// Convertir fecha
$fecha = $data['fecha'];
if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $fecha)) {
    $parts = explode('/', $fecha);
    $fecha = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
}

// === FORZAR A STRING LOS CAMPOS DE TEXTO ===
$contrato = trim((string)$data['contrato']);
$hora_inicio = isset($data['hora_inicio']) ? (string)$data['hora_inicio'] : null;
$hora_fin = isset($data['hora_fin']) ? (string)$data['hora_fin'] : null;
$incidencia = isset($data['incidencia']) ? trim((string)$data['incidencia']) : '';
$diagnostico = isset($data['diagnostico']) ? trim((string)$data['diagnostico']) : '';
$solucion = isset($data['solucion']) ? trim((string)$data['solucion']) : '';

// Campos de equipo recogido
$af_recogido = isset($data['af_recogido']) ? trim((string)$data['af_recogido']) : '';
$modelo_recogido = isset($data['modelo_recogido']) ? trim((string)$data['modelo_recogido']) : '';
$serie_antigua = isset($data['serie_antigua']) ? trim((string)$data['serie_antigua']) : '';
$estado_recogido = isset($data['estado_recogido']) ? trim((string)$data['estado_recogido']) : 'Funcional';

// Campos de equipo instalado
$af_instalado = isset($data['af_instalado']) ? trim((string)$data['af_instalado']) : '';
$modelo_instalado = isset($data['modelo_instalado']) ? trim((string)$data['modelo_instalado']) : '';
$serie_nueva = isset($data['serie_nueva']) ? trim((string)$data['serie_nueva']) : '';
$estado_instalado = isset($data['estado_instalado']) ? trim((string)$data['estado_instalado']) : 'Nuevo';

$observaciones = isset($data['observaciones']) ? trim((string)$data['observaciones']) : '';
$estado = isset($data['estado']) ? trim((string)$data['estado']) : '';

// Velocidades
$velocidad_eth_down = isset($data['velocidad_eth_down']) ? (float)$data['velocidad_eth_down'] : 0;
$velocidad_eth_up = isset($data['velocidad_eth_up']) ? (float)$data['velocidad_eth_up'] : 0;
$velocidad_wifi24_down = isset($data['velocidad_wifi24_down']) ? (float)$data['velocidad_wifi24_down'] : 0;
$velocidad_wifi24_up = isset($data['velocidad_wifi24_up']) ? (float)$data['velocidad_wifi24_up'] : 0;
$velocidad_wifi5_down = isset($data['velocidad_wifi5_down']) ? (float)$data['velocidad_wifi5_down'] : 0;
$velocidad_wifi5_up = isset($data['velocidad_wifi5_up']) ? (float)$data['velocidad_wifi5_up'] : 0;

// Iniciar transacción
$conn->begin_transaction();

try {
    // 1. Insertar el caso
    $sql = "INSERT INTO casos (
        contrato, fecha, hora_inicio, hora_fin, incidencia, diagnostico, solucion,
        af_recogido, modelo_recogido, serie_antigua, 
        af_instalado, modelo_instalado, serie_nueva,
        estado_recogido, estado_instalado,
        velocidad_eth_down, velocidad_eth_up,
        velocidad_wifi24_down, velocidad_wifi24_up,
        velocidad_wifi5_down, velocidad_wifi5_up,
        observaciones, estado, usuario_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssssssssssssddddddssi",
        $contrato, 
        $fecha,
        $hora_inicio, 
        $hora_fin,
        $incidencia, 
        $diagnostico, 
        $solucion,
        $af_recogido,
        $modelo_recogido,
        $serie_antigua,
        $af_instalado,
        $modelo_instalado,
        $serie_nueva,
        $estado_recogido,
        $estado_instalado,
        $velocidad_eth_down, 
        $velocidad_eth_up,
        $velocidad_wifi24_down, 
        $velocidad_wifi24_up,
        $velocidad_wifi5_down, 
        $velocidad_wifi5_up,
        $observaciones, 
        $estado,
        $usuario_actual['id']
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Error al guardar caso: ' . $stmt->error);
    }
    $caso_id = $stmt->insert_id;
    $stmt->close();
    
    $mensajes = [];
    
    // 2. Actualizar equipo recogido (si se ingresó)
    if (!empty($af_recogido)) {
        // Verificar si el equipo ya existe
        $check = $conn->prepare("SELECT id FROM equipos WHERE af = ?");
        $check->bind_param("s", $af_recogido);
        $check->execute();
        $check->store_result();
        
        if ($check->num_rows > 0) {
            // El equipo existe: actualizar (se retira del contrato y se lleva a bodega)
            $update = $conn->prepare("UPDATE equipos SET 
                estado = ?,
                ubicacion = 'Mi gabeta (Bodega)',
                contrato = NULL,
                fecha_registro = CURDATE(),
                usuario_id = ?
                WHERE af = ?");
            $update->bind_param("sis", $estado_recogido, $usuario_actual['id'], $af_recogido);
            if ($update->execute()) {
                $mensajes[] = "✅ Equipo recogido AF: $af_recogido actualizado (ubicación: BODEGA, estado: $estado_recogido)";
            }
            $update->close();
        } else {
            // El equipo NO existe: registrarlo en bodega
            $observacionEquipo = "Equipo recogido del caso " . $contrato;
            $insert = $conn->prepare("INSERT INTO equipos (af, modelo, serie, estado, ubicacion, contrato, fecha_registro, observaciones, usuario_id) 
                VALUES (?, ?, ?, ?, 'Mi gabeta (Bodega)', NULL, CURDATE(), ?, ?)");
            $insert->bind_param("ssssssi", $af_recogido, $modelo_recogido, $serie_antigua, $estado_recogido, $observacionEquipo, $usuario_actual['id']);
            if ($insert->execute()) {
                $mensajes[] = "✅ Nuevo equipo recogido AF: $af_recogido registrado en BODEGA (modelo: $modelo_recogido, serie: $serie_antigua, estado: $estado_recogido)";
            }
            $insert->close();
        }
        $check->close();
    }
    
    // 3. Verificar y actualizar equipo instalado (si se ingresó)
    if (!empty($af_instalado)) {
        // Verificar si el equipo ya existe
        $check = $conn->prepare("SELECT id FROM equipos WHERE af = ?");
        $check->bind_param("s", $af_instalado);
        $check->execute();
        $check->store_result();
        
        if ($check->num_rows > 0) {
            // El equipo existe: actualizar (se asigna al contrato)
            $update = $conn->prepare("UPDATE equipos SET 
                estado = ?,
                ubicacion = 'Contrato',
                contrato = ?,
                fecha_registro = CURDATE(),
                usuario_id = ?
                WHERE af = ?");
            $update->bind_param("sssis", $estado_instalado, $contrato, $usuario_actual['id'], $af_instalado);
            if ($update->execute()) {
                $mensajes[] = "✅ Equipo instalado AF: $af_instalado actualizado (ubicación: CONTRATO $contrato, estado: $estado_instalado)";
            }
            $update->close();
        } else {
            // El equipo NO existe: registrarlo en contrato
            $observacionEquipoInstalado = "Equipo instalado en el caso " . $contrato;
            $insert = $conn->prepare("INSERT INTO equipos (af, modelo, serie, estado, ubicacion, contrato, fecha_registro, observaciones, usuario_id) 
                VALUES (?, ?, ?, ?, 'Contrato', ?, CURDATE(), ?, ?)");
            $insert->bind_param("sssssssi", $af_instalado, $modelo_instalado, $serie_nueva, $estado_instalado, $contrato, $observacionEquipoInstalado, $usuario_actual['id']);
            if ($insert->execute()) {
                $mensajes[] = "✅ Nuevo equipo instalado AF: $af_instalado registrado en CONTRATO $contrato (modelo: $modelo_instalado, serie: $serie_nueva, estado: $estado_instalado)";
            }
            $insert->close();
        }
        $check->close();
    }
    
    // Confirmar transacción
    $conn->commit();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Caso guardado correctamente',
        'id' => $caso_id,
        'mensajes' => $mensajes
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>