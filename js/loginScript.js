// loginScript.js — Versão AJAX com compatibilidade CORS e JWT
// const API_BASE_URL = 'http://localhost:5260/api';
const LOGIN_ENDPOINT = `${API_BASE_URL}/Login/login`;

$(document).ready(function () {
    $('#loginForm').on('submit', function (event) {
        event.preventDefault();

        const email = $('#email').val();
        const senha = $('#senha').val();
        const erroDisplay = $('#mensagemErro');

        erroDisplay.text(''); // limpa mensagens anteriores

        // Requisição AJAX para o endpoint de login
        $.ajax({
            url: LOGIN_ENDPOINT,
            method: 'POST',
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            xhrFields: { withCredentials: true }, // compatível com AllowCredentials() da API
            data: JSON.stringify({ email, senha }),

            success: function (data) {
                // Espera receber: { token, perfil, idUsuario }
                const token = data.token;
                const perfil = data.perfil ? data.perfil.toLowerCase() : '';
                const userId = data.idUsuario || data.Id || data.id;

                if (!token || !userId) {
                    console.error("Erro: A API não retornou o token ou o ID do usuário.", data);
                    erroDisplay.text("Erro de servidor: informações de login incompletas.");
                    return;
                }

                // Armazena informações no localStorage
                localStorage.setItem('authToken', token);
                localStorage.setItem('userProfile', perfil);
                localStorage.setItem('idUsuario', userId);
                localStorage.setItem('senhaUsuario', senha); // salva senha temporariamente

                // Redireciona conforme o perfil
                switch (perfil) {
                    case 'administrador':
                        window.location.href = 'admin.html';
                        break;
                    case 'cliente':
                        window.location.href = 'cliente.html';
                        break;
                    default:
                        window.location.href = 'cliente.html';
                        break;
                }
            },

            error: function (xhr) {
                let mensagemErro = 'Falha no login. Credenciais inválidas.';

                if (xhr.responseJSON && xhr.responseJSON.Message) {
                    mensagemErro = xhr.responseJSON.Message;
                } else if (xhr.status === 0) {
                    mensagemErro = 'Erro de conexão com o servidor. Verifique se a API está em execução.';
                } else if (xhr.status === 500) {
                    mensagemErro = 'Erro interno no servidor.';
                }

                erroDisplay.text(mensagemErro);
                console.error('Erro de login:', xhr);
            }
        });
    });
});
