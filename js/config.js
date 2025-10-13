// config.js — configuração global da API
const API_BASE_URL = "http://localhost:5260/api"; // ajuste a porta se necessário

// Função genérica para consumir API autenticada com JWT
async function consumirAPIAutenticada(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: body ? JSON.stringify(body) : null
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            alert('Sessão expirada ou acesso negado. Faça login novamente.');
            localStorage.clear();
            window.location.href = 'index.html';
        }
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }

    if (response.status === 204) return response; // No Content
    return response.json(); // Retorna JSON para outros status
}
