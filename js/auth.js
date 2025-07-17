document.addEventListener('DOMContentLoaded', function () {
  // Cargar tipos de usuario al iniciar la página
  console.log('Cargando tipos de usuario...');
  loadUserTypes();

  // Manejo de pestañas
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const tabId = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.remove('active');
      });
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const response = await fetch('php/login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = 'admin.html';
        } else {
          alert(data.message || 'Error al iniciar sesión');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
      }
    });
  }

  // Registro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const choferId = document.getElementById('register-chofer-id').value;
      const userType = document.getElementById('register-user-type').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById(
        'register-confirm-password'
      ).value;

      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      if (!userType) {
        alert('Por favor seleccione un tipo de usuario');
        return;
      }

      try {
        const response = await fetch('php/register.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            choferId,
            userType,
            password,
            confirmPassword,
          }),
        });

        const data = await response.json();

        if (data.success) {
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          document.querySelector('.tab-button[data-tab="login"]').click();
          registerForm.reset();
        } else {
          alert(data.message || 'Error al registrar');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor:', error);
      }
    });
  }

  // Función para cargar los tipos de usuario desde la base de datos
  async function loadUserTypes() {
    try {
      const response = await fetch('php/usuarios.php');
      const data = await response.json();

      if (data.success === true) {
        console.log('Tipos de usuario cargados:', data.types);
        const select = document.getElementById('register-user-type');
        data.types.forEach((type) => {
          const option = document.createElement('option');

          option.value = type;
          option.textContent = type;
          select.appendChild(option);
          console.log('Opción agregada:', option);
        });
      } else {
        console.error('Error al cargar tipos de usuario:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
});
