
document.addEventListener('DOMContentLoaded', function(event) {
 token = localStorage.getItem('token');
});
document.getElementById("contenedores-link").addEventListener('click', function(event){
    containerManagment();
});
function containerManagment(){
    const content = document.getElementById("content-area");
    content.innerHTML='';

    content.innerHTML=`
    <form id="new-container-form">
    <label for="nombre">Nombre del Contenedor:</label>
    <input type="text" id="nombre" name="nombre" required><br>
  
    <label for="type">Tipo:</label>
    <select id="type" name="type" required>
      <option value="venta">Venta</option>
      <option value="alquiler">Alquiler</option>
    </select><br>
  
    <label for="size">Tamaño:</label>
    <input type="text" id="size" name="size" required><br>
  
    <label for="price">Precio:</label>
    <input type="number" id="price" name="price" required><br>
  
    <label for="availability">Disponibilidad:</label>
    <input type="checkbox" id="availability" name="availability"><br>
  
    <label for="location">Ubicación:</label>
    <input type="text" id="location" name="location" required><br>
  
    <label for="description">Descripción:</label>
    <textarea id="description" name="description"></textarea><br>
  
    <label for="image-link">Enlace de la imagen:</label>
    <input type="url" id="image-link" name="image"><br>
  
    <button type="submit">Crear Contenedor</button>
  </form>
    `
    document.getElementById('new-container-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = {
            nombre: document.getElementById('nombre').value,
            type: document.getElementById('type').value,
            size: document.getElementById('size').value,
            price: document.getElementById('price').value,
            availability: document.getElementById('availability').checked,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            image: document.getElementById('image-link').value
        };

        try {
            const response = await fetch('https://7415-181-236-170-98.ngrok-free.app/user/containers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                alert('Contenedor creado exitosamente');
            } else {
                alert('Error al crear el contenedor: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al intentar crear el contenedor');
        }
    });
}
async function generatePremioForm() {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <form id="premioForm" style="display: flex; flex-direction: column; gap: 10px;">
            <label>
                Tipo:
                <input type="text" id="tipo" required>
            </label>
            <label>
                Descripción:
                <textarea id="descripcion" required></textarea>
            </label>
            <label>
                Disponibilidad:
                <select id="disponibilidad">
                    <option value="true">Disponible</option>
                    <option value="false">No disponible</option>
                </select>
            </label>
            <label>
                Cantidad:
                <input type="number" id="cantidad" min="1" required>
            </label>
            <label>
                Puntos Necesarios:
                <input type="number" id="puntosNecesarios" min="1" required>
            </label>
             <label for="image-link">Enlace de la imagen:</label>
    <input type="url" id="image-link" name="image"><br>
            <button type="button" onclick="submitPremioForm()">Crear Premio</button>
        </form>
        <div id="formMessage"></div>
    `;
}
async function submitPremioForm() {
    const tipo = document.getElementById('tipo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const disponibilidad = document.getElementById('disponibilidad').value === 'true';
    const cantidad = parseInt(document.getElementById('cantidad').value, 10);
    const puntosNecesarios = parseInt(document.getElementById('puntosNecesarios').value, 10);
    const formMessage = document.getElementById('formMessage');
    const image = document.getElementById('image-link').value

    if (!tipo || !descripcion || !image ||isNaN(cantidad) || isNaN(puntosNecesarios) || cantidad <= 0 || puntosNecesarios <= 0) {
        formMessage.innerText = "Por favor, completa todos los campos con valores válidos.";
        formMessage.style.color = "red";
        return;
    }

    const premioData = {
        tipo,
        descripcion,
        disponibilidad,
        cantidad,
        puntosNecesarios,
        image
    };

    try {
 
        const response = await fetch('https://7415-181-236-170-98.ngrok-free.app/user/premios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(premioData)
        });

        if (response.ok) {
            formMessage.innerText = "Premio creado exitosamente.";
            formMessage.style.color = "green";
            document.getElementById('premioForm').reset(); 
        } else {
            const result = await response.json();
            formMessage.innerText = `Error: ${result.message}`;
            formMessage.style.color = "red";
        }
    } catch (error) {
        console.error("Error al crear el premio:", error);
        formMessage.innerText = "Hubo un error al crear el premio.";
        formMessage.style.color = "red";
    }
}
document.getElementById("premios-link").addEventListener('click',function(event) {
    generatePremioForm();
});
async function listPremios() {
    const contentArea = document.getElementById('content-area');

    try {
        const response = await fetch('https://7415-181-236-170-98.ngrok-free.app/user/premios');
        
        if (!response.ok) {
            throw new Error('Error al obtener los premios');
        }

        const premios = await response.json();
        const puntosUsuario = getUserPoints();

        console.log("Datos de premios obtenidos:", premios);  

        contentArea.innerHTML = '';
        const botonHabilitado = puntosUsuario >= premios.puntosNecesarios;
        premios.forEach((premio) => {
            const premioCard = document.createElement('div');
            premioCard.classList.add('container-item');
            const puntos = getUserPoints();
            premioCard.innerHTML = `
                <img src="${premio.image}" alt="${premio.tipo}" class="container-image">
                <div class="container-info">
                    <h3>${premio.tipo}</h3>
                    <p><strong>Descripción:</strong> ${premio.descripcion}</p>
                    <p><strong>Cantidad Disponible:</strong> ${premio.cantidad}</p>
                    <p><strong>Puntos Necesarios:</strong> ${premio.puntosNecesarios}</p>
                    <p><strong>Tus puntos:</strong>${puntos}</p>
                    <input type="text" id="contact-${premio._id}" placeholder="Número de contacto"/>
                    <button id="redeem-${premio._id}" onclick="checkContactAndRedeem('${premio._id}')" ${!botonHabilitado ? 'disabled' : ''}>Redimir</button>
                </div>
            `;
            contentArea.appendChild(premioCard);
        });
               
        if (premios.length === 0) {
            contentArea.innerHTML = "<p>No hay premios disponibles en este momento.</p>";
        }
    } catch (error) {
        console.error('Error al listar premios:', error);
        contentArea.innerHTML = "<p>Error al cargar los premios disponibles.</p>";
    }
}

function checkContactAndRedeem(premioId) {
    const contactoInput = document.getElementById(`contact-${premioId}`);
    const contacto = contactoInput.value;

    if (!contacto) {
        alert("Debe agregar un número de contacto para redimir el premio.");
    } else {
        redeemPremio(premioId, contacto); 
    }
}


async function redeemPremio(premioId, contacto) {
    try {
    
        const userId = getLoggedInUser()._id;

        const response = await fetch(`https://7415-181-236-170-98.ngrok-free.app/user/premios/${premioId}/redeem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: userId,
                contacto: contacto
            })
        });

        if (response.ok) {
            alert('Premio redimido con éxito');
            listPremios();
        } else {
            const result = await response.json();
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al redimir el premio:', error);
        alert('Hubo un error al redimir el premio.');
    }
}



