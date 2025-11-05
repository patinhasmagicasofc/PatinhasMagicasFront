//const API_BASE_URL = 'http://localhost:5260/api';
const API_BASE_URL = 'https://patinhasmagicasapi.onrender.com/api';

function verificarAcesso(perfisEsperados = []) {
    if (!Array.isArray(perfisEsperados)) {
        perfisEsperados = [perfisEsperados];
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        console.log('Acesso negado. Usuário não autenticado.');
        mostrarToast("⚠️ Acesso negado. Faça login para continuar.", "aviso");

        setTimeout(() => { logout(); }, 3000);
        return false;
    }

    const perfilUsuario = getUserProfileFromToken();
    if (
        !perfilUsuario ||
        !perfisEsperados.map(p => p.toLowerCase()).includes(perfilUsuario.toLowerCase())
    ) {
        console.log('Acesso negado. Perfil não autorizado.');
        mostrarToast("⚠️ Acesso negado. Faça login para continuar.", "aviso");

        setTimeout(() => { logout(); }, 3000);
        return false;
    }

    return true;
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/pages/public/login.html';
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

        console.log('Response Status:', response.status);

        const data = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 403) {
            mostrarToast("⚠️ Sessão expirada ou acesso negado. Faça login novamente.", "aviso");

            setTimeout(() => { logout(); }, 3000);
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

function salvarPaginaAtual() {
    localStorage.setItem("paginaAnterior", window.location.pathname);
}