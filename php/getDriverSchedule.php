<?php
include 'db_connect.php';
header('Content-Type: application/json');

$driverId = $_GET['driverId'] ?? null;

if (!$driverId) {
    echo json_encode(['success' => false, 'message' => 'ID de chofer no proporcionado']);
    exit;
}

try {
    $query = "SELECT h.*, r.nombre as ruta_nombre 
              FROM horarios h 
              LEFT JOIN rutas r ON h.ruta_id = r.id 
              WHERE h.chofer_id = ? 
              AND h.fecha >= CURDATE() 
              ORDER BY h.fecha, h.hora_inicio";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $driverId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $schedule = [];
    while ($row = $result->fetch_assoc()) {
        $schedule[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'schedule' => $schedule
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>