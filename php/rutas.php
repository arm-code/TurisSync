<?php
include 'db_connect.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

switch ($action) {
    case 'getAll':
        // Obtener todas las rutas con sus paradas
        $stmt = $conn->prepare("
            SELECT r.*, 
                   (SELECT COUNT(*) FROM paradas p WHERE p.ruta_id = r.id) as num_paradas
            FROM rutas r
            ORDER BY r.nombre ASC
        ");
        $stmt->execute();
        $rutas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        // Para cada ruta, obtener sus paradas
        foreach ($rutas as &$ruta) {
            $stmt = $conn->prepare("
                SELECT id, nombre, direccion, orden 
                FROM paradas 
                WHERE ruta_id = ? 
                ORDER BY orden ASC
            ");
            $stmt->bind_param("i", $ruta['id']);
            $stmt->execute();
            $ruta['paradas'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }
        
        echo json_encode(['success' => true, 'rutas' => $rutas]);
        break;
        
    case 'create':
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Iniciar transacción
        $conn->begin_transaction();
        
        try {
            // 1. Insertar la ruta principal
            $stmt = $conn->prepare("INSERT INTO rutas (nombre, descripcion) VALUES (?, ?)");
            $stmt->bind_param("ss", $data['nombre'], $data['descripcion']);
            $stmt->execute();
            $ruta_id = $conn->insert_id;
            
            // 2. Insertar las paradas
            $stmt = $conn->prepare("
                INSERT INTO paradas (nombre, direccion, orden, ruta_id) 
                VALUES (?, ?, ?, ?)
            ");
            
            foreach ($data['paradas'] as $orden => $parada) {
                $stmt->bind_param("ssii", 
                    $parada['nombre'],
                    $parada['direccion'],
                    $orden,
                    $ruta_id
                );
                $stmt->execute();
            }
            
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Ruta creada con éxito', 'ruta_id' => $ruta_id]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Error al crear ruta: ' . $e->getMessage()]);
        }
        break;
        
    case 'getParadas':
        $ruta_id = $_GET['ruta_id'];
        $stmt = $conn->prepare("
            SELECT id, nombre, direccion, orden 
            FROM paradas 
            WHERE ruta_id = ? 
            ORDER BY orden ASC
        ");
        $stmt->bind_param("i", $ruta_id);
        $stmt->execute();
        $paradas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        echo json_encode(['success' => true, 'paradas' => $paradas]);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

$conn->close();
?>