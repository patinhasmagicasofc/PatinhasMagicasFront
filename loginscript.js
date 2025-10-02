// script.js

// ** IMPORTANTE: Configure a URL da sua API C# **
const API_BASE_URL = 'http://localhost:5260/api'; 
const LOGIN_ENDPOINT = `${API_BASE_URL}/Login/login`; 

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const erroDisplay = document.getElementById('mensagemErro');
    
    erroDisplay.textContent = ''; // Limpa mensagens

    try {
        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            // Se a API retornar erro (ex: 401 Unauthorized)
            let errorMessage = 'Falha no login. Credenciais inválidas.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.Message || errorMessage;
            } catch {
                // Se a resposta não for JSON
            }
            erroDisplay.textContent = errorMessage;
            return;
        }

        const data = await response.json();
        const token = data.token;
        // Normaliza o perfil para garantir consistência no redirecionamento
        const perfil = data.perfil.toLowerCase(); 

        // 1. Armazena o Token e o Perfil no navegador (localStorage)
        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', perfil);
        
        // 2. Redireciona para a página correta com base no perfil
        switch (perfil) {
            case 'administrador':
                window.location.href = 'admin.html';
                break;
            case 'vendedor':
                window.location.href = 'vendedor.html';
                break;
            case 'cliente':
                window.location.href = 'cliente.html';
                break;
            default:
                // Caso o perfil seja desconhecido
                window.location.href = 'cliente.html';
        }

    } catch (error) {
        erroDisplay.textContent = 'Erro de conexão com o servidor. Verifique a API.';
        console.error('Erro de login:', error);
    }
});