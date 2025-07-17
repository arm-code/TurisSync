# TurisSync

**TurisSync** es una plataforma de gestión turística desarrollada con PHP y MySQL. Este proyecto está completamente dockerizado para facilitar su instalación y ejecución en cualquier entorno.

## Requisitos previos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

> Puedes comprobar si están instalados ejecutando:
```bash
docker -v
docker-compose -v
Clonar el repositorio
Abre tu terminal y clona este repositorio:

bash
Copy
Edit
git clone https://github.com/arm-code/TurisSync.git
cd TurisSync
Estructura del proyecto
csharp
Copy
Edit
TurisSync/
├── docker-compose.yml       # Configuración de servicios (base de datos, servidor PHP y phpMyAdmin)
├── php/                     # Archivos PHP principales (registro, login, conexión a DB)
│   ├── db_connect.php
│   ├── register.php
│   ├── login.php
├── init.sql                 # Script de inicialización para la base de datos
├── index.html               # Interfaz inicial (puedes expandirlo)
└── ...
Primeros pasos
1. Construir y levantar los contenedores
Ejecuta el siguiente comando en la raíz del proyecto:

bash
Copy
Edit
docker-compose up --build
Esto hará lo siguiente:

Levantará un contenedor de base de datos MariaDB en el puerto 3306.

Levantará un servidor Apache con PHP 8.0 en el puerto 8000.

Levantará una instancia de phpMyAdmin para administrar la base de datos gráficamente en el puerto 8080.

Ejecutará el script init.sql para crear la base de datos turisync con sus tablas y datos necesarios.

2. Acceder a la aplicación
Frontend / API:
http://localhost:8000

phpMyAdmin:
http://localhost:8080

Usuario: root

Contraseña: rootpassword

Endpoints disponibles
Registro de usuario
POST http://localhost:8000/php/register.php

Body (JSON):

json
Copy
Edit
{
  "nombre": "Juan",
  "email": "juan@correo.com",
  "password": "123456",
  "tipo_usuario": "turista"
}
Inicio de sesión
POST http://localhost:8000/php/login.php

Body (JSON):

json
Copy
Edit
{
  "email": "juan@correo.com",
  "password": "123456"
}
Base de datos
La base de datos se crea automáticamente al iniciar los contenedores. Si deseas revisar o modificarla, accede a phpMyAdmin en http://localhost:8080.

Apagar los contenedores
Para detener todo el entorno:

bash
Copy
Edit
docker-compose down
Si deseas eliminar los volúmenes (y la base de datos):

bash
Copy
Edit
docker-compose down -v
Problemas comunes
❌ Error Class 'mysqli' not found
Asegúrate de que el contenedor PHP tenga instaladas las extensiones necesarias. Este proyecto ya lo incluye automáticamente gracias a la configuración de la imagen.

Créditos
Proyecto desarrollado por arm-code
Dockerización y soporte de despliegue por [colaborador].

Licencia
Este proyecto está bajo la licencia MIT.