const API_BASE_URL = 'http://localhost:5260/api'; 

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function verificarAcesso(perfilEsperado) {
    const token = localStorage.getItem('authToken');
    const perfilUsuario = localStorage.getItem('userProfile');

    if (!token || perfilUsuario !== perfilEsperado) {
        alert('Sua sessão expirada ou acesso negado. Faça login novamente.');
        logout();
        return false;
    }
    
    return true; 
}

async function consumirAPIAutenticada(endpoint, method = 'GET', bodyData = null) {
    const token = localStorage.getItem('authToken');
    
    // Constrói a URL usando a base + endpoint relativo
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    const config = {
        method: method,
        headers: headers
    };

    if (bodyData && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(url, config);

        if (response.status === 401 || response.status === 403) {
            alert('Sessão expirada ou acesso negado. Faça login novamente.');
            logout();
            return null;
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }

        if (response.status === 204) {
            return response;
        }

        return response.json();

    } catch (error) {
        console.error('Erro ao consumir API:', error);
        return null;
    }
}