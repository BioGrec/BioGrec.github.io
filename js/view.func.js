let token;
document.addEventListener('DOMContentLoaded', function(event) {
 token = localStorage.getItem('token');
})
function requestLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Ubicación obtenida:', position);
        alert('Registro exitoso con ubicación obtenida');
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        alert('Por favor, habilita la ubicación en la configuración del navegador.');
      }
    );
  } else {
    alert('Tu navegador no soporta geolocalización.');
  }
}
//requestLocation();
function loadRequests() {
  fetch('https://7415-181-236-170-98.ngrok-free.app/admin/requests/all/clients', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      }
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Error en la respuesta de la red');
      }
      return response.json();
  })
  .then(data => {
      console.log('Datos de solicitudes recibidos:', data);
      const contentArea = document.getElementById('content-area');
      contentArea.innerHTML = '';

      if (Array.isArray(data) && data.length > 0) {
          data.sort((a, b) => {
              if (a.status === 'pendiente' && b.status === 'terminado') {
                  return -1;
              } else if (a.status === 'terminado' && b.status === 'pendiente') {
                  return 1;
              } else {
                  return 0; 
              }
          });

          data.forEach(request => {
              const requestBox = document.createElement('div');
              requestBox.className = 'request-box';
              requestBox.innerHTML = `
                  <p><strong>Título:</strong> ${request.title}</p>
                  <p><strong>Detalle:</strong> ${request.detail}</p>
                  <p><strong>Usuario:</strong> ${request.userId.name} (${request.userId.email})</p>
                  <p><strong>Estado:</strong> ${request.status}</p>
                  <p><strong>Calificación:</strong> ${request.rating || 'N/A'}</p>
              `;

              if (request.status === 'pendiente') {
                  const viewButton = document.createElement('button');
                  viewButton.type = 'button';
                  viewButton.onclick = () => viewRequestDetails(request._id);
                  viewButton.innerText = 'Ver solicitud';
                  requestBox.appendChild(viewButton);
              }

              contentArea.appendChild(requestBox);
          });
      } else {
          contentArea.innerHTML = '<p>No se encontraron solicitudes.</p>';
      }
  })
  .catch(error => {
      console.error('Error al cargar las solicitudes:', error);
      document.getElementById('content-area').innerHTML = '<p>Error al cargar las solicitudes.</p>';
  });
}

function viewRequestDetails(requestId) {
    fetch(`https://7415-181-236-170-98.ngrok-free.app/admin/request/${requestId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const contentArea = document.getElementById('content-area');
        if (data && data.userId) {
            
            contentArea.innerHTML = `
                <div id="request-details">
                 <a href="#" onclick="loadRequests()">×</a>
                    <h2>Detalles de la Solicitud</h2>
                    <p><strong>Título:</strong> ${data.title}</p>
                    <p><strong>Detalle:</strong> ${data.detail}</p>
                    <p><strong>Usuario:</strong> ${data.userId.name} (${data.userId.email})</p>
                    <p><strong>Estado:</strong> ${data.status}</p>
                    <p><strong>Calificación:</strong> ${data.rating || 'N/A'}</p>
                    <h3>Ubicación del Cliente</h3>
                    <div id="map"></div>
                    <button id="finish-request-button" onclick="finishRequest('${data._id}', '${data.title}')">Terminar solicitud</button>

                </div>
            `;
console.log(data.location, "location");

            initializeMap(data.location);
        } else {
            contentArea.innerHTML = '<p>Detalles de la solicitud no disponibles.</p>';
        }
    })
    .catch(error => {
        console.error('Error al cargar los detalles de la solicitud:', error);
        document.getElementById('content-area').innerHTML = '<p>Error al cargar los detalles de la solicitud.</p>';
    });
}

function initializeMap(location) {
    if (location && location.latitude && location.longitude) {
        const map = L.map('map').setView([location.latitude, location.longitude], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([location.latitude, location.longitude]).addTo(map)
            .bindPopup('Ubicación del cliente')
            .openPopup();
    } else {
        document.getElementById('map').innerHTML = '<p>No se proporcionó una ubicación válida.</p>';
    }
}
let prctsList =[];
let selectedProducts = [];

function filterProducts() {
  const searchValue = document.getElementById('search-products').value.toLowerCase();
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  if (searchValue.trim() === '') return;

  const filteredProducts = prctsList.filter(product =>
    product.nombre.toLowerCase().includes(searchValue)
  );
 
  filteredProducts.forEach(product => {
    const productDiv = document.createElement('div');
    const isChecked = selectedProducts.some(p => p.nombre === product.nombre); 
    productDiv.innerHTML = `
      <label>
        <input type="checkbox" value="${product.nombre}" ${isChecked ? 'checked' : ''} onclick="toggleProduct('${product.nombre}')">
        ${product.nombre}
      </label>
    `;
    productList.appendChild(productDiv);
    
  });
 
}

function toggleProduct(productName) {
    const searchInput = document.getElementById('search-products');
    searchInput.value="";   
  const existingProduct = selectedProducts.find(p => p.nombre === productName);
  
  if (existingProduct) {
    selectedProducts = selectedProducts.filter(p => p.nombre !== productName);
  } else {
    selectedProducts.push({ nombre: productName, cantidad: 0 });
  }

  renderSelectedProducts();
}

function renderSelectedProducts() {
  const selectedProductsDiv = document.getElementById('selected-products');
  selectedProductsDiv.innerHTML = ''; 

  selectedProducts.forEach(product => {
    const productRow = document.createElement('div');
    productRow.className = 'product-row';
    productRow.innerHTML = `
      <span>${product.nombre}</span>
      <input type="number" value="${product.cantidad}" min="1" onchange="updateProductQuantity('${product.nombre}', this.value)">
      <button class="remove-btn" onclick="removeProduct('${product.nombre}')">X</button>
    `;
    selectedProductsDiv.appendChild(productRow);
  });
}

function updateProductQuantity(productName, newQuantity) {
  selectedProducts = selectedProducts.map(p =>
    p.nombre === productName ? { ...p, cantidad: Number(newQuantity) } : p
  );
}

function removeProduct(productName) {
  selectedProducts = selectedProducts.filter(p => p.nombre !== productName);
  renderSelectedProducts();
  filterProducts(); 
}
function clearSelectedProducts() {
  selectedProducts.forEach(product => {
      removeProduct(product.nombre); 
  });
  renderSelectedProducts(); 
  document.getElementById('rating-modal').style.display = 'none';
}

function finishRequest(requestId, requestTitle) {
  if (requestTitle === "Recolección de material") {
      document.getElementById('rating-modal').style.display = 'block';

      document.getElementById('finish-request-confirm-button').onclick = function () {
          let totalStars = 0;
          let rating = 0;
          selectedProducts.forEach(selectedProduct => {
              const productInList = prctsList.find(p => p.nombre === selectedProduct.nombre);
              if (productInList) {
                  if (selectedProduct.cantidad == 0 || selectedProduct.cantidad == "") {
                      alert("Debe poner cantidades válidas");
                  } else {
                      totalStars += productInList.puntos * selectedProduct.cantidad;
                      console.log("Total estrellas ganadas:", productInList, totalStars);
                      rating = totalStars;
                  }
              }
          });

          if (rating <= 0) {
              alert("Ingrese la cantidad de kilos para cada producto");    
          } else {
              fetch(`https://7415-181-236-170-98.ngrok-free.app/admin/request/finish/${requestId}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ rating: rating })
              })
              .then(response => {
                  if (response.ok) {
                      alert('Solicitud terminada exitosamente.');
                      clearSelectedProducts();
                      loadRequests();
                  } else {
                      alert('Error al terminar la solicitud.');
                  }
              })
              .catch(error => {
                  console.error('Error al terminar la solicitud:', error);
                  alert('Error al terminar la solicitud.');
              });
          }
      };
  } else if (requestTitle === "Quejas-Reclamos" || requestTitle === "Sugerencias") {

      const confirmation = confirm('¿Está seguro de que ha revisado la solicitud y le ha dado un tratamiento adecuado?');
      if (confirmation) {
  
          fetch(`https://7415-181-236-170-98.ngrok-free.app/admin/request/finish/${requestId}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ rating: 0 }) 
          })
          .then(response => {
              if (response.ok) {
                  alert('Solicitud terminada exitosamente.');
                  loadRequests();
              } else {
                  alert('Error al terminar la solicitud.');
              }
          })
          .catch(error => {
              console.error('Error al terminar la solicitud:', error);
              alert('Error al terminar la solicitud.');
          });
      }
  } else if (requestTitle === "Alquilar contenedor" || requestTitle === "Comprar contenedor") {
      
      handleContainerRequest(requestId);
  }
}
function closeRatingModal() {
  selectedProducts = []; 
  renderSelectedProducts();
    document.getElementById('rating-modal').style.display = 'none';
}
let allClients = []; 
function loadClients(page = 1) {
    const url = `https://7415-181-236-170-98.ngrok-free.app/clients?page=${page}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '';
        console.log("data clientes",data);
        
        
        const searchForm = document.createElement('form');
        searchForm.innerHTML = `
            <input type="text" id="search-input" placeholder="Buscar por nombre o email" />
            <button type="button" onclick="searchClient()">Buscar</button>
            <br></br>
        `;
        contentArea.appendChild(searchForm);
        allClients = data.users;
        console.log(allClients);
        
        renderClients(allClients);

        const paginationControls = document.createElement('div');
        paginationControls.className = 'pagination-controls';
        paginationControls.innerHTML = `
            <button ${page === 1 ? 'disabled' : ''} onclick="loadClients(${page - 1})">Anterior</button>
            <span>Página ${page} de ${data.totalPages}</span>
            <button ${page >= data.totalPages ? 'disabled' : ''} onclick="loadClients(${page + 1})">Siguiente</button>
        `;
        contentArea.appendChild(paginationControls);
    })
    .catch(error => {
        console.error('Error al listar los clientes:', error);
        document.getElementById('content-area').innerHTML = '<p>Error al cargar los clientes.</p>';
    });
}
function renderClients(clients) {
    const contentArea = document.getElementById('content-area');
    const clientContainer = document.createElement('div');
    clientContainer.className = 'client-container';

    clients.forEach(client => {
        const clientBox = document.createElement('div');
        clientBox.className = 'client-box';
        clientBox.innerHTML = `
            <p><strong>Nombre:</strong> ${client.name} ${client.lastName}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Documento:</strong> ${client.doc}</p>
            <p><strong>Dirección:</strong> ${client.address}</p>
            <p><strong>Teléfono:</strong> ${client.phone}</p>
        `;
        
        clientBox.addEventListener('click', () => toggleClientDetails(clientBox, client._id));
        clientContainer.appendChild(clientBox);
    });

    contentArea.appendChild(clientContainer);
}
function searchClient() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filteredClients = allClients.filter(client => {
        const fullName = `${client.name} ${client.lastName}`.toLowerCase();
        const email = client.email.toLowerCase();
        return fullName.includes(searchQuery) || email.includes(searchQuery);
    });

    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '';

    const searchForm = document.createElement('form');
    searchForm.innerHTML = `
        <input type="text" id="search-input" placeholder="Buscar por nombre o email" value="${searchQuery}" />
        <button type="button" onclick="searchClient()">Buscar</button>
    `;
    contentArea.appendChild(searchForm);

    renderClients(filteredClients);
}
function toggleClientDetails(clientBox, clientId) {
    const isExpanded = clientBox.classList.contains('expanded');
    
    if (isExpanded) {
        clientBox.querySelector('.client-requests').remove();
        clientBox.classList.remove('expanded');
    } else {
   
        fetch(`https://7415-181-236-170-98.ngrok-free.app/admin/clients/${clientId}/requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(requests => {
            const requestContainer = document.createElement('div');
            requestContainer.className = 'client-requests';
            if (requests.length > 0) {
                requests.forEach(request => {
                    const requestBox = document.createElement('div');
                    requestBox.className = 'request-box';
                    requestBox.innerHTML = `
                        <p><strong>Título:</strong> ${request.title}</p>
                        <p><strong>Detalle:</strong> ${request.detail}</p>
                        <p><strong>Estado:</strong> ${request.status}</p>
                        <button class="request-button" onclick="viewRequestDetails('${request._id}')">Ver solicitud</button>
                    `;
                    requestContainer.appendChild(requestBox);
                });
            } else {
                requestContainer.innerHTML = '<p>No hay solicitudes para este cliente.</p>';
            }
            clientBox.appendChild(requestContainer);
            clientBox.classList.add('expanded');
        })
        .catch(error => console.error('Error al cargar solicitudes del cliente:', error));
    }
}
document.getElementById('solicitudes-link').addEventListener('click', function(event) {
    event.preventDefault();
    loadRequests();
});
  
  document.getElementById('clientes-link').addEventListener('click', function(event) {
    event.preventDefault();
    loadClients(1); 
});
document.getElementById('productos-link').addEventListener('click', function(event){
    loadProductManagement();
})
function loadProductManagement() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="product-management-container">
        <h2>Productos</h2>
        <div class="products-table-container">
          <table id="products-table">
  <thead>
    <tr>
      <th>Nombre</th>
      <th>Puntos</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody id="products-list">
    <!-- Aquí se llenarán las filas de productos -->
    <tr>
      <td>Nombre del Producto</td>
      <td>
        <input type="number" class="point" id="points-productId" value="100" />
      </td>
      <td>
        <button onclick="updateProduct('productId')">Actualizar</button>
      </td>
    </tr>
  </tbody>
</table>
        </div>
        <div class="create-product-form-container">
          <h3>Crear nuevo producto</h3>
          <form id="create-product-form">
            <input type="text" id="new-product-name" placeholder="Nombre del producto" required />
            <input type="number" id="new-product-points" placeholder="Puntos por kilo" required />
            <button type="submit">Crear</button>
          </form>
        </div>
      </div>
    `;

    fetchProducts();
}
  function fetchProducts() {
    fetch('https://7415-181-236-170-98.ngrok-free.app/admin/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }) 
    
      .then(response => response.json())
      .then(data => {
        const products = data.products;
        console.log(products);
        prctsList=products;
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = ''; 
  
        products.forEach(product => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${product.nombre}</td>
            <td>
              <input type="number" class="point" id="points-${product._id}" value="${product.puntos}" />
            </td>
            <td>
            <div id="button-container" class="button-container">
                <button class="update-btn" onclick="updateProduct('${product._id}')">✓</button>
                <button class="delete-btn" onclick="deleteProduct('${product._id}')">X</button>
            </div>
              </td>
          `;
          productsList.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Error al obtener productos:', error);
      });
  }
  function deleteProduct(productId) {

    fetch(`https://7415-181-236-170-98.ngrok-free.app/admin/delete/product/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            fetchProducts(); 
        } else {
            console.error('Error al eliminar el producto:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error al eliminar el producto:', error);
    });
}
  function updateProduct(productId) {
    const pointsInput = document.getElementById(`points-${productId}`);
    const newPoints = pointsInput.value;
  
    fetch(`https://7415-181-236-170-98.ngrok-free.app/admin/update/product/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ puntos: newPoints })
    })
      .then(response => response.json())
      .then(data => {
        alert('Producto actualizado correctamente');
        console.log(data);
        
      })
      .catch(error => {
        console.error('Error al actualizar producto:', error);
        alert('Error al actualizar producto');
      });
  }
  document.getElementById('content-area').addEventListener('submit', function(event) {
    if (event.target && event.target.id === 'create-product-form') {
      event.preventDefault(); 
  
      const nombre = document.getElementById('new-product-name').value;
      const puntos = document.getElementById('new-product-points').value;
  
      fetch('https://7415-181-236-170-98.ngrok-free.app/admin/create/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, puntos })
      })
        .then(response => response.json())
        .then(data => {
          alert('Producto creado correctamente');
          loadProductManagement();
        })
        .catch(error => {
          console.error('Error al crear producto:', error);
          alert('Error al crear producto');
        });
    }
  });
  async function handleContainerRequest(requestId) {
    try {
      const response = await fetch(`https://7415-181-236-170-98.ngrok-free.app/admin/request/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error("No se pudo obtener la solicitud");
      }
  
      const request = await response.json();
      console.log("response",request);
      const modal = document.createElement('div');
      modal.id = 'container-request-modal';
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.padding = '20px';
      modal.style.backgroundColor = 'white';
      modal.style.border = '1px solid #ccc';
      modal.style.borderRadius = '8px';
      modal.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
      modal.style.zIndex = '1000';
      modal.innerHTML = `
      <a id="closeModal">X</a>
        <h2>Detalles del Contenedor</h2>
        <img src="${request.containerId.image}" alt="${request.containerId.nombre}" class="modal-image-low">
        <p><strong>Nombre:</strong> ${request.containerId?.nombre || 'N/A'}</p>
        <p><strong>Capacidad:</strong> ${request.containerId?.size || 'N/A'}</p>
        <p><strong>Ubicación:</strong> ${request.containerId?.location || 'N/A'}</p>
        <label>
          <input type="checkbox" id="completedCheckbox">
          ¿Entrega completada?
        </label>
        <br>
        <br>
        <button id="finalizeContainerRequest">Finalizar</button>
      `;
  
      document.body.appendChild(modal);
  
      document.getElementById('closeModal').onclick = function () {
        document.body.removeChild(modal);
      };

      document.getElementById('finalizeContainerRequest').onclick = async function () {
        const completed = document.getElementById('completedCheckbox').checked;
  
        try {
          const updateRequestResponse = await fetch(`https://7415-181-236-170-98.ngrok-free.app/admin/request/finish/${requestId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              status: 'terminado',
              completed
            })
          });
          document.body.removeChild(modal);
          alert("Solicitud finalizada exitosamente");
          loadRequests();
          /*if (completed && request.containerId) {
            const updateContainerResponse = await fetch(`https://7415-181-236-170-98.ngrok-free.app/user/containers/${request.containerId}  `, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ available: false })
            });
  
            if (!updateContainerResponse.ok) {
              throw new Error("No se pudo actualizar la disponibilidad del contenedor");
            }
          }
          if (updateRequestResponse.ok) {
            alert("Solicitud finalizada exitosamente");
            document.body.removeChild(modal);
            loadRequests();
          } else {
            alert("Error al finalizar la solicitud");
          }*/
        } catch (error) {
          console.error("Error al finalizar la solicitud:", error);
          alert("Error al finalizar la solicitud");
        }
      };
    } catch (error) {
      console.error("Error al manejar la solicitud de contenedor:", error);
      alert("Error al manejar la solicitud de contenedor");
    }
  }
  