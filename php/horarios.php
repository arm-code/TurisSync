<?php
include 'db_connect.php';

header('Content-Type: application/json');

// Habilitar CORS para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Configurar zona horaria
date_default_timezone_set('America/Mexico_City');

// Registrar solicitud para depuración
file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Solicitud recibida: " . file_get_contents('php://input'), FILE_APPEND);

// Manejar solicitud OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Obtener acción según el método
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? null;
} else {
    $action = $_GET['action'] ?? null;
}

// Validar acción recibida
if (!$action) {
    $response = [
        'success' => false,
        'message' => 'Acción no especificada',
        'received_data' => $_SERVER['REQUEST_METHOD'] === 'POST' ? $input : $_GET
    ];
    file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error: " . json_encode($response), FILE_APPEND);
    echo json_encode($response);
    exit;
}

// Procesar acciones
switch ($action) {
    case 'getAll':
        // Obtener todos los horarios con información relacionada
        $stmt = $conn->prepare("
            SELECT 
                h.id,
                DATE_FORMAT(h.fecha, '%Y-%m-%d') as fecha,
                TIME_FORMAT(h.hora_inicio, '%H:%i') as hora_inicio,
                TIME_FORMAT(h.hora_fin, '%H:%i') as hora_fin,
                h.estado,
                r.id as ruta_id,
                r.nombre as ruta_nombre,
                u.id as chofer_id,
                u.nombre as chofer_nombre
            FROM horarios h
            LEFT JOIN rutas r ON h.ruta_id = r.id
            LEFT JOIN usuarios u ON h.chofer_id = u.id
            ORDER BY h.fecha DESC, h.hora_inicio ASC
        ");
        
        if (!$stmt->execute()) {
            $error = $stmt->error;
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error SQL: " . $error, FILE_APPEND);
            echo json_encode(['success' => false, 'message' => 'Error al obtener horarios: ' . $error]);
            break;
        }
        
        $result = $stmt->get_result();
        $horarios = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode(['success' => true, 'horarios' => $horarios]);
        break;
        
    case 'create':
        // Validar datos requeridos
        $requiredFields = ['fecha', 'horaInicio', 'horaFin', 'ruta_id', 'chofer_id'];
        $missingFields = [];
        
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                $missingFields[] = $field;
            }
        }
        
        if (!empty($missingFields)) {
            $response = [
                'success' => false,
                'message' => 'Campos requeridos faltantes: ' . implode(', ', $missingFields),
                'missing_fields' => $missingFields
            ];
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error validación: " . json_encode($response), FILE_APPEND);
            echo json_encode($response);
            exit;
        }
        
        // Validar que exista el chofer
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ? AND tipo_usuario = 'chofer'");
        $stmt->bind_param("i", $input['chofer_id']);
        
        if (!$stmt->execute()) {
            $error = $stmt->error;
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error validación chofer: " . $error, FILE_APPEND);
            echo json_encode(['success' => false, 'message' => 'Error al validar chofer: ' . $error]);
            exit;
        }
        
        if ($stmt->get_result()->num_rows === 0) {
            $response = [
                'success' => false,
                'message' => 'El chofer seleccionado no existe o no es válido',
                'chofer_id' => $input['chofer_id']
            ];
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error chofer no existe: " . json_encode($response), FILE_APPEND);
            echo json_encode($response);
            exit;
        }
        
        // Validar que exista la ruta
        $stmt = $conn->prepare("SELECT id FROM rutas WHERE id = ?");
        $stmt->bind_param("i", $input['ruta_id']);
        
        if (!$stmt->execute()) {
            $error = $stmt->error;
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error validación ruta: " . $error, FILE_APPEND);
            echo json_encode(['success' => false, 'message' => 'Error al validar ruta: ' . $error]);
            exit;
        }
        
        if ($stmt->get_result()->num_rows === 0) {
            $response = [
                'success' => false,
                'message' => 'La ruta seleccionada no existe',
                'ruta_id' => $input['ruta_id']
            ];
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error ruta no existe: " . json_encode($response), FILE_APPEND);
            echo json_encode($response);
            exit;
        }
        
        // Validar formato de fecha y hora
        if (!DateTime::createFromFormat('Y-m-d', $input['fecha'])) {
            $response = [
                'success' => false,
                'message' => 'Formato de fecha inválido. Use YYYY-MM-DD',
                'fecha_recibida' => $input['fecha']
            ];
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error formato fecha: " . json_encode($response), FILE_APPEND);
            echo json_encode($response);
            exit;
        }
        
        if (!DateTime::createFromFormat('H:i', $input['horaInicio']) || !DateTime::createFromFormat('H:i', $input['horaFin'])) {
            $response = [
                'success' => false,
                'message' => 'Formato de hora inválido. Use HH:MM',
                'hora_inicio' => $input['horaInicio'],
                'hora_fin' => $input['horaFin']
            ];
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error formato hora: " . json_encode($response), FILE_APPEND);
            echo json_encode($response);
            exit;
        }
        
        // Validar que hora fin sea mayor a hora inicio
        if (strtotime($input['horaInicio']) >= strtotime($input['horaFin'])) {
            $response = [
                'success' => false,
                'message' => 'La hora de fin debe ser mayor a la hora de inicio',
                'hora_inicio' => $input['horaInicio'],
                'hora_fin' => $input['horaFin']
            ];
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error horario inválido: " . json_encode($response), FILE_APPEND);
            echo json_encode($response);
            exit;
        }
        
        // Insertar el nuevo horario
        try {
            $conn->begin_transaction();
            
            $stmt = $conn->prepare("
                INSERT INTO horarios 
                (fecha, hora_inicio, hora_fin, ruta_id, chofer_id, estado) 
                VALUES (?, ?, ?, ?, ?, 'activo')
            ");
            
            $stmt->bind_param(
                "sssii", 
                $input['fecha'], 
                $input['horaInicio'], 
                $input['horaFin'], 
                $input['ruta_id'], 
                $input['chofer_id']
            );
            
            if (!$stmt->execute()) {
                throw new Exception($stmt->error);
            }
            
            $insertId = $conn->insert_id;
            $conn->commit();
            
            $response = [
                'success' => true,
                'message' => 'Horario creado exitosamente',
                'horario_id' => $insertId
            ];
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Horario creado: " . json_encode($response), FILE_APPEND);
            echo json_encode($response);
            
        } catch (Exception $e) {
            $conn->rollback();
            $response = [
                'success' => false,
                'message' => 'Error al crear horario: ' . $e->getMessage(),
                'error_details' => $conn->error
            ];
            file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Error transacción: " . json_encode($response), FILE_APPEND);
            echo json_encode($response);
        }
        break;
        
    default:
        $response = [
            'success' => false,
            'message' => 'Acción no válida',
            'action_recibida' => $action,
            'metodo_http' => $_SERVER['REQUEST_METHOD'],
            'datos_recibidos' => $_SERVER['REQUEST_METHOD'] === 'POST' ? $input : $_GET
        ];
        file_put_contents('horarios_log.txt', "\n" . date('Y-m-d H:i:s') . " - Acción inválida: " . json_encode($response), FILE_APPEND);
        echo json_encode($response);
}

$conn->close();
?>