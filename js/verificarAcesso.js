const API_BASE_URL = 'http://localhost:5260/api';

function verificarAcesso(perfisEsperados = []) {
    const token = localStorage.getItem('authToken');
    const perfilUsuario = localStorage.getItem('userProfile');

    if (!token || !perfisEsperados.includes(perfilUsuario)) {
        alert('Sua sessão expirou ou acesso negado. Faça login novamente.');
        logout();
        return false;
    }

    return true;
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

async function consumirAPIAutenticada(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('authToken');

    if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = 'login.html';
        return;
    }

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
        alert('Token inválido ou expirado. Faça login novamente.');
        logout();
        return;
    }

    return response.json();
}