// cadastroScript.js

// Configuração da API: ajuste a porta conforme necessário.
const API_BASE_URL = 'http://localhost:5260/api'; 
const CADASTRO_ENDPOINT = `${API_BASE_URL}/Usuario`; 

document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Coleta dos novos e antigos campos do HTML
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const email = document.getElementById('email').value;
    const ddd = document.getElementById('ddd').value;
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('confirmaSenha').value;
    
    const erroDisplay = document.getElementById('mensagemErro');
    const sucessoDisplay = document.getElementById('mensagemSucesso');

    erroDisplay.textContent = ''; // Limpa erros
    sucessoDisplay.textContent = ''; // Limpa sucesso

    // 1. Validação de Senhas
    if (senha !== confirmaSenha) {
        erroDisplay.textContent = 'A senha e a confirmação de senha não coincidem.';
        return;
    }
    
    // 2. Monta o objeto DTO
    // Inclui todos os campos obrigatórios do Model C# e o TipoUsuarioId fixo.
    const dadosCadastro = { 
        nome: nome,
        cpf: cpf,
        email: email,
        ddd: parseInt(ddd), // O Model espera um INT para DDD
        telefone: telefone,
        senha: senha,
        
        // Campo obrigatório para definir o usuário como Cliente
        tipoUsuarioId: 2 
    };

    try {
        const response = await fetch(CADASTRO_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosCadastro)
        });

        if (response.status === 201) {
            // Sucesso no Cadastro (Status 201 Created)
            sucessoDisplay.textContent = 'Cadastro realizado com sucesso! Redirecionando para o login...';
            
            // Redireciona para a tela de login após um breve atraso
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000); 
            
        } else {
            // Se a API retornar erro (ex: 400 Bad Request, 409 Conflict)
            let errorMessage = 'Falha no cadastro. Verifique os dados.';
            
            try {
                const errorData = await response.json();
                
                // Trata erros de validação (400 Bad Request) do Model C#
                if (response.status === 400 && errorData.errors) {
                    // Pega a primeira mensagem de erro de validação (ex: "CPF inválido")
                    const errorKey = Object.keys(errorData.errors)[0];
                    errorMessage = errorData.errors[errorKey][0]; 
                } else {
                    // Trata erros 409 Conflict ou mensagens personalizadas da API
                    errorMessage = errorData.mensagem || errorMessage;
                }
            } catch {
                // Se a resposta não for JSON (erro 500 sem corpo JSON, por exemplo)
            }
            erroDisplay.textContent = errorMessage;
        }

    } catch (error) {
        // Erro de rede ou conexão (ex: API está offline)
        erroDisplay.textContent = 'Erro de conexão com o servidor. Verifique a API.';
        console.error('Erro de cadastro:', error);
    }
});