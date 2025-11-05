//const API_BASE_URL = 'http://localhost:5260/api';
const API_BASE_URL = 'hhttps://patinhasmagicasapi.onrender.com/api';
const LOGIN_ENDPOINT = `${API_BASE_URL}/Login`;

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
        const { token, perfil } = data.data;

        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', perfil.toLowerCase());


        // Atualiza menu da página atual sem reload
        if (typeof atualizarMenu === "function") {
            atualizarMenu();
        }

        // Redireciona para página anterior
        const paginaAnterior = localStorage.getItem("paginaAnterior");
        if (paginaAnterior) {
            window.location.href = paginaAnterior;
            localStorage.removeItem("paginaAnterior");
        } else {
            window.location.href = (perfil.toLowerCase() === 'administrador')
                ? '/pages/public/pagina-venda.html'
                : '/pages/public/pagina-venda.html';
        }

    } catch (error) {
        erroDisplay.textContent = 'Erro de conexão com o servidor.';
        console.error('Erro de login:', error);
    }
});

