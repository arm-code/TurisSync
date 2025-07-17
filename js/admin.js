document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado - Iniciando aplicación");

    // 1. Verificar autenticación
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        console.warn("No hay usuario autenticado, redirigiendo a login");
        window.location.href = 'index.html';
        return;
    }

    // 2. Mostrar información del usuario
    const usernameElement = document.getElementById('admin-username');
    const badgeElement = usernameElement ? usernameElement.querySelector('.admin-badge') : null;

    if (usernameElement && badgeElement) {
        usernameElement.textContent = user.nombre || 'Usuario';
        badgeElement.textContent = user.tipo_usuario === 'administrador' ? 'Administrador' : 'Chofer';
    } else {
        console.error("Elementos del DOM para mostrar información de usuario no encontrados");
    }

    // 3. Configurar botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    } else {
        console.error("Botón de logout no encontrado");
    }

    // 4. Configurar pestañas
    const tabs = document.querySelectorAll('.admin-tabs .tab-button');
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                const tabId = this.getAttribute('data-tab');
                const tabSection = document.getElementById(`${tabId}-section`);
                if (tabSection) {
                    tabSection.classList.add('active');
                }
            });
        });
    } else {
        console.error("No se encontraron pestañas para configurar");
    }

    // 5. Configurar modales
    const setupModals = () => {
        // Modal para nuevo horario
        const newScheduleBtn = document.getElementById('new-schedule');
        const horarioModal = document.getElementById('form-horario');
        
        if (newScheduleBtn && horarioModal) {
            newScheduleBtn.addEventListener('click', function() {
                loadChoferes(); // Cargar choferes cada vez que se abre el modal
                loadRutasForSelect(); // Cargar rutas cada vez que se abre el modal
                horarioModal.style.display = 'block';
            });

            const closeHorario = horarioModal.querySelector('.close-modal');
            if (closeHorario) {
                closeHorario.addEventListener('click', function() {
                    horarioModal.style.display = 'none';
                });
            }
        }

        // Modal para nueva ruta
        const newRouteBtn = document.getElementById('new-route');
        const rutaModal = document.getElementById('form-ruta');
        
        if (newRouteBtn && rutaModal) {
            newRouteBtn.addEventListener('click', function() {
                rutaModal.style.display = 'block';
            });

            const closeRuta = rutaModal.querySelector('.close-modal');
            if (closeRuta) {
                closeRuta.addEventListener('click', function() {
                    rutaModal.style.display = 'none';
                });
            }
        }

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', function(e) {
            if (horarioModal && e.target === horarioModal) {
                horarioModal.style.display = 'none';
            }
            if (rutaModal && e.target === rutaModal) {
                rutaModal.style.display = 'none';
            }
        });
    };
    setupModals();

    // 6. Configurar formularios
    const setupForms = () => {
        // Formulario de horarios
        const horarioForm = document.getElementById('horario-form');
        if (horarioForm) {
            horarioForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = {
                    fecha: document.getElementById('fecha').value,
                    horaInicio: document.getElementById('horaInicio').value,
                    horaFin: document.getElementById('horaFin').value,
                    ruta_id: document.getElementById('ruta').value,
                    chofer_id: document.getElementById('chofer').value
                };

                // Validación mejorada
                const errors = [];
                if (!formData.fecha) errors.push("Fecha");
                if (!formData.horaInicio) errors.push("Hora de inicio");
                if (!formData.horaFin) errors.push("Hora de fin");
                if (!formData.ruta_id || formData.ruta_id === "") errors.push("Ruta");
                if (!formData.chofer_id || formData.chofer_id === "") errors.push("Chofer");
                
                if (errors.length > 0) {
                    alert(`Por favor complete los siguientes campos:\n${errors.join("\n")}`);
                    return;
                }

                try {
                    const response = await fetch('php/horarios.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            action: 'create',
                            ...formData
                        })
                    });

                    const responseText = await response.text();
                    console.log('Respuesta del servidor:', responseText);
                    
                    try {
                        const data = JSON.parse(responseText);
                        
                        if (data.success) {
                            alert('Horario guardado con éxito');
                            document.getElementById('form-horario').style.display = 'none';
                            this.reset();
                            loadHorarios();
                        } else {
                            alert(`Error: ${data.message || 'Error al guardar el horario'}\n${data.details || ''}`);
                        }
                    } catch (e) {
                        console.error('Error parseando JSON:', e);
                        alert(`Respuesta inesperada del servidor:\n${responseText}`);
                    }
                } catch (error) {
                    console.error('Error en la solicitud:', error);
                    alert('Error al conectar con el servidor:\n' + error.message);
                }
            });
        }

        // Formulario de rutas
        const rutaForm = document.getElementById('ruta-form');
        if (rutaForm) {
            // Botón para agregar paradas
            const agregarParadaBtn = document.getElementById('agregar-parada');
            if (agregarParadaBtn) {
                agregarParadaBtn.addEventListener('click', function() {
                    const listaParadas = document.getElementById('lista-paradas');
                    const paradaId = Date.now();
                    
                    const paradaElement = document.createElement('div');
                    paradaElement.className = 'parada-item';
                    paradaElement.dataset.id = paradaId;
                    paradaElement.innerHTML = `
                        <div class="form-group">
                            <label>Nombre de la Parada:</label>
                            <input type="text" class="parada-nombre" required>
                        </div>
                        <div class="form-group">
                            <label>Dirección:</label>
                            <input type="text" class="parada-direccion">
                        </div>
                        <button type="button" class="btn btn-remove-parada" data-id="${paradaId}">Eliminar Parada</button>
                        <hr>
                    `;
                    
                    listaParadas.appendChild(paradaElement);
                });
            }

            // Eliminar parada
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('btn-remove-parada')) {
                    const paradaId = e.target.dataset.id;
                    const paradaElement = document.querySelector(`.parada-item[data-id="${paradaId}"]`);
                    if (paradaElement) {
                        paradaElement.remove();
                    }
                }
            });

            // Enviar formulario de ruta
            rutaForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const nombre = document.getElementById('nombreRuta').value;
                const descripcion = document.getElementById('descripcionRuta').value;
                
                // Recoger todas las paradas
                const paradas = [];
                document.querySelectorAll('.parada-item').forEach(item => {
                    const nombre = item.querySelector('.parada-nombre').value;
                    const direccion = item.querySelector('.parada-direccion').value;
                    
                    if (nombre) { // Solo agregar paradas con nombre
                        paradas.push({
                            nombre: nombre,
                            direccion: direccion || ''
                        });
                    }
                });
                
                if (paradas.length === 0) {
                    alert('Debe agregar al menos una parada válida');
                    return;
                }
                
                try {
                    const response = await fetch('php/rutas.php?action=create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nombre,
                            descripcion,
                            paradas
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('Ruta creada con éxito');
                        document.getElementById('form-ruta').style.display = 'none';
                        this.reset();
                        document.getElementById('lista-paradas').innerHTML = '';
                        loadRutas();
                    } else {
                        alert(data.message || 'Error al guardar la ruta');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al conectar con el servidor');
                }
            });
        }
    };
    setupForms();

    // 7. Cargar datos iniciales
    loadInitialData();

    // Función para cargar datos iniciales
    async function loadInitialData() {
        await loadChoferes();
        await loadRutasForSelect();
        await loadHorarios();
        await loadRutas();
    }

    // Función para cargar choferes
    async function loadChoferes() {
        try {
            const response = await fetch('php/usuarios.php?action=getChoferes');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data.success) {
                const select = document.getElementById('chofer');
                if (select) {
                    select.innerHTML = '<option value="">Seleccione un chofer</option>';
                    
                    data.choferes.forEach(chofer => {
                        const option = document.createElement('option');
                        option.value = chofer.id;
                        option.textContent = `${chofer.nombre}${chofer.email ? ` (${chofer.email})` : ''}`;
                        select.appendChild(option);
                    });
                }
            } else {
                console.error('Error al cargar choferes:', data.message);
                alert('Error al cargar la lista de choferes');
            }
        } catch (error) {
            console.error('Error al cargar choferes:', error);
            alert('Error al cargar la lista de choferes');
        }
    }

    // Función para cargar rutas en el selector
    async function loadRutasForSelect() {
        try {
            const response = await fetch('php/rutas.php?action=getAll');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data.success) {
                const select = document.getElementById('ruta');
                if (select) {
                    select.innerHTML = '<option value="">Seleccione una ruta</option>';
                    
                    data.rutas.forEach(ruta => {
                        const option = document.createElement('option');
                        option.value = ruta.id;
                        option.textContent = ruta.nombre;
                        select.appendChild(option);
                    });
                }
            } else {
                console.error('Error al cargar rutas:', data.message);
            }
        } catch (error) {
            console.error('Error al cargar rutas:', error);
        }
    }

    // Función para cargar horarios
    async function loadHorarios() {
        try {
            const response = await fetch('php/horarios.php?action=getAll');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data.success) {
                renderHorarios(data.horarios);
            } else {
                console.error(data.message);
                alert('Error al cargar horarios: ' + data.message);
            }
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            alert('Error al cargar la lista de horarios');
        }
    }
    
    // Función para renderizar horarios
    function renderHorarios(horarios) {
        const lista = document.getElementById('lista-horarios');
        if (!lista) return;
        
        lista.innerHTML = '';
        
        if (!horarios || horarios.length === 0) {
            lista.innerHTML = '<p class="no-data">No hay horarios registrados</p>';
            return;
        }
        
        horarios.forEach(h => {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.innerHTML = `
                <div class="schedule-header">
                    <strong>${h.fecha}</strong>
                    <span class="status-badge ${h.estado === 'activo' ? 'active' : 'inactive'}">${h.estado}</span>
                </div>
                <div class="schedule-details">
                    <div class="detail">
                        <span class="label">Hora Inicio:</span>
                        <span class="value">${h.hora_inicio}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Hora Fin:</span>
                        <span class="value">${h.hora_fin}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Ruta Asignada:</span>
                        <span class="value">${h.ruta_nombre || 'No asignada'}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Chofer:</span>
                        <span class="value">${h.chofer_nombre || 'No asignado'}</span>
                    </div>
                </div>
                <div class="schedule-actions">
                    <button class="btn btn-edit" data-id="${h.id}">Editar</button>
                    <button class="btn btn-delete" data-id="${h.id}">Eliminar</button>
                </div>
            `;
            lista.appendChild(item);
        });
    }
    
    // Función para cargar rutas en la lista principal
    async function loadRutas() {
        try {
            const response = await fetch('php/rutas.php?action=getAll');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (data.success) {
                renderRutas(data.rutas);
            } else {
                console.error(data.message);
                alert('Error al cargar rutas: ' + data.message);
            }
        } catch (error) {
            console.error('Error al cargar rutas:', error);
            alert('Error al cargar la lista de rutas');
        }
    }
    
    // Función para renderizar rutas
    function renderRutas(rutas) {
        const lista = document.getElementById('lista-rutas');
        if (!lista) return;
        
        lista.innerHTML = '';
        
        if (!rutas || rutas.length === 0) {
            lista.innerHTML = '<p class="no-data">No hay rutas registradas</p>';
            return;
        }
        
        rutas.forEach(r => {
            const item = document.createElement('div');
            item.className = 'route-item';
            item.innerHTML = `
                <div class="route-header">
                    <h3>${r.nombre}</h3>
                    <span class="badge">${r.num_paradas || 0} paradas</span>
                </div>
                ${r.descripcion ? `<p class="route-description">${r.descripcion}</p>` : ''}
                <div class="route-stops">
                    <h4>Paradas:</h4>
                    ${r.paradas && r.paradas.length > 0 ? `
                    <ol>
                        ${r.paradas.map(p => `<li>${p.nombre}${p.direccion ? ` (${p.direccion})` : ''}</li>`).join('')}
                    </ol>
                    ` : '<p>No hay paradas registradas</p>'}
                </div>
                <div class="route-actions">
                    <button class="btn btn-edit" data-id="${r.id}">Editar</button>
                    <button class="btn btn-delete" data-id="${r.id}">Eliminar</button>
                </div>
            `;
            lista.appendChild(item);
        });
    }
});