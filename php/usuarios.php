<?php
include 'db_connect.php';

header('Content-Type: application/json');

try {
    // Consulta para obtener los tipos de usuario únicos
    $query = "SELECT DISTINCT tipo_usuario FROM usuarios";
    $result = $conn->query($query);
    
    if ($result) {
        $types = [];
        while ($row = $result->fetch_assoc()) {
            $types[] = $row['tipo_usuario'];
        }
        
        echo json_encode([
            'success' => true,
            'types' => $types
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener tipos de usuario: ' . $conn->error
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>