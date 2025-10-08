// areaRestrita.js - Lógica de Controle de Acesso e Consumo de API
// OTIMIZAÇÃO: Padroniza a URL base para a porta do projeto (5260)
const API_BASE_URL = 'http://localhost:5260/api'; 

function logout() {
    // Limpa todas as chaves (token, perfil, ID do usuário)
    localStorage.clear();
    // Redireciona para a página inicial/login
    window.location.href = 'index.html';
}

/**
 * Verifica se o usuário tem um token válido e o perfil necessário.
 * @param {string} perfilEsperado - O perfil necessário ('administrador', 'cliente', etc.).
 * @returns {boolean} True se o acesso for concedido.
 */
function verificarAcesso(perfilEsperado) {
    const token = localStorage.getItem('authToken');
    const perfilUsuario = localStorage.getItem('userProfile');

    if (!token || perfilUsuario !== perfilEsperado) {
        // Se falhar, redireciona o usuário
        alert('Seu acesso a esta área é restrito ou sua sessão expirou.');
        logout();
        return false;
    }
    
    return true; 
}

/**
 * Consome um endpoint da API enviando o Token JWT no cabeçalho.
 * @param {string} endpoint - O caminho da API (ex: '/Usuario/meu-perfil').
 * @param {string} method - O método HTTP (GET, POST, PUT, DELETE). Padrão é 'GET'.
 * @param {object} [bodyData=null] - Dados a serem enviados no corpo da requisição (para POST/PUT).
 * @returns {Promise<object|null>} Os dados da resposta ou null em caso de falha.
 */
async function consumirAPIAutenticada(endpoint, method = 'GET', bodyData = null) {
    const token = localStorage.getItem('authToken');

    // Monta o objeto de cabeçalhos
    const headers = {
        'Content-Type': 'application/json',
        // Envio do Token JWT
        'Authorization': `Bearer ${token}` 
    };

    // Configuração base da requisição
    const config = {
        method: method,
        headers: headers
    };

    // Adiciona o corpo (body) se o método for POST ou PUT e houver dados
    if (bodyData && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
            // Token inválido/expirado (401) ou Role incorreto (403)
            alert('Sessão expirada ou acesso negado. Faça login novamente.');
            logout();
            return null;
        }

        if (!response.ok) {
            // Tenta obter uma mensagem de erro JSON da API
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }

        // Se a resposta for 204 No Content (como em um PUT bem-sucedido), retorna a própria resposta
        if (response.status === 204) {
            return response;
        }

        // Retorna o corpo JSON para todos os outros status OK (200, 201)
        return response.json();

    } catch (error) {
        console.error('Erro ao consumir API:', error);
        return null;
    }
}