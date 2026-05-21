<?php
require_once 'middleware_auth.php';

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

$whereBodega = "WHERE ubicacion = 'Mi gabeta (Bodega)' AND estado != 'DAÑADO TORMENTA'";
$whereContrato = "WHERE ubicacion = 'Contrato' AND estado != 'DAÑADO TORMENTA'";
$whereEnCasa = "WHERE ubicacion = 'En Casa' AND estado != 'DAÑADO TORMENTA'";
$whereDevueltos = "WHERE ubicacion = 'Devuelto Equipo' AND estado != 'DAÑADO TORMENTA'";
$whereDanadosBodega = "WHERE estado = 'DAÑADO TORMENTA' AND ubicacion = 'Mi gabeta (Bodega)'";
$whereDanadosContrato = "WHERE estado = 'DAÑADO TORMENTA' AND ubicacion = 'Contrato'";
$whereDanadosCasa = "WHERE estado = 'DAÑADO TORMENTA' AND ubicacion = 'En Casa'";
$whereCasos = "";

if ($targetUserId !== null) {
    $whereBodega .= " AND usuario_id = $targetUserId";
    $whereContrato .= " AND usuario_id = $targetUserId";
    $whereEnCasa .= " AND usuario_id = $targetUserId";
    $whereDevueltos .= " AND usuario_id = $targetUserId";
    $whereDanadosBodega .= " AND usuario_id = $targetUserId";
    $whereDanadosContrato .= " AND usuario_id = $targetUserId";
    $whereDanadosCasa .= " AND usuario_id = $targetUserId";
    $whereCasos = " WHERE usuario_id = $targetUserId";
}

$resultBodega = $conn->query("SELECT * FROM equipos $whereBodega ORDER BY modelo ASC");
$equiposBodega = [];
while ($row = $resultBodega->fetch_assoc()) {
    $equiposBodega[] = $row;
}

$resultContrato = $conn->query("SELECT * FROM equipos $whereContrato ORDER BY modelo ASC");
$equiposContrato = [];
while ($row = $resultContrato->fetch_assoc()) {
    $equiposContrato[] = $row;
}

$resultEnCasa = $conn->query("SELECT * FROM equipos $whereEnCasa ORDER BY modelo ASC");
$equiposEnCasa = [];
while ($row = $resultEnCasa->fetch_assoc()) {
    $equiposEnCasa[] = $row;
}

$resultDevueltos = $conn->query("SELECT * FROM equipos $whereDevueltos ORDER BY modelo ASC");
$equiposDevueltos = [];
while ($row = $resultDevueltos->fetch_assoc()) {
    $equiposDevueltos[] = $row;
}

$resultDanadosBodega = $conn->query("SELECT * FROM equipos $whereDanadosBodega ORDER BY modelo ASC");
$equiposDanadosBodega = [];
while ($row = $resultDanadosBodega->fetch_assoc()) {
    $equiposDanadosBodega[] = $row;
}

$resultDanadosContrato = $conn->query("SELECT * FROM equipos $whereDanadosContrato ORDER BY modelo ASC");
$equiposDanadosContrato = [];
while ($row = $resultDanadosContrato->fetch_assoc()) {
    $equiposDanadosContrato[] = $row;
}

$resultDanadosCasa = $conn->query("SELECT * FROM equipos $whereDanadosCasa ORDER BY modelo ASC");
$equiposDanadosCasa = [];
while ($row = $resultDanadosCasa->fetch_assoc()) {
    $equiposDanadosCasa[] = $row;
}

// Total de dañados por tormenta
$totalDanadosTormenta = count($equiposDanadosBodega) + count($equiposDanadosContrato) + count($equiposDanadosCasa);

$resultCasos = $conn->query("SELECT * FROM casos $whereCasos ORDER BY fecha DESC, fecha_registro DESC");
$casos = [];
while ($row = $resultCasos->fetch_assoc()) {
    $casos[] = $row;
}

// Función para generar el archivo Excel
function generarExcel() {
    global $equiposBodega, $equiposContrato, $equiposEnCasa, $equiposDevueltos,
           $equiposDanadosBodega, $equiposDanadosContrato, $equiposDanadosCasa, $casos, $totalDanadosTormenta;
    
    $content = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <title>Reporte AXS Completo</title>
    <style>
        th { background-color: #2c7be5; color: white; }
        .total { font-weight: bold; background-color: #e9ecef; }
        .danado { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>';

    // HOJA 1: EQUIPOS EN BODEGA
    $content .= '<div><h2>📦 EQUIPOS EN BODEGA</h2>';
    $content .= '<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>';
    foreach ($equiposBodega as $equipo) {
        $content .= '<tr>';
        $content .= '<td>' . htmlspecialchars($equipo['af']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['modelo']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['serie'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['estado']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['ubicacion']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['contrato'] ?? 'Sin asignar') . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['fecha_registro']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['observaciones'] ?? '') . '</td>';
        $content .= '</tr>';
    }
    $content .= '</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong>' . count($equiposBodega) . '</strong></td></tr></tfoot></table></div>';
    $content .= '<br clear="all" style="page-break-before: always;">';

    // HOJA 2: EQUIPOS EN CONTRATO
    $content .= '<div><h2>📄 EQUIPOS EN CONTRATO</h2>';
    $content .= '<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>';
    foreach ($equiposContrato as $equipo) {
        $content .= '<tr>';
        $content .= '<td>' . htmlspecialchars($equipo['af']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['modelo']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['serie'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['estado']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['ubicacion']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['contrato'] ?? 'Sin asignar') . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['fecha_registro']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['observaciones'] ?? '') . '</td>';
        $content .= '</tr>';
    }
    $content .= '</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong>' . count($equiposContrato) . '</strong></td></tr></tfoot></table></div>';
    $content .= '<br clear="all" style="page-break-before: always;">';

    // HOJA 3: EQUIPOS EN CASA
    $content .= '<div><h2>🏠 EQUIPOS EN CASA</h2>';
    $content .= '<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>';
    foreach ($equiposEnCasa as $equipo) {
        $content .= '<tr>';
        $content .= '<td>' . htmlspecialchars($equipo['af']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['modelo']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['serie'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['estado']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['ubicacion']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['contrato'] ?? 'Sin asignar') . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['fecha_registro']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['observaciones'] ?? '') . '</td>';
        $content .= '</tr>';
    }
    $content .= '</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong>' . count($equiposEnCasa) . '</strong></td></tr></tfoot></table></div>';
    $content .= '<br clear="all" style="page-break-before: always;">';

    // HOJA 3b: EQUIPOS DEVUELTOS
    $content .= '<div><h2>↩️ EQUIPOS DEVUELTOS</h2>';
    $content .= '<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>';
    foreach ($equiposDevueltos as $equipo) {
        $content .= '<tr>';
        $content .= '<td>' . htmlspecialchars($equipo['af']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['modelo']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['serie'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['estado']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['ubicacion']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['contrato'] ?? 'Sin asignar') . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['fecha_registro']) . '</td>';
        $content .= '<td>' . htmlspecialchars($equipo['observaciones'] ?? '') . '</td>';
        $content .= '</tr>';
    }
    $content .= '</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong>' . count($equiposDevueltos) . '</strong></td></tr></tfoot></table></div>';
    $content .= '<br clear="all" style="page-break-before: always;">';

    // HOJA 4: EQUIPOS DAÑADOS POR TORMENTA (SEPARADOS POR UBICACIÓN)
    $content .= '<div><h2>⚡ EQUIPOS DAÑADOS POR TORMENTA</h2>';
    
    // Dañados en Bodega
    if (!empty($equiposDanadosBodega)) {
        $content .= '<h3>📦 En Bodega</h3>';
        $content .= '<table border="1" cellpadding="5" cellspacing="0" class="danado"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>';
        foreach ($equiposDanadosBodega as $equipo) {
            $content .= '<tr>';
            $content .= '<td>' . htmlspecialchars($equipo['af']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['modelo']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['serie'] ?? '-') . '</td>';
            $content .= '<td><strong>⚡ ' . htmlspecialchars($equipo['estado']) . '</strong></td>';
            $content .= '<td>' . htmlspecialchars($equipo['ubicacion']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['contrato'] ?? 'Sin asignar') . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['fecha_registro']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['observaciones'] ?? '') . '</td>';
            $content .= '</tr>';
        }
        $content .= '</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN BODEGA:</strong></td><td><strong>' . count($equiposDanadosBodega) . '</strong></td></tr></tfoot></table>';
    }
    
    // Dañados en Contrato
    if (!empty($equiposDanadosContrato)) {
        $content .= '<h3>📄 En Contrato</h3>';
        $content .= '<table border="1" cellpadding="5" cellspacing="0" class="danado"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>';
        foreach ($equiposDanadosContrato as $equipo) {
            $content .= '<tr>';
            $content .= '<td>' . htmlspecialchars($equipo['af']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['modelo']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['serie'] ?? '-') . '</td>';
            $content .= '<td><strong>⚡ ' . htmlspecialchars($equipo['estado']) . '</strong></td>';
            $content .= '<td>' . htmlspecialchars($equipo['ubicacion']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['contrato'] ?? 'Sin asignar') . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['fecha_registro']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['observaciones'] ?? '') . '</td>';
            $content .= '</tr>';
        }
        $content .= '</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN CONTRATO:</strong></td><td><strong>' . count($equiposDanadosContrato) . '</strong></td></tr></tfoot></table>';
    }
    
    // Dañados en Casa
    if (!empty($equiposDanadosCasa)) {
        $content .= '<h3>🏠 En Casa</h3>';
        $content .= '<table border="1" cellpadding="5" cellspacing="0" class="danado"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>';
        foreach ($equiposDanadosCasa as $equipo) {
            $content .= '<tr>';
            $content .= '<td>' . htmlspecialchars($equipo['af']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['modelo']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['serie'] ?? '-') . '</td>';
            $content .= '<td><strong>⚡ ' . htmlspecialchars($equipo['estado']) . '</strong></td>';
            $content .= '<td>' . htmlspecialchars($equipo['ubicacion']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['contrato'] ?? 'Sin asignar') . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['fecha_registro']) . '</td>';
            $content .= '<td>' . htmlspecialchars($equipo['observaciones'] ?? '') . '</td>';
            $content .= '</tr>';
        }
        $content .= '</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN CASA:</strong></td><td><strong>' . count($equiposDanadosCasa) . '</strong></td></tr></tfoot></table>';
    }
    
    // Mensaje si no hay dañados por tormenta
    if ($totalDanadosTormenta == 0) {
        $content .= '<p>No hay equipos dañados por tormenta registrados.</p>';
    }
    
    $content .= '<br clear="all" style="page-break-before: always;">';

    // HOJA 5: CASOS
    $content .= '<div><h2>📋 CASOS REGISTRADOS</h2>';
    $content .= '<table border="1" cellpadding="5" cellspacing="0" style="font-size: 10px;"><thead><tr>';
    $content .= '<th>ID</th><th>Contrato</th><th>Fecha</th><th>Hora</th><th>Incidencia</th>';
    $content .= '<th>Diagnóstico</th><th>Solución</th>';
    $content .= '<th>AF Recogido</th><th>Modelo Recogido</th><th>Serie Antigua</th>';
    $content .= '<th>Estado Recogido</th><th>AF Instalado</th><th>Modelo Instalado</th><th>Serie Nueva</th><th>Estado Instalado</th>';
    $content .= '<th>Vel. ETH</th><th>Vel. 2.4G</th><th>Vel. 5G</th><th>Observaciones</th><th>Estado</th><th>Fecha Reg.</th>';
    $content .= '</tr></thead><tbody>';
    foreach ($casos as $caso) {
        $hora = $caso['hora_inicio'] ?? '--:--';
        if ($caso['hora_fin']) $hora .= ' - ' . $caso['hora_fin'];
        $content .= '<tr>';
        $content .= '<td>' . $caso['id'] . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['contrato']) . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['fecha']) . '</td>';
        $content .= '<td>' . htmlspecialchars($hora) . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['incidencia'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars(substr($caso['diagnostico'] ?? '-', 0, 150)) . '</td>';
        $content .= '<td>' . htmlspecialchars(substr($caso['solucion'] ?? '-', 0, 150)) . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['af_recogido'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['modelo_recogido'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['serie_antigua'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['estado_recogido'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['af_instalado'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['modelo_instalado'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['serie_nueva'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['estado_instalado'] ?? '-') . '</td>';
        $content .= '<td>' . ($caso['velocidad_eth_down'] ?? 0) . '/' . ($caso['velocidad_eth_up'] ?? 0) . '</td>';
        $content .= '<td>' . ($caso['velocidad_wifi24_down'] ?? 0) . '/' . ($caso['velocidad_wifi24_up'] ?? 0) . '</td>';
        $content .= '<td>' . ($caso['velocidad_wifi5_down'] ?? 0) . '/' . ($caso['velocidad_wifi5_up'] ?? 0) . '</td>';
        $content .= '<td>' . htmlspecialchars(substr($caso['observaciones'] ?? '-', 0, 100)) . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['estado'] ?? '-') . '</td>';
        $content .= '<td>' . htmlspecialchars($caso['fecha_registro']) . '</td>';
        $content .= '</tr>';
    }
    $content .= '</tbody><tfoot><tr class="total"><td colspan="20"><strong>TOTAL CASOS:</strong></td>';
    $content .= '<td><strong>' . count($casos) . '</strong></td>';
    $content .= '</table></tfoot></table></div>';
    
    return $content;
}

// Verificar si se solicita descargar Excel
if (isset($_GET['download']) && $_GET['download'] == 'excel') {
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename="reporte_axs_completo.xls"');
    header('Cache-Control: max-age=0');
    echo generarExcel();
    exit;
}

// Si no, mostrar en el navegador con botón de descarga
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte AXS - Todos los Registros</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #e9ecef;
            padding: 20px;
        }
        
        .btn-download {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .btn-download:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #1a3b5d;
            margin-bottom: 10px;
            font-size: 1.8rem;
        }
        
        .fecha {
            color: #6c757d;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
        }
        
        h2 {
            color: #2c7be5;
            margin-top: 30px;
            margin-bottom: 15px;
            padding: 10px;
            background: #e9ecef;
            border-radius: 8px;
        }
        
        h3 {
            margin-top: 15px;
            margin-bottom: 10px;
            padding: 8px;
            background: #f5c6cb;
            border-radius: 5px;
            color: #721c24;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
        }
        
        th {
            background-color: #2c7be5;
            color: white;
            padding: 10px;
            text-align: left;
        }
        
        td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        tr:hover {
            background-color: #e9ecef;
        }
        
        .total {
            font-weight: bold;
            background-color: #e9ecef;
        }
        
        .table-wrapper {
            overflow-x: auto;
            margin-bottom: 20px;
        }
        
        .danado-badge {
            background-color: #f8d7da;
            color: #721c24;
            font-weight: bold;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            th, td {
                font-size: 11px;
                padding: 5px;
            }
            .btn-download {
                padding: 8px 16px;
                font-size: 0.85em;
            }
        }
    </style>
</head>
<body>

<button class="btn-download" onclick="window.location.href='?download=excel'">
    📊 Descargar Excel
</button>

<div class="container">
    <h1>📊 Reporte General AXS</h1>
    <div class="fecha">Fecha de generación: <?php echo date('d/m/Y H:i:s'); ?></div>
    
    <!-- EQUIPOS EN BODEGA -->
    <h2>📦 EQUIPOS EN BODEGA</h2>
    <div class="table-wrapper">
        <table border="1">
            <thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead>
            <tbody>
                <?php if (empty($equiposBodega)): ?>
                    <tr><td colspan="8" align="center">No hay equipos en bodega</td></tr>
                <?php else: ?>
                    <?php foreach ($equiposBodega as $equipo): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($equipo['af']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['modelo']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['serie'] ?? '-'); ?></td>
                        <td><?php echo htmlspecialchars($equipo['estado']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['ubicacion']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['contrato'] ?? 'Sin asignar'); ?></td>
                        <td><?php echo htmlspecialchars($equipo['fecha_registro']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['observaciones'] ?? ''); ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
            <tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong><?php echo count($equiposBodega); ?></strong></td></tr></tfoot>
        </table>
    </div>
    
    <!-- EQUIPOS EN CONTRATO -->
    <h2>📄 EQUIPOS EN CONTRATO</h2>
    <div class="table-wrapper">
        <table border="1">
            <thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead>
            <tbody>
                <?php if (empty($equiposContrato)): ?>
                    <tr><td colspan="8" align="center">No hay equipos en contrato</td></tr>
                <?php else: ?>
                    <?php foreach ($equiposContrato as $equipo): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($equipo['af']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['modelo']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['serie'] ?? '-'); ?></td>
                        <td><?php echo htmlspecialchars($equipo['estado']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['ubicacion']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['contrato'] ?? 'Sin asignar'); ?></td>
                        <td><?php echo htmlspecialchars($equipo['fecha_registro']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['observaciones'] ?? ''); ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
            <tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong><?php echo count($equiposContrato); ?></strong></td></tr></tfoot>
        </table>
    </div>
    
    <!-- EQUIPOS EN CASA -->
    <h2>🏠 EQUIPOS EN CASA</h2>
    <div class="table-wrapper">
        <table border="1">
            <thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead>
            <tbody>
                <?php if (empty($equiposEnCasa)): ?>
                    <tr><td colspan="8" align="center">No hay equipos en casa</td></tr>
                <?php else: ?>
                    <?php foreach ($equiposEnCasa as $equipo): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($equipo['af']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['modelo']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['serie'] ?? '-'); ?></td>
                        <td><?php echo htmlspecialchars($equipo['estado']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['ubicacion']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['contrato'] ?? 'Sin asignar'); ?></td>
                        <td><?php echo htmlspecialchars($equipo['fecha_registro']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['observaciones'] ?? ''); ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
            <tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong><?php echo count($equiposEnCasa); ?></strong></td></tr></tfoot>
        </table>
    </div>
    
    <!-- EQUIPOS DEVUELTOS -->
    <h2>↩️ EQUIPOS DEVUELTOS</h2>
    <div class="table-wrapper">
        <table border="1">
            <thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead>
            <tbody>
                <?php if (empty($equiposDevueltos)): ?>
                    <tr><td colspan="8" align="center">No hay equipos devueltos</td></tr>
                <?php else: ?>
                    <?php foreach ($equiposDevueltos as $equipo): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($equipo['af']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['modelo']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['serie'] ?? '-'); ?></td>
                        <td><?php echo htmlspecialchars($equipo['estado']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['ubicacion']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['contrato'] ?? 'Sin asignar'); ?></td>
                        <td><?php echo htmlspecialchars($equipo['fecha_registro']); ?></td>
                        <td><?php echo htmlspecialchars($equipo['observaciones'] ?? ''); ?></td>
                    </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
            <tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong><?php echo count($equiposDevueltos); ?></strong></td></tr></tfoot>
        </table>
    </div>
    
    <!-- EQUIPOS DAÑADOS POR TORMENTA (SEPARADOS POR UBICACIÓN) -->
    <h2 style="background: #f8d7da; color: #721c24;">⚡ EQUIPOS DAÑADOS POR TORMENTA</h2>
    
    <?php if (!empty($equiposDanadosBodega)): ?>
    <h3>📦 En Bodega</h3>
    <div class="table-wrapper">
        <table border="1">
            <thead style="background: #721c24; color: white;"><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead>
            <tbody>
                <?php foreach ($equiposDanadosBodega as $equipo): ?>
                <tr style="background: #f8d7da;">
                    <td><?php echo htmlspecialchars($equipo['af']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['modelo']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['serie'] ?? '-'); ?></td>
                    <td><strong>⚡ <?php echo htmlspecialchars($equipo['estado']); ?></strong></td>
                    <td><?php echo htmlspecialchars($equipo['ubicacion']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['contrato'] ?? 'Sin asignar'); ?></td>
                    <td><?php echo htmlspecialchars($equipo['fecha_registro']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['observaciones'] ?? ''); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN BODEGA:</strong></td><td><strong><?php echo count($equiposDanadosBodega); ?></strong></td></tr></tfoot>
        </table>
    </div>
    <?php endif; ?>
    
    <?php if (!empty($equiposDanadosContrato)): ?>
    <h3>📄 En Contrato</h3>
    <div class="table-wrapper">
        <table border="1">
            <thead style="background: #721c24; color: white;"><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead>
            <tbody>
                <?php foreach ($equiposDanadosContrato as $equipo): ?>
                <tr style="background: #f8d7da;">
                    <td><?php echo htmlspecialchars($equipo['af']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['modelo']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['serie'] ?? '-'); ?></td>
                    <td><strong>⚡ <?php echo htmlspecialchars($equipo['estado']); ?></strong></td>
                    <td><?php echo htmlspecialchars($equipo['ubicacion']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['contrato'] ?? 'Sin asignar'); ?></td>
                    <td><?php echo htmlspecialchars($equipo['fecha_registro']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['observaciones'] ?? ''); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN CONTRATO:</strong></td><td><strong><?php echo count($equiposDanadosContrato); ?></strong></td></tr></tfoot>
        </table>
    </div>
    <?php endif; ?>
    
    <?php if (!empty($equiposDanadosCasa)): ?>
    <h3>🏠 En Casa</h3>
    <div class="table-wrapper">
        <table border="1">
            <thead style="background: #721c24; color: white;"><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead>
            <tbody>
                <?php foreach ($equiposDanadosCasa as $equipo): ?>
                <tr style="background: #f8d7da;">
                    <td><?php echo htmlspecialchars($equipo['af']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['modelo']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['serie'] ?? '-'); ?></td>
                    <td><strong>⚡ <?php echo htmlspecialchars($equipo['estado']); ?></strong></td>
                    <td><?php echo htmlspecialchars($equipo['ubicacion']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['contrato'] ?? 'Sin asignar'); ?></td>
                    <td><?php echo htmlspecialchars($equipo['fecha_registro']); ?></td>
                    <td><?php echo htmlspecialchars($equipo['observaciones'] ?? ''); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN CASA:</strong></td><td><strong><?php echo count($equiposDanadosCasa); ?></strong></td></tr></tfoot>
        </table>
    </div>
    <?php endif; ?>
    
    <?php if (empty($equiposDanadosBodega) && empty($equiposDanadosContrato) && empty($equiposDanadosCasa)): ?>
    <div class="table-wrapper">
        <table border="1">
            <tbody><tr><td align="center">No hay equipos dañados por tormenta</td></tr>
        </tbody>
    </table>
    </div>
    <?php endif; ?>
    
    <!-- CASOS REGISTRADOS -->
    <h2>📋 CASOS REGISTRADOS</h2>
    <div class="table-wrapper">
        <table border="1" style="font-size: 10px;">
            <thead><tr>
                <th>ID</th><th>Contrato</th><th>Fecha</th><th>Hora</th><th>Incidencia</th>
                <th>Diagnóstico</th><th>Solución</th>
                <th>AF Recogido</th><th>Modelo Recogido</th><th>Serie Antigua</th>
                <th>Estado Recogido</th><th>AF Instalado</th><th>Modelo Instalado</th><th>Serie Nueva</th><th>Estado Instalado</th>
                <th>Vel. ETH</th><th>Vel. 2.4G</th><th>Vel. 5G</th><th>Observaciones</th><th>Estado</th><th>Fecha Reg.</th>
            </tr></thead>
            <tbody>
                <?php if (empty($casos)): ?>
                    <tr><td colspan="21" align="center">No hay casos registrados</td></tr>
                <?php else: ?>
                    <?php foreach ($casos as $caso): ?>
                        <?php 
                        $hora = $caso['hora_inicio'] ?? '--:--';
                        if ($caso['hora_fin']) {
                            $hora .= ' - ' . $caso['hora_fin'];
                        }
                        ?>
                        <tr>
                            <td><?php echo $caso['id']; ?></td>
                            <td><?php echo htmlspecialchars($caso['contrato']); ?></td>
                            <td><?php echo htmlspecialchars($caso['fecha']); ?></td>
                            <td><?php echo htmlspecialchars($hora); ?></td>
                            <td><?php echo htmlspecialchars($caso['incidencia'] ?? '-'); ?></td>
                            <td style="max-width: 300px;"><?php echo htmlspecialchars(substr($caso['diagnostico'] ?? '-', 0, 150)); ?></td>
                            <td style="max-width: 300px;"><?php echo htmlspecialchars(substr($caso['solucion'] ?? '-', 0, 150)); ?></td>
                            <td><?php echo htmlspecialchars($caso['af_recogido'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($caso['modelo_recogido'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($caso['serie_antigua'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($caso['estado_recogido'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($caso['af_instalado'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($caso['modelo_instalado'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($caso['serie_nueva'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($caso['estado_instalado'] ?? '-'); ?></td>
                            <td><?php echo ($caso['velocidad_eth_down'] ?? 0) . '/' . ($caso['velocidad_eth_up'] ?? 0); ?></td>
                            <td><?php echo ($caso['velocidad_wifi24_down'] ?? 0) . '/' . ($caso['velocidad_wifi24_up'] ?? 0); ?></td>
                            <td><?php echo ($caso['velocidad_wifi5_down'] ?? 0) . '/' . ($caso['velocidad_wifi5_up'] ?? 0); ?></td>
                            <td style="max-width: 200px;"><?php echo htmlspecialchars(substr($caso['observaciones'] ?? '-', 0, 100)); ?></td>
                            <td><?php echo htmlspecialchars($caso['estado'] ?? '-'); ?></td>
                            <td><?php echo htmlspecialchars($caso['fecha_registro']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
            <tfoot><tr class="total"><td colspan="20"><strong>TOTAL CASOS:</strong></td><td><strong><?php echo count($casos); ?></strong></td></tr></tfoot>
        </table>
    </div>
    
    <!-- RESUMEN GENERAL -->
    <h2>📊 RESUMEN GENERAL</h2>
    <div class="table-wrapper">
        <table border="1" style="width: auto;">
            <tr><td><strong>Equipos en Bodega:</strong></td><td><?php echo count($equiposBodega); ?></td></tr>
            <tr><td><strong>Equipos en Contrato:</strong></td><td><?php echo count($equiposContrato); ?></td></tr>
            <tr><td><strong>Equipos en Casa:</strong></td><td><?php echo count($equiposEnCasa); ?></td></tr>
            <tr><td><strong>Equipos Devueltos:</strong></td><td><?php echo count($equiposDevueltos); ?></td></tr>
            <tr style="background: #f8d7da;"><td><strong>⚡ Equipos DAÑADO TORMENTA en Bodega:</strong></td><td><strong><?php echo count($equiposDanadosBodega); ?></strong></td></tr>
            <tr style="background: #f8d7da;"><td><strong>⚡ Equipos DAÑADO TORMENTA en Contrato:</strong></td><td><strong><?php echo count($equiposDanadosContrato); ?></strong></td></tr>
            <tr style="background: #f8d7da;"><td><strong>⚡ Equipos DAÑADO TORMENTA en Casa:</strong></td><td><strong><?php echo count($equiposDanadosCasa); ?></strong></td></tr>
            <tr class="total"><td><strong>Total Equipos (excluyendo DAÑADO TORMENTA):</strong></td><td><?php echo count($equiposBodega) + count($equiposContrato) + count($equiposEnCasa) + count($equiposDevueltos); ?></td></tr>
            <tr class="total"><td><strong>Total Equipos DAÑADO TORMENTA:</strong></td><td><strong><?php echo $totalDanadosTormenta; ?></strong></td></tr>
            <tr class="total"><td><strong>Total Equipos (incluyendo DAÑADO TORMENTA):</strong></td><td><strong><?php echo count($equiposBodega) + count($equiposContrato) + count($equiposEnCasa) + count($equiposDevueltos) + $totalDanadosTormenta; ?></strong></td></tr>
            <tr><td><strong>Total Casos Registrados:</strong></td><td><?php echo count($casos); ?></td></tr>
        </table>
    </div>
</div>

</body>
</html>
<?php
$conn->close();
?>