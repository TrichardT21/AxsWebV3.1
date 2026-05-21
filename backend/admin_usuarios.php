<?php
// admin_usuarios.php
require_once 'middleware_auth.php'; // Esto maneja CORS y autenticación básica

// Solo permitir al administrador
if ($usuario_actual['rol'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso denegado. Solo administradores pueden realizar esta acción.']);
    exit();
}

// Función para proteger al Administrador Principal Superior
function validarPermisoSuperAdmin($targetId, $usuario_actual, $conn) {
    if ($targetId <= 0) return;
    
    // Obtener información del usuario objetivo de la base de datos
    $stmt = $conn->prepare("SELECT id, usuario FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $targetId);
    $stmt->execute();
    $targetUser = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if ($targetUser) {
        $esTargetSuperAdmin = ((int)$targetUser['id'] === 1 || $targetUser['usuario'] === 'admin@axs.com' || $targetUser['usuario'] === 'richardchoque121@gmail.com');
        $esSolicitanteSuperAdmin = ((int)$usuario_actual['id'] === 1 || $usuario_actual['usuario'] === 'admin@axs.com' || $usuario_actual['usuario'] === 'richardchoque121@gmail.com');
        
        // Si el objetivo es el administrador superior, pero el que realiza la acción NO lo es, bloquear de inmediato
        if ($esTargetSuperAdmin && !$esSolicitanteSuperAdmin) {
            http_response_code(403);
            echo json_encode(['error' => 'Acceso denegado. Solo el Administrador Principal Superior tiene permisos para modificar o desactivar esta cuenta de rango máximo.']);
            $conn->close();
            exit();
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener todos los usuarios o por estado
        $estado = isset($_GET['estado']) ? $_GET['estado'] : 'todos';
        
        $sql = "SELECT u.id, u.nombre, u.usuario, u.password_plano, u.rol, u.estado, u.fecha_creacion,
                       (SELECT COUNT(*) FROM casos c WHERE c.usuario_id = u.id) as total_casos,
                       (SELECT COUNT(*) FROM equipos e WHERE e.usuario_id = u.id) as total_equipos
                FROM usuarios u";
        
        if ($estado === 'pendiente') {
            $sql .= " WHERE u.estado = 'pendiente'";
        } else if ($estado === 'activo') {
            $sql .= " WHERE u.estado = 'activo'";
        }
        
        $sql .= " ORDER BY u.fecha_creacion DESC";
        
        $res = $conn->query($sql);
        $usuarios = [];
        while ($row = $res->fetch_assoc()) {
            $usuarios[] = [
                'id' => (int)$row['id'],
                'nombre' => $row['nombre'],
                'usuario' => $row['usuario'],
                'password_plano' => $row['password_plano'],
                'rol' => $row['rol'],
                'estado' => $row['estado'],
                'fecha_creacion' => $row['fecha_creacion'],
                'total_casos' => (int)$row['total_casos'],
                'total_equipos' => (int)$row['total_equipos']
            ];
        }
        
        echo json_encode($usuarios);
        break;
        
    case 'POST':
        // Crear usuario o cambiar estado/acción
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (isset($data['accion'])) {
            $accion = $data['accion'];
            $targetId = isset($data['id']) ? (int)$data['id'] : 0;
            
            if ($targetId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'ID de usuario inválido']);
                exit();
            }
            
            // Validar protección de Super Admin
            validarPermisoSuperAdmin($targetId, $usuario_actual, $conn);
            
            if ($accion === 'aprobar') {
                $stmt = $conn->prepare("UPDATE usuarios SET estado = 'activo' WHERE id = ?");
                $stmt->bind_param("i", $targetId);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Usuario aprobado correctamente']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Error al aprobar usuario: ' . $stmt->error]);
                }
                $stmt->close();
            } else if ($accion === 'rechazar') {
                // Si rechaza una solicitud, la eliminamos físicamente de la base de datos
                $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ? AND estado = 'pendiente'");
                $stmt->bind_param("i", $targetId);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Solicitud rechazada y eliminada']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Error al rechazar solicitud: ' . $stmt->error]);
                }
                $stmt->close();
            } else if ($accion === 'editar') {
                // Editar usuario existente
                if (empty($data['nombre']) || empty($data['usuario']) || empty($data['rol']) || empty($data['estado'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Los campos nombre, usuario, rol y estado son requeridos.']);
                    exit();
                }
                
                $nombre = trim((string)$data['nombre']);
                $usuario = trim((string)$data['usuario']);
                $rol = trim((string)$data['rol']);
                $estado = trim((string)$data['estado']);
                
                // Validar
                if ($rol !== 'admin' && $rol !== 'tecnico') {
                    http_response_code(400);
                    echo json_encode(['error' => 'Rol inválido']);
                    exit();
                }
                if ($estado !== 'activo' && $estado !== 'inactivo' && $estado !== 'pendiente') {
                    http_response_code(400);
                    echo json_encode(['error' => 'Estado inválido']);
                    exit();
                }
                
                // Verificar si el nuevo usuario ya pertenece a otra persona
                $stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ? AND id != ?");
                $stmt->bind_param("si", $usuario, $targetId);
                $stmt->execute();
                $res = $stmt->get_result();
                if ($res->fetch_assoc()) {
                    http_response_code(409);
                    echo json_encode(['error' => 'El correo o usuario ya está en uso por otra persona.']);
                    $stmt->close();
                    exit();
                }
                $stmt->close();
                
                if (!empty($data['password'])) {
                    $newPasswordHash = password_hash((string)$data['password'], PASSWORD_BCRYPT);
                    $newPasswordPlano = (string)$data['password'];
                    $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, usuario = ?, password_hash = ?, password_plano = ?, rol = ?, estado = ? WHERE id = ?");
                    $stmt->bind_param("ssssssi", $nombre, $usuario, $newPasswordHash, $newPasswordPlano, $rol, $estado, $targetId);
                } else {
                    $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, usuario = ?, rol = ?, estado = ? WHERE id = ?");
                    $stmt->bind_param("ssssi", $nombre, $usuario, $rol, $estado, $targetId);
                }
                
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Error al actualizar usuario: ' . $stmt->error]);
                }
                $stmt->close();
            } else if ($accion === 'desactivar') {
                // No permitir que el admin se desactive a sí mismo
                if ($targetId === (int)$usuario_actual['id']) {
                    http_response_code(400);
                    echo json_encode(['error' => 'No puedes desactivar tu propio usuario administrador.']);
                    exit();
                }
                
                $stmt = $conn->prepare("UPDATE usuarios SET estado = 'inactivo' WHERE id = ?");
                $stmt->bind_param("i", $targetId);
                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Usuario desactivado correctamente']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Error al desactivar usuario: ' . $stmt->error]);
                }
                $stmt->close();
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Acción no válida']);
            }
            exit();
        }
        
        // Crear un usuario de forma directa
        if (empty($data['nombre']) || empty($data['usuario']) || empty($data['password']) || empty($data['rol'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Todos los campos son obligatorios para crear un usuario.']);
            exit();
        }
        
        $nombre = trim((string)$data['nombre']);
        $usuario = trim((string)$data['usuario']);
        $password = (string)$data['password'];
        $rol = trim((string)$data['rol']);
        $estado = 'activo'; // Por defecto los creados por admin ya están activos
        
        // Validar rol
        if ($rol !== 'admin' && $rol !== 'tecnico') {
            http_response_code(400);
            echo json_encode(['error' => 'Rol no válido. Debe ser admin o tecnico.']);
            exit();
        }
        
        // Verificar duplicados
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $stmt->bind_param("s", $usuario);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->fetch_assoc()) {
            http_response_code(409);
            echo json_encode(['error' => 'El usuario o correo ingresado ya está registrado.']);
            $stmt->close();
            exit();
        }
        $stmt->close();
        
        // Registrar
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, usuario, password_hash, password_plano, rol, estado) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $nombre, $usuario, $password_hash, $password, $rol, $estado);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Usuario creado correctamente']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear usuario: ' . $stmt->error]);
        }
        $stmt->close();
        break;
        
    case 'PUT':
        // Editar un usuario existente
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        $targetId = isset($data['id']) ? (int)$data['id'] : 0;
        if ($targetId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de usuario requerido para actualizar']);
            exit();
        }
        
        // Validar protección de Super Admin
        validarPermisoSuperAdmin($targetId, $usuario_actual, $conn);
        
        if (empty($data['nombre']) || empty($data['usuario']) || empty($data['rol']) || empty($data['estado'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Los campos nombre, usuario, rol y estado son requeridos.']);
            exit();
        }
        
        $nombre = trim((string)$data['nombre']);
        $usuario = trim((string)$data['usuario']);
        $rol = trim((string)$data['rol']);
        $estado = trim((string)$data['estado']);
        
        // Validar campos
        if ($rol !== 'admin' && $rol !== 'tecnico') {
            http_response_code(400);
            echo json_encode(['error' => 'Rol inválido']);
            exit();
        }
        if ($estado !== 'activo' && $estado !== 'inactivo' && $estado !== 'pendiente') {
            http_response_code(400);
            echo json_encode(['error' => 'Estado inválido']);
            exit();
        }
        
        // Verificar si el nuevo usuario ya pertenece a otra persona
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ? AND id != ?");
        $stmt->bind_param("si", $usuario, $targetId);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->fetch_assoc()) {
            http_response_code(409);
            echo json_encode(['error' => 'El correo o usuario ya está en uso por otra persona.']);
            $stmt->close();
            exit();
        }
        $stmt->close();
        
        // Si hay una nueva contraseña provista, la hasheamos y la actualizamos
        if (!empty($data['password'])) {
            $newPasswordHash = password_hash((string)$data['password'], PASSWORD_BCRYPT);
            $newPasswordPlano = (string)$data['password'];
            $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, usuario = ?, password_hash = ?, password_plano = ?, rol = ?, estado = ? WHERE id = ?");
            $stmt->bind_param("ssssssi", $nombre, $usuario, $newPasswordHash, $newPasswordPlano, $rol, $estado, $targetId);
        } else {
            $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, usuario = ?, rol = ?, estado = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $nombre, $usuario, $rol, $estado, $targetId);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Usuario actualizado correctamente']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar usuario: ' . $stmt->error]);
        }
        $stmt->close();
        break;
        
    case 'DELETE':
        // Desactivar usuario
        $targetId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($targetId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de usuario inválido']);
            exit();
        }
        
        // Validar protección de Super Admin
        validarPermisoSuperAdmin($targetId, $usuario_actual, $conn);
        
        // No permitir que el admin se desactive a sí mismo
        if ($targetId === (int)$usuario_actual['id']) {
            http_response_code(400);
            echo json_encode(['error' => 'No puedes desactivar tu propio usuario administrador.']);
            exit();
        }
        
        $stmt = $conn->prepare("UPDATE usuarios SET estado = 'inactivo' WHERE id = ?");
        $stmt->bind_param("i", $targetId);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Usuario desactivado correctamente']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al desactivar usuario: ' . $stmt->error]);
        }
        $stmt->close();
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

$conn->close();
?>
