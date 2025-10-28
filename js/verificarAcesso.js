const API_BASE_URL = 'http://localhost:5260/api';

function verificarAcesso(perfisEsperados = []) {
    const token = localStorage.getItem('authToken');
    const perfilUsuario = getUserProfileFromToken();

    if (!token || !perfilUsuario || !perfisEsperados.map(p => p.toLowerCase()).includes(perfilUsuario.toLowerCase())
    ) {
        alert('Sua sessão expirou ou acesso negado. Faça login novamente.');
        logout();
        return false;
    }

    return true;
}

function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
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

function getUserIdFromToken() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.nameid;
}

function getUserProfileFromToken() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch {
        return null;
    }
}

function getUserFromToken() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload);
        const user = JSON.parse(decoded);
        return user;
    } catch (error) {
        console.error("Erro ao decodificar token:", error);
        return null;
    }
}

function validarLogin() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        //window.location.href = '/index.html';
        return false;
    }
    return true;
}

function salvarPaginaAtual() {
    localStorage.setItem("paginaAnterior", window.location.pathname);
}
