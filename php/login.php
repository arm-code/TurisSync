<?php
include 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = $data['email'];
    $password = $data['password'];
    
    // Consulta preparada para evitar SQL injection
    $stmt = $conn->prepare("SELECT id, nombre, email, tipo_usuario FROM usuarios WHERE email = ? AND password = SHA2(?, 256)");
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['nombre'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_type'] = $user['tipo_usuario'];
        
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
    }
    
    $stmt->close();
}

$conn->close();
?>