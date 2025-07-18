<?php
include 'db_connect.php';
header('Content-Type: application/json');

$driverId = $_GET['driverId'] ?? null;

if (!$driverId) {
    echo json_encode(['success' => false, 'message' => 'ID de chofer no proporcionado']);
    exit;
}

try {
    // Obtener ruta asignada para hoy
    $query = "SELECT r.* 
              FROM rutas r
              JOIN horarios h ON h.ruta_id = r.id
              WHERE h.chofer_id = ?
              AND h.fecha = CURDATE()
              LIMIT 1";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $driverId);
    $stmt->execute();
    $route = $stmt->get_result()->fetch_assoc();
    
    if ($route) {
        // Obtener paradas de la ruta
        $paradasQuery = "SELECT * FROM paradas WHERE ruta_id = ? ORDER BY orden";
        $stmt = $conn->prepare($paradasQuery);
        $stmt->bind_param("i", $route['id']);
        $stmt->execute();
        $paradas = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $route['paradas'] = $paradas;
    }
    
    echo json_encode([
        'success' => true,
        'route' => $route ?: null
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>