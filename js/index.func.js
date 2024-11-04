
function eliminarProducto(productId) {
    fetch(`https://7415-181-236-170-98.ngrok-free.app/producto/${productId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo eliminar el producto');
        }
        return response.json();
    })
    .then(data => {
        alert('Producto eliminado exitosamente');
    })
    .catch(error => {
        console.error('Error al eliminar el producto:', error);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    localStorage.removeItem('token');
    const loginTitle = document.getElementById('login-title');
    const secretKeyContainer = document.getElementById('secret-key-container');
    let clickCount = 0;

    loginTitle.addEventListener('click', function() {
        clickCount++;

        if (clickCount === 3) {
            secretKeyContainer.style.display = 'block';
            document.getElementById('secret-key').placeholder = 'Contraseña secreta';
        }
    });
});
document.getElementById('loginForm').onsubmit = async (event) => {
    event.preventDefault(); 

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(event.target.action, {
            mode: 'cors',
  credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!result.success) {
            alert("Email o contraseña incorrectos"); 
        } else {
            localStorage.setItem('token', result.token);
            window.location.href = 'bienvenido.html'; 
        }
    } catch (error) {
        alert("Error en la conexión: " + error.message);
    }
};
