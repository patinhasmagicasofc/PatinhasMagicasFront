const API_BASE_URL = 'http://localhost:5260/api';
const LOGIN_ENDPOINT = `${API_BASE_URL}/Login/login`;

document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const erroDisplay = document.getElementById('mensagemErro');

    erroDisplay.textContent = '';

    try {
        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            erroDisplay.textContent = data.message || 'Falha no login. Credenciais inválidas.';
            return;
        }

        console.log('Dados recebidos do login:', data.data);

        const { token, perfil, id } = data.data;

        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', perfil.toLowerCase());
        localStorage.setItem('idUsuario', id.toString());

        switch (perfil.toLowerCase()) {
            case 'administrador':
                setTimeout(() => {
                    window.location.href = 'lista-pedidos.html';
                }, 100);
                break;
            case 'cliente':
            default:
                window.location.href = 'pagina-venda.html';
        }

    } catch (error) {
        erroDisplay.textContent = 'Erro de conexão com o servidor.';
        console.error('Erro de login:', error);
    }
});

