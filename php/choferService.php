<?php
include 'db_connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $data['action'] ?? null;

if (!$action) {
    echo json_encode(['success' => false, 'message' => 'Acción no especificada']);
    exit;
}

try {
    switch ($action) {
        case 'start':
            // Lógica para iniciar servicio
            echo json_encode(['success' => true, 'message' => 'Servicio iniciado']);
            break;
            
        case 'end':
            // Lógica para finalizar servicio
            echo json_encode(['success' => true, 'message' => 'Servicio finalizado']);
            break;
            
        case 'complete_stop':
            // Lógica para completar parada
            echo json_encode(['success' => true, 'message' => 'Parada completada']);
            break;
            
        case 'status':
            // Lógica para verificar estado
            $driverId = $_GET['driverId'] ?? null;
            echo json_encode([
                'success' => true,
                'serviceActive' => false // Esto debería venir de la base de datos
            ]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>