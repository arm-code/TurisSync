<?php
header('Content-Type: application/json');
include 'db_connect.php';

try {
    // Consulta para obtener solo choferes
    $query = "SELECT id, nombre, email, id_chofer FROM usuarios WHERE user_type_id = 'chofer' ORDER BY nombre ASC";
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }

    $choferes = [];
    while ($row = $result->fetch_assoc()) {
        $choferes[] = [
            'id' => $row['id'],
            'nombre' => $row['nombre'],
            'email' => $row['email'],
            'id_chofer' => $row['id_chofer'] // Campo adicional si lo necesitas
        ];
    }

    echo json_encode([
        'success' => true,
        'choferes' => $choferes
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>