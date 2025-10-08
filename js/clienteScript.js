// clienteScript.js

let userId = null;

/**
 * Função para buscar os dados do cliente e preencher os formulários.
 */
async function carregarDadosCliente() {
    // 1. OBTÉM e VALIDA o ID do usuário (Validação robusta)
    const currentUserId = localStorage.getItem('userId');
    
    // Verifica se o ID é nulo, vazio ou a string "undefined"
    if (!currentUserId || currentUserId === 'undefined' || currentUserId === 'null') {
        document.getElementById('nomeUsuario').textContent = 'Erro';
        document.getElementById('msgPessoal').textContent = 'ID do usuário não encontrado no navegador. Faça login novamente.';
        return; // Sai da função
    }
    
    // Armazena o ID válido na variável global
    userId = currentUserId;

    // 2. Buscar Dados Pessoais e Endereço (Rota: /Usuario/5)
    const userData = await consumirAPIAutenticada(`/Usuario/${userId}`); 
    
    if (userData) {
        document.getElementById('nomeUsuario').textContent = userData.nome || 'Cliente';

        // Preencher Formulário de Dados Pessoais
        document.getElementById('nome').value = userData.nome || '';
        document.getElementById('cpf').value = userData.cpf || 'Não disponível';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('ddd').value = userData.ddd || '';
        document.getElementById('telefone').value = userData.telefone || '';
        
        // Preencher Formulário de Endereço
        if (userData.endereco) {
            document.getElementById('cep').value = userData.endereco.cep || '';
            document.getElementById('logradouro').value = userData.endereco.logradouro || '';
            document.getElementById('numero').value = userData.endereco.numero || '';
            document.getElementById('complemento').value = userData.endereco.complemento || '';
        }

    } else {
        document.getElementById('msgPessoal').textContent = 'Falha ao carregar dados do perfil. Verifique se o endpoint /Usuario/{id} está ativo.';
    }
    
    // 3. Buscar Pedidos (usando o ID válido)
    carregarPedidos(userId);
}


/**
 * Função para buscar o histórico de pedidos.
 */
async function carregarPedidos(id) {
    const pedidosElement = document.getElementById('dadosPedidos');
    pedidosElement.textContent = 'Buscando pedidos...';

    // Rota Exemplo: /Pedido/cliente/{id} 
    const pedidosData = await consumirAPIAutenticada(`/Pedido/cliente/${id}`);
    
    if (pedidosData && pedidosData.length > 0) {
        pedidosElement.textContent = JSON.stringify(pedidosData, null, 2);
    } else {
        pedidosElement.textContent = 'Nenhum pedido encontrado.';
    }
}


/**
 * Função para lidar com a atualização dos dados pessoais.
 */
async function handleUpdatePessoal(event) {
    event.preventDefault();
    document.getElementById('msgPessoal').textContent = '';
    
    if (!userId) {
         document.getElementById('msgPessoal').textContent = 'Erro de sessão. Recarregue a página.';
         return;
    }
    
    // Coletar dados do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const ddd = document.getElementById('ddd').value;
    const telefone = document.getElementById('telefone').value;

    const updateDto = { 
        nome, 
        email, 
        ddd: parseInt(ddd), 
        telefone 
    };

    // Rota Exemplo: PUT /api/Usuario/perfil/{id}
    const response = await consumirAPIAutenticada(`/Usuario/perfil/${userId}`, 'PUT', updateDto);

    if (response && response.status === 204) {
        document.getElementById('msgPessoal').style.color = 'var(--primary-color)';
        document.getElementById('msgPessoal').textContent = 'Dados pessoais atualizados com sucesso!';
    } else {
        document.getElementById('msgPessoal').style.color = 'var(--error-color)';
        document.getElementById('msgPessoal').textContent = 'Erro ao salvar dados. Verifique o console.';
    }
}

/**
 * Inicialização da página: verifica acesso e carrega dados.
 */
if (verificarAcesso('cliente')) {
    // Adiciona o listener para o formulário de Dados Pessoais
    document.getElementById('formDadosPessoais').addEventListener('submit', handleUpdatePessoal);
    
    // Adiciona o listener para o formulário de Endereço 
    document.getElementById('formEndereco').addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('msgEndereco').style.color = 'var(--primary-color)';
        document.getElementById('msgEndereco').textContent = 'Funcionalidade de Endereço em desenvolvimento!';
    });

    carregarDadosCliente();
}