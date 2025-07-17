<?php
include 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'];
    $email = $data['email'];
    $choferId = $data['choferId'];
    $password = $data['password'];
    $confirmPassword = $data['confirmPassword'];
    
    // Validaciones
    if ($password !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'Las contraseñas no coinciden']);
        exit;
    }
    
    // Verificar si el email ya existe
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
        exit;
    }
    
    // Insertar nuevo usuario
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, id_chofer, password, tipo_usuario) VALUES (?, ?, ?, SHA2(?, 256), 'chofer')");
    $stmt->bind_param("ssss", $name, $email, $choferId, $password);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Usuario registrado con éxito']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario']);
    }
    
    $stmt->close();
}

$conn->close();
?>