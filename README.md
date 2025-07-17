Aquí tienes un archivo `README.md` completo y detallado para el proyecto **TurisSync**:

````markdown
# TurisSync

**TurisSync** es una plataforma web para la gestión de usuarios y administración de contenido turístico. Desarrollada con PHP y MariaDB, y contenida completamente en Docker para facilitar su despliegue.

---

## 🚀 Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu equipo:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/downloads) (opcional pero recomendado)

---

## 📦 Instalación y ejecución

### 1. Clonar el repositorio

Abre tu terminal o consola y ejecuta:

```bash
git clone https://github.com/arm-code/TurisSync.git
cd TurisSync
````

> Si no tienes Git, puedes descargar el proyecto como `.zip` desde GitHub y extraerlo.

---

### 2. Levantar los contenedores con Docker

Una vez dentro del directorio del proyecto:

```bash
docker compose up -d
```

Esto iniciará tres servicios:

* **MariaDB** (Base de datos)
* **PHP con Apache** (Servidor de backend)
* **phpMyAdmin** (Interfaz web para gestionar la base de datos)

---

### 3. Verificar servicios

* 🌐 Aplicación (backend PHP): [http://localhost:8000](http://localhost:8000)
* 🛠️ phpMyAdmin: [http://localhost:8080](http://localhost:8080)

#### Credenciales para phpMyAdmin:

* **Servidor:** `db`
* **Usuario:** `root`
* **Contraseña:** `rootpassword`

---

## 📁 Estructura del proyecto

```
TurisSync/
│
├── php/                    # Scripts PHP (login, registro, etc.)
│   ├── db_connect.php
│   ├── register.php
│   └── login.php
│
├── init.sql                # Script de inicialización de la base de datos
├── docker-compose.yml      # Configuración de servicios Docker
└── README.md
```

---

## 🧪 Endpoints disponibles

### POST `/php/register.php`

Registra un nuevo usuario.

**Cuerpo (JSON):**

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "tipo_usuario": "turista"
}
```

---

### POST `/php/login.php`

Inicia sesión.

**Cuerpo (JSON):**

```json
{
  "email": "juan@example.com",
  "password": "123456"
}
```

---

## 🐞 Errores comunes

| Problema                               | Solución                                                                                                               |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Class "mysqli" not found`             | Asegúrate que el contenedor PHP tenga la extensión `mysqli` instalada (ya está corregido en la imagen del Dockerfile). |
| El puerto 8000 o 8080 ya está en uso   | Cambia el puerto en el `docker-compose.yml` por uno libre.                                                             |
| Cambios en archivos PHP no se reflejan | Verifica que el volumen esté correctamente montado (`./:/var/www/html`). Reinicia los contenedores si es necesario.    |

---

## 🧼 Detener y limpiar contenedores

Para detener los servicios:

```bash
docker compose down
```

Para eliminar los volúmenes (base de datos incluida):

```bash
docker compose down -v
```

---

## 📚 Créditos

Desarrollado por [@arm-code](https://github.com/arm-code).
Con contribuciones y ayuda de la comunidad.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

```

Puedes guardar este contenido como un archivo llamado `README.md` en la raíz del proyecto. Si necesitas que lo empaquete o suba a tu repo automáticamente, dime y te ayudo.
```
