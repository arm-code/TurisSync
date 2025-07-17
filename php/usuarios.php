<?php
include 'db_connect.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getChoferes':
        $stmt = $conn->prepare("
            SELECT id, nombre, email 
            FROM usuarios 
            WHERE tipo_usuario = 'chofer'
            ORDER BY nombre ASC
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $choferes = $result->fetch_all(MYSQLI_ASSOC);
        
        echo json_encode(['success' => true, 'choferes' => $choferes]);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

$conn->close();
?>