<?php
$servername = "db";  // Usa "db" si tu PHP está en Docker, o "localhost" si no
$username = "turisync_user";  // Usuario que definimos en docker-compose
$password = "turisync_pass";  // Contraseña que definimos
$dbname = "turisync";
$port = 3306;  // Puerto por defecto de MySQL

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname, port: $port);

// Verificar conexión
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . 
        ". Verifica que los contenedores estén corriendo y las credenciales sean correctas.");
}

// Establecer el charset
$conn->set_charset("utf8");

// Verificar tablas necesarias
$requiredTables = ['usuarios', 'rutas', 'horarios', 'paradas'];  // Añadí 'paradas' que también existe en tu esquema
foreach ($requiredTables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows == 0) {
        die("Error: La tabla $table no existe en la base de datos. " .
            "Verifica que el script de inicialización se ejecutó correctamente.");
    }
}

// echo "Conexión exitosa a la base de datos";
?>