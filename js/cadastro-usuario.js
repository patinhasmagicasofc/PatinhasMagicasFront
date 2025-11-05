// cadastroScript.js

// Configuração da API: ajuste a porta conforme necessário.
//const API_BASE_URL = 'http://localhost:5260/api';
const API_BASE_URL = 'https://patinhasmagicasapi.onrender.com/api';
const CADASTRO_ENDPOINT = `${API_BASE_URL}/Usuario`;

document.getElementById('cadastroForm').addEventListener('submit', async function (event) {
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
    };

    console.log('Dados para cadastro:', dadosCadastro);

    try {
        const response = await fetch(CADASTRO_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCadastro)
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || 'Falha no cadastro. Verifique os dados.';
            erroDisplay.textContent = errorMessage;
            return;
        }

        sucessoDisplay.textContent = data.message || 'Cadastro realizado com sucesso!';
        setTimeout(() => window.location.href = 'login.html', 3000);

    } catch (error) {
        erroDisplay.textContent = 'Erro de conexão com o servidor.';
        console.error('Erro na requisição:', error);
    }
});