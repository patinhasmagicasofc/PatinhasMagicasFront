// cadastroScript.js — versão AJAX com CORS e validações
// const API_BASE_URL = 'http://localhost:5260/api';
const CADASTRO_ENDPOINT = `${API_BASE_URL}/Usuario`;

$(document).ready(function () {
    $('#cadastroForm').on('submit', function (event) {
        event.preventDefault();

        const nome = $('#nome').val();
        const cpf = $('#cpf').val();
        const email = $('#email').val();
        const ddd = $('#ddd').val();
        const telefone = $('#telefone').val();
        const senha = $('#senha').val();
        const confirmaSenha = $('#confirmaSenha').val();

        const erroDisplay = $('#mensagemErro');
        const sucessoDisplay = $('#mensagemSucesso');

        erroDisplay.text('');
        sucessoDisplay.text('');

        // Validação de senha
        if (senha !== confirmaSenha) {
            erroDisplay.text('A senha e a confirmação de senha não coincidem.');
            return;
        }

        const dadosCadastro = {
            nome: nome,
            cpf: cpf,
            email: email,
            ddd: parseInt(ddd),
            telefone: telefone,
            senha: senha,
            tipoUsuarioId: 2 // Cliente
        };

        $.ajax({
            url: CADASTRO_ENDPOINT,
            method: 'POST',
            contentType: 'application/json; charset=utf-8',
            crossDomain: true,
            xhrFields: { withCredentials: true },
            data: JSON.stringify(dadosCadastro),

            success: function (data, status, xhr) {
                if (xhr.status === 201) {
                    sucessoDisplay.text('Cadastro realizado com sucesso! Redirecionando para o login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                } else {
                    erroDisplay.text('Falha inesperada no cadastro.');
                }
            },

            error: function (xhr) {
                let errorMessage = 'Falha no cadastro. Verifique os dados.';

                if (xhr.responseJSON) {
                    const errorData = xhr.responseJSON;

                    if (xhr.status === 400 && errorData.errors) {
                        const errorKey = Object.keys(errorData.errors)[0];
                        errorMessage = errorData.errors[errorKey][0];
                    } else if (xhr.status === 409 && errorData.mensagem) {
                        errorMessage = errorData.mensagem;
                    } else if (errorData.mensagem) {
                        errorMessage = errorData.mensagem;
                    }
                } else if (xhr.status === 0) {
                    errorMessage = 'Erro de conexão com o servidor. Verifique se a API está em execução.';
                } else if (xhr.status === 500) {
                    errorMessage = 'Erro interno no servidor.';
                }

                erroDisplay.text(errorMessage);
                console.error('Erro no cadastro:', xhr);
            }
        });
    });
});
