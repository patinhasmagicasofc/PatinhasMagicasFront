// area_restrita.js - Lógica de Controle de Acesso
const API_BASE_URL = 'http://localhost:5000/api'; 

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function verificarAcesso(perfilEsperado) {
    const token = localStorage.getItem('authToken');
    const perfilUsuario = localStorage.getItem('userProfile');

    if (!token || perfilUsuario !== perfilEsperado) {
        // Se não houver token OU o perfil não for o correto, desloga e redireciona
        logout();
        return false;
    }
    
    return true; 
}

async function consumirAPIAutenticada(endpoint, method = 'GET') {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                // Envio do Token JWT para a API C#
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.status === 401 || response.status === 403) {
            // O C# negou o acesso por Token inválido/expirado ou Role incorreto
            alert('Sessão expirada ou acesso negado. Faça login novamente.');
            logout();
            return null;
        }

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }

        return response.json();

    } catch (error) {
        console.error('Erro ao consumir API:', error);
        return null;
    }
}