<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "turisync";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Establecer el charset
$conn->set_charset("utf8");

// Verificar tablas necesarias
$requiredTables = ['usuarios', 'rutas', 'horarios'];
foreach ($requiredTables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows == 0) {
        die("Error: La tabla $table no existe en la base de datos");
    }
}
?>