// loginScript.js

const API_BASE_URL = 'http://localhost:5260/api'; 
const LOGIN_ENDPOINT = `${API_BASE_URL}/Login/login`; 

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const erroDisplay = document.getElementById('mensagemErro');
    
    erroDisplay.textContent = '';

    try {
        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            let errorMessage = 'Falha no login. Credenciais inválidas.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.Message || errorMessage;
            } catch {
            }
            erroDisplay.textContent = errorMessage;
            return;
        }

        const data = await response.json();
        const token = data.token;
        const perfil = data.perfil.toLowerCase(); 
        
        const userId = data.idUsuario || data.Id || data.id; 
        
        if (!userId) {
            console.error("Erro: A API não retornou o ID do usuário.", data);
            erroDisplay.textContent = "Erro de servidor: O ID do usuário não foi fornecido. Consulte o administrador.";
            return; 
        }

        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', perfil);
        localStorage.setItem('idUsuario', userId); 
        
        
        switch (perfil) {
            case 'administrador':
                window.location.href = 'admin.html';
                break;
            case 'cliente':
                window.location.href = 'cliente.html';
                break;
            default:
                window.location.href = 'cliente.html';
        }

    } catch (error) {
        erroDisplay.textContent = 'Erro de conexão com o servidor. Verifique a API.';
        console.error('Erro de login:', error);
    }

    localStorage.setItem('senhaUsuario', senha); // salva senha temporariamente

});