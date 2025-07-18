<?php
include 'db_connect.php';
header('Content-Type: application/json');

try {
    // Consulta para obtener todos los tipos de usuario
    $query = "SELECT * FROM user_types";
    $result = $conn->query($query);

    if ($result) {
        $types = [];

        while ($row = $result->fetch_assoc()) {
            $types[] = $row; // Agrega todo el objeto (id, tipo_usuario, descripción, etc.)
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
