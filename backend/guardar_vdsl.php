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

if (empty($data['contrato']) || empty($data['fecha']) || empty($data['nodo']) || empty($data['puerto'])) {
    echo json_encode(['error' => 'Contrato, fecha, nodo y puerto son requeridos']);
    exit();
}

$contrato = trim((string)$data['contrato']);
$fecha = trim((string)$data['fecha']);

// Convertir fecha if formatted as YYYY-MM-DD to save, or handle standard conversions
if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $fecha)) {
    $parts = explode('/', $fecha);
    $fecha = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
}

$nodo = trim((string)$data['nodo']);
$puerto = trim((string)$data['puerto']);
$ssid_24 = isset($data['ssid_24']) ? trim((string)$data['ssid_24']) : '';
$ssid_5g = isset($data['ssid_5g']) ? trim((string)$data['ssid_5g']) : '';
$wlan_password = isset($data['wlan_password']) ? trim((string)$data['wlan_password']) : '';
$pppoe_usuario = isset($data['pppoe_usuario']) ? trim((string)$data['pppoe_usuario']) : '';
$pppoe_password = isset($data['pppoe_password']) ? trim((string)$data['pppoe_password']) : '';
$puerta_enlace = isset($data['puerta_enlace']) ? trim((string)$data['puerta_enlace']) : '192.168.1.1';
$mascara = isset($data['mascara']) ? trim((string)$data['mascara']) : '255.255.255.0';
$inicio_dhcp = isset($data['inicio_dhcp']) ? trim((string)$data['inicio_dhcp']) : '192.168.1.200';
$fin_dhcp = isset($data['fin_dhcp']) ? trim((string)$data['fin_dhcp']) : '192.168.1.254';
$dns_primario = isset($data['dns_primario']) ? trim((string)$data['dns_primario']) : '200.105.128.41';
$dns_secundario = isset($data['dns_secundario']) ? trim((string)$data['dns_secundario']) : '9.9.9.9';
$admin_usuario = isset($data['admin_usuario']) ? trim((string)$data['admin_usuario']) : 'admin';
$admin_password_defecto = isset($data['admin_password_defecto']) ? trim((string)$data['admin_password_defecto']) : 'aldmt';
$admin_password_1 = isset($data['admin_password_1']) ? trim((string)$data['admin_password_1']) : '';
$admin_password_2 = isset($data['admin_password_2']) ? trim((string)$data['admin_password_2']) : '';
$tipo_servicio = isset($data['tipo_servicio']) ? trim((string)$data['tipo_servicio']) : 'PPPoE';
$ip_publica = isset($data['ip_publica']) ? trim((string)$data['ip_publica']) : NULL;
$rem_address = isset($data['rem_address']) ? trim((string)$data['rem_address']) : NULL;
$rem_mascara = isset($data['rem_mascara']) ? trim((string)$data['rem_mascara']) : NULL;

$sql = "INSERT INTO conf_vdsl (
    contrato, fecha, nodo, puerto, ssid_24, ssid_5g, wlan_password,
    pppoe_usuario, pppoe_password, puerta_enlace, mascara,
    inicio_dhcp, fin_dhcp, dns_primario, dns_secundario,
    admin_usuario, admin_password_defecto, admin_password_1, admin_password_2,
    tipo_servicio, ip_publica, rem_address, rem_mascara
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    nodo = VALUES(nodo),
    puerto = VALUES(puerto),
    ssid_24 = VALUES(ssid_24),
    ssid_5g = VALUES(ssid_5g),
    wlan_password = VALUES(wlan_password),
    pppoe_usuario = VALUES(pppoe_usuario),
    pppoe_password = VALUES(pppoe_password),
    puerta_enlace = VALUES(puerta_enlace),
    mascara = VALUES(mascara),
    inicio_dhcp = VALUES(inicio_dhcp),
    fin_dhcp = VALUES(fin_dhcp),
    dns_primario = VALUES(dns_primario),
    dns_secundario = VALUES(dns_secundario),
    admin_usuario = VALUES(admin_usuario),
    admin_password_defecto = VALUES(admin_password_defecto),
    admin_password_1 = VALUES(admin_password_1),
    admin_password_2 = VALUES(admin_password_2),
    tipo_servicio = VALUES(tipo_servicio),
    ip_publica = VALUES(ip_publica),
    rem_address = VALUES(rem_address),
    rem_mascara = VALUES(rem_mascara)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Error de preparación: ' . $conn->error]);
    exit();
}

$stmt->bind_param("sssssssssssssssssssssss",
    $contrato, $fecha, $nodo, $puerto, $ssid_24, $ssid_5g, $wlan_password,
    $pppoe_usuario, $pppoe_password, $puerta_enlace, $mascara,
    $inicio_dhcp, $fin_dhcp, $dns_primario, $dns_secundario,
    $admin_usuario, $admin_password_defecto, $admin_password_1, $admin_password_2,
    $tipo_servicio, $ip_publica, $rem_address, $rem_mascara
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Configuración VDSL registrada con éxito']);
} else {
    echo json_encode(['error' => 'Error al guardar la configuración VDSL: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
