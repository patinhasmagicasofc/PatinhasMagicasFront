const API_BASE_URL = 'http://localhost:5260/api';

function verificarAcesso(perfisEsperados = []) {
    const token = localStorage.getItem('authToken');
    const perfilUsuario = localStorage.getItem('userProfile');

    console.log('Token:', token);
    console.log('Perfil do usuário:', perfilUsuario);

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
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(url, options);

        const data = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 403) {
            alert('Sessão expirada ou acesso negado. Faça login novamente.');
            logout();
            return null;
        }

        if (!response.ok) {
            let mensagemErro = data?.message || 'Erro na requisição.';
            switch (response.status) {
                case 400:
                    mensagemErro = data?.message || 'Requisição inválida.';
                    break;
                case 404:
                    mensagemErro = 'Recurso não encontrado.';
                    break;
                case 500:
                    mensagemErro = 'Erro interno no servidor.';
                    break;
            }
            throw new Error(mensagemErro);
        }

        return data;

    } catch (error) {
        console.error('Erro ao consumir API:', error);
        return null;
    }
}