<?php
include 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar que todos los campos estén presentes
    if (!isset($data['name'], $data['email'], $data['choferId'], $data['password'], $data['confirmPassword'])) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        exit;
    }
    
    $name = trim($data['name']);
    $email = trim($data['email']);
    $choferId = trim($data['choferId']);
    $password = $data['password'];
    $confirmPassword = $data['confirmPassword'];
    
    // Validaciones adicionales
    if (empty($name) || empty($email) || empty($choferId) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Ningún campo puede estar vacío']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'El formato del correo no es válido']);
        exit;
    }
    
    if ($password !== $confirmPassword) {
        echo json_encode(['success' => false, 'message' => 'Las contraseñas no coinciden']);
        exit;
    }
    
    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 8 caracteres']);
        exit;
    }
    
    // Verificar si el email o id_chofer ya existen
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ? OR id_chofer = ?");
    $stmt->bind_param("ss", $email, $choferId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'El correo o ID de chofer ya están registrados']);
        exit;
    }
    
    // Hash más seguro para la contraseña (mejor que SHA2)
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar nuevo usuario con transacción para mayor seguridad
    $conn->begin_transaction();
    
    try {
        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, id_chofer, password, tipo_usuario) VALUES (?, ?, ?, ?, 'chofer')");
        $stmt->bind_param("ssss", $name, $email, $choferId, $hashedPassword);
        
        if ($stmt->execute()) {
            $conn->commit();
            echo json_encode([
                'success' => true, 
                'message' => 'Usuario registrado con éxito',
                'userId' => $stmt->insert_id
            ]);
        } else {
            throw new Exception('Error al registrar el usuario');
        }
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false, 
            'message' => $e->getMessage(),
            'error' => $conn->error
        ]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conn->close();
?>