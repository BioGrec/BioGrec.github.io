let loggedInUser = [];

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    console.log(token);
    
    if (!token) {
        console.log("Usuario no autenticado. Redirigiendo a la página de inicio de sesión.");
        window.location.href = 'index.html'; 
        return;
    }
    fetch('https://7415-181-236-170-98.ngrok-free.app/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
     .then(response => {
     console.log("Response status:", response.status); 
     return response.text();  
 })
    .then(data => {
         console.log("data /me", data);
      if (data) {
        loggedInUser = data;
        const userType = data.type;
        console.log(data.type);

        if (userType === 'admin') {
          document.getElementById('mi-perfil-link').style.display = 'none';
          document.getElementById('solicitar-link').style.display = 'none';
          document.getElementById('listar-link').style.display = 'none';
          document.getElementById('asistencia-link').style.display = 'none'; 

          document.getElementById('solicitudes-link').style.display = 'block'; 
          document.getElementById('clientes-link').style.display = 'block'; 
          document.getElementById('contenedores-link').style.display="block";
          document.getElementById('premios-link').style.display="block";
          loadProductManagement();
        } else {
          document.getElementById('solicitudes-link').style.display = 'none';
          document.getElementById('clientes-link').style.display = 'none';
          document.getElementById('productos-link').style.display='none';
          document.getElementById('contenedores-link').style.display="none";
          document.getElementById('premios-link').style.display="none";
          consultarPuntos();
        }
      } else {
        document.getElementById('content-area').innerHTML = '<p>No se pudieron obtener los datos del usuario.</p>';
      }
    })
    .catch(error => {
      console.error('Error al obtener los datos del usuario:', error);
      document.getElementById('content-area').innerHTML = '<p>Error al cargar los datos del usuario.</p>';
    });
});
function getLoggedInUser() {
    return loggedInUser;
}
  async function pageOne(points) {
    
    
    document.getElementById('content-area').innerHTML = `
    <div id="content-area">
 <div class="points-container">
  <div class="star-icon">⭐</div>
  <div class="points-info">
    <p class="points-label">Puntos</p>
    <div class="total-points">${points}</div>
    <div class="divider"></div>
    <a href="#" class="view-points" onClick="premios();">Redemir puntos</a>
  </div>
</div>

  <div class="earn-points-container">
    <h3 class="section-title">Ganar puntos</h3>
    <a href="#" onClick="solicitar();" class="request-link">
      <div class="link-icon">⭐</div>
      <div class="link-text">
        Redactar solicitud
        <p class="link-subtext">Solicitudes, sugerencias, quejas, reclamos</p>
      </div>
    </a>

    <h3 class="section-title">Gestionar mis datos</h3>
    <a href="#" onClick="profile();" class="profile-link">
      <div class="link-icon">👤</div>
      <div class="link-text">
        Ir a mi perfil
        <p class="link-subtext">Editar mis datos y mi ubicación</p>
      </div>
    </a>

    <h3 class="section-title">Asistencia</h3>
    <a href="#" onClick="asistencia();" class="profile-link">
      <div class="link-icon">🗣️</div>
      <div class="link-text">
        Asistencia
        <p class="link-subtext">Contacto directo con administrador</p>
      </div>
    </a>
  </div>
</div>

    `
  }
let userPoints = 0; 
function premios() {
    listPremios();
}
function setUserPoints(points) {
    userPoints = points; 
}

function getUserPoints() {
    return userPoints; 
}
  async function consultarPuntos() {
    const userD = getLoggedInUser();
    const userId = userD._id;
    console.log("puntos",userD._id);
    const response = await fetch(`https://7415-181-236-170-98.ngrok-free.app/auth/points/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener los puntos');
        }
        return response.json();
    })
    .then(pointsData => {
        console.log(pointsData.totalPoints);
        setUserPoints(pointsData.totalPoints);
        pageOne(pointsData.totalPoints);
    })
    .catch(error => {
        console.error('Error:', error);
        return 0; 
    });
}
  document.getElementById('mi-perfil-link').addEventListener('click', function(event) {
    event.preventDefault();
    profile();
});
function profile() {
    fetch('https://7415-181-236-170-98.ngrok-free.app/auth/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            let selectedUserType = data.type || ''; 

            const userId = data._id;

            fetch(`https://7415-181-236-170-98.ngrok-free.app/auth/points/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })
            .then(response => response.json())
            .then(pointsData => {
                const pointsBanner = pointsData.totalPoints > 0 
                    ? `<div id="stars"><h4>Mis Estrellas: ${pointsData.totalPoints}</h4></div>` 
                    : `<h3>Aún no has ganado estrellas</h3>`;

                    document.getElementById('content-area').innerHTML = `
                    ${pointsBanner}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div style="flex: 1;">
                            <h3>Datos personales</h3>

                            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                                <div style="flex: 1;">
                                    <label for="edit-name">Nombre:</label>
                                    <input type="text" id="edit-name" value="${data.name}" style="width: 100%; padding: 8px;" />
                                </div>
                                <div style="flex: 1;">
                                    <label for="edit-lastName">Apellido:</label>
                                    <input type="text" id="edit-lastName" value="${data.lastName}" style="width: 100%; padding: 8px;" />
                                </div>
                            </div>
                
                            <!-- Fila para Documento y Dirección -->
                            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                                <div style="flex: 1;">
                                    <label for="edit-doc">Documento:</label>
                                    <input type="text" id="edit-doc" value="${data.doc}" style="width: 100%; padding: 8px;" />
                                </div>
                                <div style="flex: 1;">
                                    <label for="edit-address">Dirección:</label>
                                    <input type="text" id="edit-address" value="${data.address}" style="width: 100%; padding: 8px;" />
                                </div>
                            </div>
                
                            <!-- Campo para Teléfono (toda la fila) -->
                            <div style="margin-bottom: 20px;">
                                <label for="edit-phone">Teléfono:</label>
                                <input type="text" id="edit-phone" value="${data.phone}" style="width: 100%; padding: 8px;" />
                            </div>
                
                            <button id="user-type-button">Elegir tipo de usuario</button>
                            <p>Tipo de usuario seleccionado: <span id="selected-user-type">${selectedUserType}</span></p>
                        </div>
                    </div>
                
                    <label>
                        <input type="checkbox" id="use-current-location" />
                        ¿Usar ubicación actual como predeterminada?
                    </label>
                    <div id="map" style="height: 300px; width: 100%;"></div>
                    <button id="save-button">Guardar cambios</button>
                
                    <!-- Ventana flotante para elegir tipo de usuario -->
                    <div id="user-type-modal" class="modal">
                        <div class="modal-content">
                            <div class="user-type-grid">
                                <div class="user-type-option" data-type="Conjunto residencial">
                                    <img src="img/simple-house.jpg" alt="Conjunto residencial">
                                    <p>Conjunto residencial</p>
                                </div>
                                <div class="user-type-option" data-type="Edificio">
                                    <img src="img/3650377.png" alt="Edificio">
                                    <p>Edificio</p>
                                </div>
                                <div class="user-type-option" data-type="Usuario común">
                                    <img src="img/5988264.png" alt="Usuario común">
                                    <p>Usuario común</p>
                                </div>
                                <div class="user-type-option" data-type="Empresa">
                                    <img src="img/company-23.png" alt="Empresa">
                                    <p>Empresa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                

                let lat, lon;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        lat = position.coords.latitude;
                        lon = position.coords.longitude;

                        const map = L.map('map').setView([lat, lon], 14);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);

                        L.marker([lat, lon]).addTo(map)
                            .bindPopup('Estás aquí')
                            .openPopup();
                    });
                }

                document.getElementById('user-type-button').addEventListener('click', function() {
                    document.getElementById('user-type-modal').style.display = 'block';
                });

                document.querySelectorAll('.user-type-option').forEach(option => {
                    option.addEventListener('click', () => {
                        selectedUserType = option.getAttribute('data-type');
                        document.getElementById('selected-user-type').textContent = selectedUserType;
                        document.getElementById('user-type-modal').style.display = 'none';
                    });
                });

                document.getElementById('save-button').addEventListener('click', function() {
                    const name = document.getElementById('edit-name').value;
                    const lastName = document.getElementById('edit-lastName').value;
                    const doc = document.getElementById('edit-doc').value;
                    const phone = document.getElementById('edit-phone').value;
                    const address = document.getElementById('edit-address').value;
                    const useCurrentLocation = document.getElementById('use-current-location').checked;

                    const updateData = {
                        name: name,
                        lastName: lastName,
                        doc: doc,
                        phone: phone,
                        address: address,
                        type: selectedUserType
                    };

                    if (useCurrentLocation && lat && lon) {
                        updateData.location = { latitude: lat, longitude: lon };
                    }

                    fetch('https://7415-181-236-170-98.ngrok-free.app/auth/me', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(updateData)
                    })
                    .then(response => response.json())
                    .then(updatedData => {
                        if (updatedData) {
                            alert('Datos actualizados exitosamente.');
                            location.reload();
                        } else {
                            alert('No se pudieron actualizar los datos.');
                        }
                    })
                    .catch(error => {
                        console.error('Error al actualizar los datos del usuario:', error);
                        alert('Error al guardar los cambios.');
                    });
                });
            })
            .catch(error => {
                console.error('Error al obtener los puntos del usuario:', error);
                document.getElementById('content-area').innerHTML = '<p>Error al cargar los puntos del usuario.</p>';
            });
        } else {
            document.getElementById('content-area').innerHTML = '<p>No se pudieron obtener los datos del usuario.</p>';
        }
    })
    .catch(error => {
        console.error('Error al obtener los datos del usuario:', error);
        document.getElementById('content-area').innerHTML = '<p>Error al cargar los datos del usuario.</p>';
    });
}
document.getElementById('solicitar-link').addEventListener('click', function(event) {
    event.preventDefault(); 
    req();
 
});
function req(){
    const content =document.getElementById('content-area');
    content.innerHTML=`
    <div class="assistance-container">
    <a href="#" onclick="generarFormularioRecoleccion()">
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                     <img src="img/truck.png" alt="Recolección">
                </div>
            </div>
            <div class="option-text">
                <h3>Recolección</h3>
                <p>Solicitar recolección de material reciclable.</p>
            </div>
        </div>
    </a>
    <a href="#" onclick="displayContainers()">
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                    <img src="img/can.png" alt="trash">
                </div>
            </div>
            <div class="option-text">
                <h3>Adquirir contenedor</h3>
                <p>Comprar o alquilar contenedores de materiales.</p>
            </div>
        </div>
    </a>
    <a href="#" onclick="sugerencia()">
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                    <img src="img/suge.png" alt="sug">
                </div>
            </div>
            <div class="option-text">
                <h3>Sugerencias</h3>
                <p>Ayúdanos a mejorar con tus opiniones e ideas.</p>
            </div>
        </div>
    </a>
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                     <img src="img/queja.PNG" alt="queja">
                </div>
            </div>
            <div class="option-text">
                <h3>Quejas-Reclamos</h3>
                <p>Cuéntanos qué ha sucedido, detalla lo ocurrido.</p>
            </div>
        </div>
    </div>
    ` 
}
function solicitar() {
    document.getElementById('content-area').innerHTML = `
    <div id="requ-content">
        <h2>Información de la solicitud</h2>
        <div id="formulario-solicitud"> 
            <form id="request-form">
                <select id="request-title" required>
                    <option value="" disabled selected>Seleccione un tipo</option>
                    <option value="Recolección de material">Recolección de material</option>
                    <option value="Alquiler-compra de contenedor">Alquiler-compra de contenedor</option>
                    <option value="Sugerencias">Sugerencias</option>
                    <option value="Quejas-Reclamos">Quejas-Reclamos</option>
                </select>
                <h5>Detalla el contenido de la solicitud</h5>
                <textarea id="request-detail" placeholder="

    ->Tipo de material/Cantidad/Peso.

    ->Sugerencias.

    ->Alquilar/Comprar contenedor.

    ->Detalla tu queja o reclamo.
                " required></textarea>
                <label>
                    <input type="checkbox" id="use-current-location" />
                    ¿Usar ubicación actual para esta solicitud?
                </label>
                <button type="submit">Enviar Solicitud</button>
            </form>
        </div>
    </div>
    `;

    document.getElementById('request-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('request-title').value;
        const detail = document.getElementById('request-detail').value;
        const useCurrentLocation = document.getElementById('use-current-location').checked;

        if (!title || !detail) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        if (useCurrentLocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                sendRequest({ title, detail, location });
            }, function(error) {
                console.error('Error al obtener la ubicación:', error);
                alert('No se pudo obtener la ubicación.');
                sendRequest({ title, detail });
            });
        } else {
            sendRequest({ title, detail });
        }
    });

    function sendRequest(requestData) {
        fetch('https://7415-181-236-170-98.ngrok-free.app/auth/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                alert('Solicitud enviada exitosamente.');
                document.getElementById('request-title').value = '';
                document.getElementById('request-detail').value = '';
            } else {
                alert('No se pudo enviar la solicitud.');
            }
        })
        .catch(error => {
            console.error('Error al enviar la solicitud:', error);
            alert('Error al enviar la solicitud.');
        });
    }
}
document.getElementById('listar-link').addEventListener('click', function(event) {
   event.preventDefault();
   listar();
});
function listar(){
    fetch('https://7415-181-236-170-98.ngrok-free.app/auth/requests/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        const requestsList = document.getElementById('content-area');
        requestsList.innerHTML = ''; 
        const titl= document.createElement('h2');
        titl.innerHTML='<a onclick="gooBack();">X</a> <h3>Solicitudes</h3>';
        if (data && data.length > 0) {
            console.log(data);
            requestsList.appendChild(titl);
            data.forEach(request => {
                const date = new Date(request.createdAt);
                const formattedDate = isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
                
                const ratingText = request.rating !== null ? request.rating : '<sin puntos asignados>';
            
                const requestElement = document.createElement('div');
                requestElement.innerHTML = `
                
                <div class="request-card">
                    <div class="request-title">${request.title}</div>
                    <div class="request-date">${formattedDate}</div>
                    <div class="request-rating">#Estrellas asignadas: ${ratingText}</div>
                </div>
                ` ;
                requestsList.appendChild(requestElement);
            });
            
        } else {
            requestsList.innerHTML = '<p>No se encontraron solicitudes.</p>';
        }
    })
    .catch(error => {
        console.error('Error al listar las solicitudes:', error);
        alert('Error al listar las solicitudes.');
    });
}
document.getElementById('cerrar-sesion').addEventListener('click', function(event) {
    event.preventDefault();

    fetch('https://7415-181-236-170-98.ngrok-free.app/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => {
        if (response.ok) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        } else {
            alert('Error al cerrar sesión.');
        }
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión.');
    });
});
document.getElementById('asistencia-link').addEventListener('click',function(event) {
    event.preventDefault();
    asistencia();
})
function asistencia() {
    const content =document.getElementById('content-area');
    content.innerHTML=`
    <a onclick="gooBack();">X</a>
    <a onclick="displayContainers();">
    <div class="assistance-container">
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                     <img src="img/can.png" alt="trash">
                </div>
            </div>
            <div class="option-text">
                <h3>Adquirir contenedor</h3>
                <p>Compra o alquila un contenedor.</p>
            </div>
        </div>
        </a>
        <a onclick="listPremios();">
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                    <img src="img/gift.jpg" alt="trash">
                </div>
            </div>
            <div class="option-text">
                <h3>Programa de puntos</h3>
                <p>Descubre cómo redimir tus puntos.</p>
            </div>
        </div>
        </a>
    <a href="#" onclick="sendWhatsAppMessage()">
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                    <img src="img/assist.png" alt="whatsapp">
                </div>
            </div>
            <div class="option-text">
                <h3>Asistencia</h3>
                <p>Comunícate con nosotros a través de whatsapp.</p>
            </div>
        </div>
    </a>
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                     <img src="img/info.PNG" alt="trash">
                </div>
            </div>
            <div class="option-text">
                <h3>Información de uso</h3>
                <p>Encuentra más información sobre el uso de tu información.</p>
            </div>
        </div>
    </div>
    `
}function generarFormularioRecoleccion() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
    <a onclick="back()">X</a>
        <h2>Recolección de materiales reciclables</h2>
        <form id="recoleccion-form">
            <!-- Fila de productos y peso -->
            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                <div style="flex: 2;">
                    <label for="producto-select">Producto:</label>
                    <select id="producto-select" required>
                        <option value="">Seleccione un producto</option>
                        <!-- Productos desde la BBDD se insertarán aquí -->
                    </select>
                </div>
                <div style="flex: 1;">
                    <label for="peso-input">Peso (Kg):</label>
                    <input type="text" id="peso-input" placeholder="# Kg" required style="width: 100%;" />
                </div>
            </div>
            
            <button type="button" id="agregar-producto" style="margin-bottom: 15px;">Agregar</button>
            
            <!-- Fila de Teléfono y Fijar Fecha -->
            <div style="display: flex; gap: 20px; margin-bottom: 1px;">
                <div style="flex: 2;">
                    <label for="telefono-input">Teléfono:</label>
                    <input type="text" id="telefono-input" placeholder="Ingrese su teléfono" required style="width: 100%;" />
                </div>
                <div style="flex: 1;">
                    <label for="fecha-checkbox">
                        <input type="checkbox" id="fecha-checkbox" /> Fijar Fecha
                    </label>
                    <input type="date" id="fecha-input" style="width: 100%;" disabled />
                </div>
            </div>

            <!-- Contenedor de productos agregados -->
            <h3>Productos agregados:</h3>
            <div id="productos-lista">
                <div style="display: flex; gap: 20px; font-weight: bold; margin-bottom: 10px; border: 1px solid #ccc;">
                    <div style="flex: 1;">#</div>
                    <div style="flex: 2;">Nombre</div>
                    <div style="flex: 1;">Peso(Kg)</div>
                </div>
                <!-- Productos agregados se mostrarán aquí -->
            </div>

            <!-- Observaciones -->
            <div style="margin-top: 20px;">
                <label for="observaciones-textarea">Observaciones:</label>
                <textarea id="observaciones-textarea" placeholder="Ingrese observaciones" style="width: 100%; height: 100px;"></textarea>
            </div>
            
            <!-- Checkbox para usar ubicación actual -->
            <div style="margin-top: 15px;">
                <label>
                    <input type="checkbox" id="ubicacion-actual-checkbox" /> ¿Usar ubicación actual para esta solicitud?
                </label>
            </div>

            <!-- Botón de registrar solicitud -->
            <button type="button" id="registrar-solicitud" style="margin-top: 20px;">Registrar Solicitud</button>
        </form>
    `;
    
    document.getElementById('fecha-checkbox').addEventListener('change', function() {
        const fechaInput = document.getElementById('fecha-input');
        if (this.checked) {
            fechaInput.disabled = false;
        } else {
            fechaInput.disabled = true;
        }
    });

    let productosAgregados = [];
    document.getElementById('agregar-producto').addEventListener('click', function() {
        const productoSelect = document.getElementById('producto-select');
        const pesoInput = document.getElementById('peso-input');
        const peso = pesoInput.value.trim();

        if (productoSelect.value === "" || peso === "" || isNaN(peso) || peso <= 0) {
            alert("Seleccione un producto y proporcione un peso válido.");
            pesoInput.style.border = "2px solid red";
            return;
        }

        pesoInput.style.border = "";

        productosAgregados.push({ nombre: productoSelect.value, peso: peso });
        actualizarListaProductos();

        productoSelect.value = "";
        pesoInput.value = "";
    });

    function actualizarListaProductos() {
        const productosLista = document.getElementById('productos-lista');
        productosLista.innerHTML = `
            <div style="display: flex; gap: 20px; font-weight: bold; margin-bottom: 10px;">
                <div style="flex: 1;">#</div>
                <div style="flex: 2;">Nombre</div>
                <div style="flex: 1;">Peso(Kg)</div>
            </div>
        `;

        productosAgregados.forEach((producto, index) => {
            productosLista.innerHTML += `
                <div style="display: flex; gap: 20px; border: 1px solid #ccc; pading: 2px">
                    <div style="flex: 1;">${index + 1}</div>
                    <div style="flex: 2;">${producto.nombre}</div>
                    <div style="flex: 1;">${producto.peso} Kg</div>
                </div>
            `;
        });
    }

    document.getElementById('registrar-solicitud').addEventListener('click', function() {
        const telefono = document.getElementById('telefono-input').value.trim();
        const fechaFijada = document.getElementById('fecha-checkbox').checked ? document.getElementById('fecha-input').value : null;
        const observaciones = document.getElementById('observaciones-textarea').value.trim();
        const usarUbicacion = document.getElementById('ubicacion-actual-checkbox').checked;

        if (!telefono) {
            alert("Ingrese su teléfono.");
            return;
        }

        let detalle = `Teléfono: ${telefono}\n`;
        if (fechaFijada) {
            detalle += `Fecha Fijada: ${fechaFijada}\n`;
        }
        detalle += `Observaciones: ${observaciones}\nProductos:\n`;
        productosAgregados.forEach((producto, index) => {
            detalle += `${producto.nombre} Peso: ${producto.peso} Kg - \n`;
        });
console.log("Detalle",detalle);

        let location = null;
        if (usarUbicacion && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                enviarSolicitud(detalle, location);
            });
        } else {
            enviarSolicitud(detalle, location);
        }
    });

    function enviarSolicitud(detalle, location) {
        const requestData = {
            title: "Recolección de material",
            detail: detalle,
            location: location,
            productos: productosAgregados
        };

        fetch('https://7415-181-236-170-98.ngrok-free.app/auth/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            alert("Solicitud registrada exitosamente.");
            document.getElementById('recoleccion-form').reset();
            productosAgregados = [];
            actualizarListaProductos();
        })
        .catch(error => {
            console.error("Error al registrar la solicitud:", error);
            alert("Error al registrar la solicitud.");
        });
    }
   
    cargarProductos();
}
function back() {
    req();
}
function cargarProductos() {
    event.preventDefault();
    fetch('https://7415-181-236-170-98.ngrok-free.app/admin/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }) 
    
      .then(response => response.json())
      .then(data => {
        const productos = data.products;
        const select = document.getElementById('producto-select');
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.nombre;
            option.text = producto.nombre;
            select.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Error al obtener productos:', error);
      });
}
function sugerencia() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
    <a onclick="req();">X</a>
        <h2>Datos necesarios</h2>
        <form id="sugerencia-form">
            <!-- Fila de Municipio y Teléfono -->
            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <label for="municipio-input">Municipio:</label>
                    <input type="text" id="municipio-input" placeholder="Municipio" required style="width: 100%;" />
                </div>
                <div style="flex: 1;">
                    <label for="telefono-input">Teléfono:</label>
                    <input type="text" id="telefono-input" placeholder="Teléfono" required style="width: 100%;" />
                </div>
            </div>

            <!-- Fila de Correo Opcional -->
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <label for="correo-checkbox">
                        <input type="checkbox" id="correo-checkbox" /> Incluir Correo de Contacto
                    </label>
                    <input type="email" id="correo-input" placeholder="Correo de Contacto" style="width: 100%;height:25px;"  disabled />
                </div>
            </div>

            <!-- Text area para la sugerencia -->
            <div style="margin-bottom: 20px;">
                <label for="sugerencia-textarea">Contenido de la Sugerencia:</label>
                <textarea id="sugerencia-textarea" placeholder="Escribe tu sugerencia aquí..." style="width: 100%; height: 100px;" required></textarea>
            </div>

            <!-- Botón de enviar sugerencia -->
            <button type="button" id="enviar-sugerencia" style="margin-top: 20px;">Enviar Sugerencia</button>
        </form>
    `;

    document.getElementById('correo-checkbox').addEventListener('change', function() {
        const correoInput = document.getElementById('correo-input');
        correoInput.disabled = !this.checked;
    });

    document.getElementById('enviar-sugerencia').addEventListener('click', function() {
        const municipio = document.getElementById('municipio-input').value.trim();
        const telefono = document.getElementById('telefono-input').value.trim();
        const incluirCorreo = document.getElementById('correo-checkbox').checked;
        const correo = incluirCorreo ? document.getElementById('correo-input').value.trim() : '';
        const sugerencia = document.getElementById('sugerencia-textarea').value.trim();

        if (!municipio || !telefono || !sugerencia) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }

        let detalle = `Municipio: ${municipio}, Teléfono: ${telefono}\n`;
        if (incluirCorreo && correo) {
            detalle += `Correo de Contacto: ${correo}\n`;
        }
        detalle += `Sugerencia: ${sugerencia}`;

        enviarSugerencia(detalle);
    });

    function enviarSugerencia(detalle) {
        const requestData = {
            title: "Sugerencias",
            detail: detalle
        };

        fetch('https://7415-181-236-170-98.ngrok-free.app/auth/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            alert("Sugerencia enviada exitosamente.");

            document.getElementById('sugerencia-form').reset();
        })
        .catch(error => {
            console.error("Error al enviar la sugerencia:", error);
            alert("Error al enviar la sugerencia.");
        });
    }
}
async function displayContainers() {
    const contentArea = document.getElementById("content-area");
    contentArea.innerHTML = '<a onclick="req();">X</a>'; 

    try {
        const response = await fetch('https://7415-181-236-170-98.ngrok-free.app/user/containers');
        const containers = await response.json();

        containers.forEach(container => {
            const containerDiv = document.createElement('div');
            containerDiv.classList.add('container-item');
            containerDiv.innerHTML = `
                <img src="${container.image}" alt="${container.nombre}" class="container-image">
                <div class="container-info">
                    <h3>${container.nombre}</h3>
                    <p>Tipo: ${container.type}</p>
                    <p>Tamaño: ${container.size}</p>
                    <p>Precio: $${container.price}</p>
                    <p>Disponibilidad: ${container.availability ? 'Disponible' : 'No disponible'}</p>
                </div>
            `;
            contentArea.appendChild(containerDiv);

            containerDiv.addEventListener('click', () => openContainerModal(container));
        });
    } catch (error) {
        console.error('Error al cargar los contenedores:', error);
    }
}

function openContainerModal(container) {
    const modal = document.createElement('div');
    modal.classList.add('modalc');

    const modalType = container.type === 'venta' ? 'Comprar' : 'Alquilar';

    modal.innerHTML = `
        <div class="modal-contain">
            <h2>${modalType} este contenedor</h2>
            <img src="${container.image}" alt="${container.nombre}" class="modal-image">
            <p>Nombre: ${container.nombre}</p>
            <p>Tipo: ${container.type}</p>
            <p>Tamaño: ${container.size}</p>
            <p>Precio: $${container.price}</p>
            <p>Ubicación: ${container.location}</p>
            <p>Descripción: ${container.description}</p>
            <label for="phone">Número de teléfono:</label>
            <input type="tel" id="phone" name="phone" required><br>
            <br>
            <label>
                <input type="checkbox" id="use-current-location">
                ¿Recibir en mi ubicación actual?
            </label><br>
            <br>
            <button id="sendRequestButton">Enviar solicitud</button>
            <button id="closeModalButton">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('sendRequestButton').addEventListener('click', async () => {
        const detail = document.getElementById('phone').value;
        const useCurrentLocation = document.getElementById('use-current-location').checked;
        //const containerId = container._id;
        console.log("container id", container._id);
        
        const requestData = {
            title: `${modalType} contenedor`,
            detail,
            containerId: container._id,
            location: useCurrentLocation ? 'Ubicación actual del usuario' : container.location
        };
        console.log("Datos de solicitud que se enviarán:", requestData); 
        await fetch('https://7415-181-236-170-98.ngrok-free.app/auth/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        document.body.removeChild(modal);
    });

    document.getElementById('closeModalButton').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}
function sendWhatsAppMessage() {
    const phoneNumber = "573163313942"; // Número de WhatsApp con el código de país
    const message = encodeURIComponent("Hola, me gustaría establecer contacto"); 

   
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, "_blank"); 
}
function gooBack() {
    window.location.href = "bienvenido.html"; 
}
const contentArea = document.getElementById("content-area");
let contentHistory = []; 

function updateContent(newContent) {
   
    contentHistory.push(contentArea.innerHTML);
    contentArea.innerHTML = newContent;
}

function goBack() {
   
    if (contentHistory.length > 0) {
        contentArea.innerHTML = contentHistory.pop(); 
    } else {
        alert("No hay más contenido anterior.");
    }
}
