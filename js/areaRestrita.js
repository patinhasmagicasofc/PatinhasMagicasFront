// areaRestrita.js - Versão AJAX com suporte a JWT e CORS
// Define a URL base da API
// const API_BASE_URL = 'http://localhost:5260/api';

/**
 * Faz logout limpando o armazenamento local e redirecionando o usuário.
 */
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

/**
 * Verifica se o usuário tem o perfil esperado e um token válido.
 * @param {string} perfilEsperado - Ex: 'administrador', 'cliente', etc.
 * @returns {boolean} - True se o usuário tiver acesso autorizado.
 */
function verificarAcesso(perfilEsperado) {
    const token = localStorage.getItem('authToken');
    const perfilUsuario = localStorage.getItem('userProfile');

    if (!token || perfilUsuario !== perfilEsperado) {
        alert('Seu acesso a esta área é restrito ou sua sessão expirou.');
        logout();
        return false;
    }

    return true;
}

/**
 * Consome um endpoint protegido da API usando AJAX e JWT no cabeçalho.
 * @param {string} endpoint - Caminho da API, ex: '/Usuario/meu-perfil'
 * @param {string} [method='GET'] - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object|null} [bodyData=null] - Corpo da requisição (para POST/PUT)
 * @param {function} [onSuccess=null] - Callback para sucesso
 * @param {function} [onError=null] - Callback para erro
 */
function consumirAPIAutenticada(endpoint, method = 'GET', bodyData = null, onSuccess = null, onError = null) {
    const token = localStorage.getItem('authToken');

    // Configuração do AJAX
    $.ajax({
        url: `${API_BASE_URL}${endpoint}`,
        method: method,
        contentType: 'application/json; charset=utf-8',
        data: bodyData ? JSON.stringify(bodyData) : null,
        crossDomain: true,
        xhrFields: { withCredentials: true }, // permite cookies se forem usados no futuro
        headers: {
            'Authorization': `Bearer ${token}`
        },

        success: function (data, textStatus, xhr) {
            if (onSuccess) onSuccess(data, xhr);
        },

        error: function (xhr, textStatus, errorThrown) {
            if (xhr.status === 401 || xhr.status === 403) {
                alert('Sessão expirada ou acesso negado. Faça login novamente.');
                logout();
                return;
            }

            console.error(`Erro na API: ${xhr.status} - ${xhr.responseText}`);

            if (onError) {
                onError(xhr, textStatus, errorThrown);
            } else {
                alert('Ocorreu um erro ao acessar a API. Verifique o console para mais detalhes.');
            }
        }
    });
}
