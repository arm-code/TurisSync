document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado - Iniciando panel chofer");

    // 1. Verificar autenticación y tipo de usuario
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.user_type_id !== 2) {
        console.warn("Acceso no autorizado, redirigiendo a login");
        window.location.href = 'index.html';
        return;
    }

    // 2. Mostrar información del usuario
    const usernameElement = document.getElementById('driver-username');
    const nameElement = document.getElementById('driver-name');
    
    if (usernameElement && nameElement) {
        nameElement.textContent = user.nombre || 'Chofer';
    } else {
        console.error("Elementos del DOM para mostrar información de usuario no encontrados");
    }

    // 3. Configurar botón de logout (reutilizado de admin)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    // 4. Configurar pestañas (versión simplificada de admin)
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
    }

    // 5. Configurar modal de detalles (simplificado)
    const setupModal = () => {
        const modal = document.getElementById('details-modal');
        if (!modal) return;

        const closeModal = modal.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
    setupModal();

    // 6. Configurar controles de servicio
    const setupServiceControls = () => {
        const startBtn = document.getElementById('start-service');
        const endBtn = document.getElementById('end-service');
        
        if (startBtn && endBtn) {
            startBtn.addEventListener('click', async function() {
                try {
                    const response = await fetch('php/choferService.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            action: 'start',
                            chofer_id: user.id
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        startBtn.disabled = true;
                        endBtn.disabled = false;
                        showModal('Servicio Iniciado', 'Has iniciado tu servicio correctamente.');
                        updateServiceStatus(true);
                    } else {
                        alert(data.message || 'Error al iniciar servicio');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al conectar con el servidor');
                }
            });
            
            endBtn.addEventListener('click', async function() {
                try {
                    const response = await fetch('php/choferService.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            action: 'end',
                            chofer_id: user.id
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        startBtn.disabled = false;
                        endBtn.disabled = true;
                        showModal('Servicio Finalizado', 'Has finalizado tu servicio correctamente.');
                        updateServiceStatus(false);
                    } else {
                        alert(data.message || 'Error al finalizar servicio');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al conectar con el servidor');
                }
            });
        }
    };
    setupServiceControls();

    // 7. Cargar datos iniciales
    loadInitialData();

    // Función para cargar datos iniciales
    async function loadInitialData() {
        await loadDriverSchedule(user.id);
        await loadCurrentRoute(user.id);
        await checkServiceStatus(user.id);
    }

    // Función para mostrar modal (reutilizable)
    function showModal(title, content) {
        const modal = document.getElementById('details-modal');
        if (!modal) return;
        
        const titleElement = document.getElementById('modal-title');
        const contentElement = document.getElementById('modal-content');
        
        if (titleElement) titleElement.textContent = title;
        if (contentElement) contentElement.innerHTML = `<p>${content}</p>`;
        
        modal.style.display = 'block';
    }

    // Función para cargar horarios del chofer (similar a admin pero filtrado)
    async function loadDriverSchedule(driverId) {
        try {
            const response = await fetch(`php/getDriverSchedule.php?driverId=${driverId}`);
            const data = await response.json();
            
            if (data.success) {
                renderDriverSchedule(data.schedule);
            } else {
                console.error('Error al cargar horarios:', data.message);
                document.getElementById('driver-schedule').innerHTML = 
                    `<p class="error-message">${data.message || 'Error al cargar horarios'}</p>`;
            }
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            document.getElementById('driver-schedule').innerHTML = 
                '<p class="error-message">Error al cargar horarios</p>';
        }
    }

    // Función para renderizar horarios (adaptada para choferes)
    function renderDriverSchedule(schedule) {
        const container = document.getElementById('driver-schedule');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!schedule || schedule.length === 0) {
            container.innerHTML = '<p class="no-data">No tienes horarios asignados</p>';
            return;
        }
        
        schedule.forEach(item => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.innerHTML = `
                <div class="schedule-header">
                    <h3>${formatDate(item.fecha)}</h3>
                    <span class="status-badge ${item.estado === 'activo' ? 'active' : 'inactive'}">
                        ${item.estado}
                    </span>
                </div>
                <div class="schedule-details">
                    <div class="detail">
                        <span class="label">Horario:</span>
                        <span class="value">${item.hora_inicio} - ${item.hora_fin}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Ruta:</span>
                        <span class="value">${item.ruta_nombre || 'No asignada'}</span>
                    </div>
                </div>
                <button class="btn btn-view-details" data-id="${item.id}">
                    Ver Detalles
                </button>
            `;
            container.appendChild(scheduleItem);
        });
        
        // Configurar botones de detalles
        document.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const scheduleId = this.getAttribute('data-id');
                showScheduleDetails(scheduleId);
            });
        });
    }

    // Función para cargar ruta actual del chofer
    async function loadCurrentRoute(driverId) {
        try {
            const response = await fetch(`php/getCurrentRoute.php?driverId=${driverId}`);
            const data = await response.json();
            
            if (data.success) {
                renderCurrentRoute(data.route);
            } else {
                console.error('Error al cargar ruta:', data.message);
                document.getElementById('current-route').innerHTML = 
                    `<p class="error-message">${data.message || 'No tienes ruta asignada hoy'}</p>`;
            }
        } catch (error) {
            console.error('Error al cargar ruta:', error);
            document.getElementById('current-route').innerHTML = 
                '<p class="error-message">Error al cargar ruta actual</p>';
        }
    }

    // Función para renderizar ruta actual
    function renderCurrentRoute(route) {
        const container = document.getElementById('current-route');
        if (!container) return;
        
        if (!route) {
            container.innerHTML = '<p class="no-data">No tienes ruta asignada para hoy</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="route-info">
                <h3>${route.nombre}</h3>
                ${route.descripcion ? `<p class="route-description">${route.descripcion}</p>` : ''}
                
                <div class="route-stops">
                    <h4>Paradas:</h4>
                    <ol>
                        ${route.paradas.map((parada, index) => `
                            <li class="route-stop" data-stop-id="${parada.id}">
                                <span class="stop-time">${parada.hora_estimada || ''}</span>
                                <span class="stop-name">${index + 1}. ${parada.nombre}</span>
                                <span class="stop-status" data-status="pending"></span>
                                <button class="btn btn-complete-stop" data-stop-id="${parada.id}">
                                    Completar
                                </button>
                            </li>
                        `).join('')}
                    </ol>
                </div>
            </div>
        `;
        
        // Configurar botones para completar paradas
        document.querySelectorAll('.btn-complete-stop').forEach(btn => {
            btn.addEventListener('click', function() {
                const stopId = this.getAttribute('data-stop-id');
                completeStop(stopId);
            });
        });
    }

    // Función para verificar estado del servicio
    async function checkServiceStatus(driverId) {
        try {
            const response = await fetch(`php/choferService.php?action=status&driverId=${driverId}`);
            const data = await response.json();
            
            if (data.success) {
                updateServiceStatus(data.serviceActive);
            }
        } catch (error) {
            console.error('Error al verificar estado:', error);
        }
    }

    // Función para actualizar estado del servicio en UI
    function updateServiceStatus(isActive) {
        const startBtn = document.getElementById('start-service');
        const endBtn = document.getElementById('end-service');
        
        if (startBtn && endBtn) {
            startBtn.disabled = isActive;
            endBtn.disabled = !isActive;
        }
    }

    // Función para completar una parada
    async function completeStop(stopId) {
        try {
            const response = await fetch('php/choferService.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'complete_stop',
                    stop_id: stopId,
                    chofer_id: user.id
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const stopElement = document.querySelector(`.route-stop[data-stop-id="${stopId}"]`);
                if (stopElement) {
                    const statusElement = stopElement.querySelector('.stop-status');
                    if (statusElement) {
                        statusElement.classList.add('completed');
                        statusElement.dataset.status = 'completed';
                    }
                    
                    const completeBtn = stopElement.querySelector('.btn-complete-stop');
                    if (completeBtn) {
                        completeBtn.disabled = true;
                        completeBtn.textContent = 'Completado';
                    }
                }
            } else {
                alert(data.message || 'Error al completar parada');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    }

    // Función auxiliar para formatear fecha
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // Función para mostrar detalles de horario (similar a admin pero simplificado)
    async function showScheduleDetails(scheduleId) {
        try {
            const response = await fetch(`php/getScheduleDetails.php?id=${scheduleId}`);
            const data = await response.json();
            
            if (data.success) {
                showModal(
                    `Detalles del Horario - ${formatDate(data.schedule.fecha)}`,
                    `
                    <div class="detail-group">
                        <p><strong>Horario:</strong> ${data.schedule.hora_inicio} - ${data.schedule.hora_fin}</p>
                        <p><strong>Ruta:</strong> ${data.schedule.ruta_nombre}</p>
                        <p><strong>Estado:</strong> ${data.schedule.estado}</p>
                    </div>
                    <div class="detail-group">
                        <h4>Detalles de la Ruta:</h4>
                        <p>${data.schedule.ruta_descripcion || 'Sin descripción'}</p>
                        <h5>Paradas:</h5>
                        <ol>
                            ${data.schedule.paradas.map(p => `<li>${p.nombre} (${p.hora_estimada})</li>`).join('')}
                        </ol>
                    </div>
                    `
                );
            } else {
                alert(data.message || 'Error al cargar detalles');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar detalles');
        }
    }
});