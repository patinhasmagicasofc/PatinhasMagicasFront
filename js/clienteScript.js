// clienteScript.js 

let userId = null;
let idEndereco = null;



// --- ---
const nomeInput = document.getElementById('nome');
const cpfInput = document.getElementById('cpf');
const emailInput = document.getElementById('email');
const dddInput = document.getElementById('ddd');
const telefoneInput = document.getElementById('telefone');
const msgPessoal = document.getElementById('msgPessoal');
const btnEditarPessoal = document.getElementById('btnEditarPessoal');
const btnSalvarPessoal = document.getElementById('btnSalvarPessoal');

const cepInput = document.getElementById('cep');
const logradouroInput = document.getElementById('logradouro');
const numeroInput = document.getElementById('numero');
const complementoInput = document.getElementById('complemento');
// --- estavam faltando antes: ---
const bairroInput = document.getElementById('bairro');
const cidadeInput = document.getElementById('cidade');
const estadoInput = document.getElementById('estado');

const msgEndereco = document.getElementById('msgEndereco');
const btnEditarEndereco = document.getElementById('btnEditarEndereco');
const btnSalvarEndereco = document.getElementById('btnSalvarEndereco');

// --- Funções de habilitação de edição ---
function habilitarEdicaoPessoal(habilitar) {
    

    if (nomeInput) nomeInput.disabled = !habilitar;
    if (emailInput) emailInput.disabled = !habilitar;
    if (dddInput) dddInput.disabled = !habilitar;
    if (telefoneInput) telefoneInput.disabled = !habilitar;

    if (cpfInput) cpfInput.disabled = true;

    if (btnEditarPessoal) btnEditarPessoal.style.display = habilitar ? 'none' : 'block';
    if (btnSalvarPessoal) btnSalvarPessoal.style.display = habilitar ? 'block' : 'none';
    if (msgPessoal) {
        msgPessoal.textContent = habilitar ? 'Modo de edição ativo. Clique em Salvar ao terminar.' : '';
        msgPessoal.className = 'info';
    }
    if (btnSalvarPessoal) btnSalvarPessoal.disabled = !habilitar;
}

function habilitarEdicaoEndereco(habilitar) {

    if (cepInput) cepInput.disabled = !habilitar;
    if (logradouroInput) logradouroInput.disabled = !habilitar;
    if (numeroInput) numeroInput.disabled = !habilitar;
    if (complementoInput) complementoInput.disabled = !habilitar;

    if (habilitar) {
        if (cepInput) cepInput.addEventListener('blur', buscarCep);
    } else {
        if (cepInput) cepInput.removeEventListener('blur', buscarCep);
    }

    if (btnEditarEndereco) btnEditarEndereco.style.display = habilitar ? 'none' : 'block';
    if (btnSalvarEndereco) btnSalvarEndereco.style.display = habilitar ? 'block' : 'none';
    if (msgEndereco) {
        msgEndereco.textContent = habilitar ? 'Edite seu endereço e clique em Salvar.' : '';
        msgEndereco.className = 'info';
    }
    if (btnSalvarEndereco) btnSalvarEndereco.disabled = !habilitar;
}

// --- Carregar dados do cliente ---
async function carregarDadosCliente() {
    const currentUserId = localStorage.getItem('idUsuario');

    if (!currentUserId || currentUserId === 'undefined' || currentUserId === 'null') {
        if (document.getElementById('nomeUsuario')) document.getElementById('nomeUsuario').textContent = 'Erro';
        if (msgPessoal) msgPessoal.textContent = 'ID do usuário não encontrado no navegador. Faça login novamente.';
        console.error('idUsuario ausente no localStorage');
        return;
    }

    userId = currentUserId;

    try {
        const userData = await consumirAPIAutenticada(`Usuario/${userId}`, 'GET', null);

        if (userData) {
            if (document.getElementById('nomeUsuario')) document.getElementById('nomeUsuario').textContent = userData.nome || 'Cliente';

            if (nomeInput) nomeInput.value = userData.nome || '';
            if (cpfInput) cpfInput.value = userData.cpf || 'Não disponível';
            if (emailInput) emailInput.value = userData.email || '';
            if (dddInput) dddInput.value = userData.ddd || '';
            if (telefoneInput) telefoneInput.value = userData.telefone || '';

            if (userData.endereco) {
                idEndereco = userData.endereco.idEndereco;
                if (cepInput) cepInput.value = userData.endereco.cep || '';
                if (logradouroInput) logradouroInput.value = userData.endereco.logradouro || '';
                if (numeroInput) numeroInput.value = userData.endereco.numero || '';
                if (complementoInput) complementoInput.value = userData.endereco.complemento || '';
                if (bairroInput) bairroInput.value = userData.endereco.bairro || '';
                if (cidadeInput) cidadeInput.value = userData.endereco.cidade || '';
                if (estadoInput) estadoInput.value = userData.endereco.estado || '';
            } else {
                if (msgEndereco) msgEndereco.textContent = 'Endereço não cadastrado. Clique em Editar para adicionar.';
            }
        } else {
            if (msgPessoal) msgPessoal.textContent = 'Falha ao carregar dados do perfil.';
        }
    } catch (error) {
        if (msgPessoal) msgPessoal.textContent = 'Erro ao carregar dados do perfil. Verifique o console.';
        console.error("Erro ao carregar dados do cliente:", error);
    } finally {
        habilitarEdicaoPessoal(false);
        habilitarEdicaoEndereco(false);
    }

    carregarPedidos(userId);
}

async function carregarPedidos(id) {
    const pedidosElement = document.getElementById('dadosPedidos');
    if (pedidosElement) pedidosElement.textContent = 'Buscando pedidos...';

    try {
        const pedidosData = await consumirAPIAutenticada(`Pedido/cliente/${id}`, 'GET', null);

        if (pedidosData && pedidosData.length > 0) {
            pedidosElement.textContent = JSON.stringify(pedidosData, null, 2);
        } else {
            pedidosElement.textContent = 'Nenhum pedido encontrado.';
        }
    } catch (error) {
        pedidosElement.textContent = 'Erro ao carregar histórico de pedidos.';
        console.error("Erro ao carregar pedidos:", error);
    }
}

// --- Buscar CEP (usa a função consumirAPIAutenticada e fallback para ViaCEP) ---
async function buscarCep() {
    const cep = (cepInput && cepInput.value) ? cepInput.value.replace(/\D/g, '') : '';
    if (cep.length !== 8) return;

    if (msgEndereco) { msgEndereco.textContent = 'Buscando CEP...'; msgEndereco.className = 'info'; }
    if (logradouroInput) logradouroInput.value = '';

    try {
        // Tenta a rota do backend primeiro (se existir)
        let dadosCep = null;
        try {
            dadosCep = await consumirAPIAutenticada(`Cep/buscar/${cep}`, 'GET', null);
        } catch (e) {
            console.warn('Erro ao buscar CEP via backend, tentarei ViaCEP. Erro:', e);
            dadosCep = null;
        }

        if (!dadosCep) {
            // fallback para ViaCEP público
            const viaResp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (viaResp.ok) {
                const viaData = await viaResp.json();
                if (!viaData.erro) dadosCep = viaData;
            }
        }

        if (dadosCep && !dadosCep.erro) {
            if (logradouroInput) logradouroInput.value = dadosCep.logradouro || '';
            if (bairroInput) bairroInput.value = dadosCep.bairro || '';
            if (cidadeInput) cidadeInput.value = dadosCep.localidade || dadosCep.localidade || dadosCep.cidade || '';
            if (estadoInput) estadoInput.value = dadosCep.uf || '';

            if (numeroInput) numeroInput.focus();
            if (msgEndereco) { msgEndereco.textContent = 'CEP encontrado!'; msgEndereco.className = 'sucesso'; }
        } else {
            if (logradouroInput) { logradouroInput.value = ''; logradouroInput.disabled = false; }
            if (msgEndereco) { msgEndereco.textContent = 'CEP não encontrado. Preencha o endereço manualmente.'; msgEndereco.className = 'erro'; }
        }
    } catch (error) {
        if (msgEndereco) { msgEndereco.textContent = 'Erro de conexão ao buscar CEP.'; msgEndereco.className = 'erro'; }
        console.error('Erro buscarCep:', error);
    }
}

// --- Salvar dados pessoais ---
async function handleUpdatePessoal(event) {
    event.preventDefault();
    if (msgPessoal) msgPessoal.textContent = '';

    if (!userId) {
        if (msgPessoal) msgPessoal.textContent = 'Erro de sessão. Faça login novamente.';
        return;
    }

    const updateDto = {
        idUsuario: parseInt(userId),
        nome: nomeInput.value.trim(),
        email: emailInput.value.trim(),
        cpf: cpfInput.value.trim(),
        senha: localStorage.getItem('senhaUsuario') || '123456',
        ddd: dddInput.value ? parseInt(dddInput.value) : null,
        telefone: telefoneInput.value.trim(),
        tipoUsuarioId: 1
    };


    
    try {
        // Validação rápida no frontend via API
        // const dados = await consumirAPIAutenticada('/StatusPedido', 'GET');
        // const emailCheck = await consumirAPIAutenticada(`Usuario/${updateDto}`, 'PUT');
        // if (emailCheck.exists && emailCheck.idUsuario != userId) {
        //     if (msgPessoal) {
        //         msgPessoal.textContent = 'E-mail já cadastrado para outro usuário.';
        //         msgPessoal.className = 'erro';
        //     }
        //     return;
        // }

        // const cpfCheck = await consumirAPIAutenticada(`Usuario/${updateDto.idUsuario}`, 'PUT');
        // if (cpfCheck.exists && cpfCheck.idUsuario != userId) {
        //     if (msgPessoal) {
        //         msgPessoal.textContent = 'CPF já cadastrado para outro usuário.';
        //         msgPessoal.className = 'erro';
        //     }
        //     return;
        // }

        //         const response = await fetch(`Usuario/${userId}`, {
        //         method: 'PUT',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(updateDto)
        //     });
        const UPDATE_ENDPOINT = `${API_BASE_URL}/Usuario/${userId}`;
        try {
            const response = await fetch(UPDATE_ENDPOINT, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateDto)
            });
    
            const data = await response.json();
            console.log(data)
    
            if (!response.ok) {
                const errorMessage = data.message || 'Falha no cadastro. Verifique os dados.';
                msgPessoal.textContent = errorMessage; msgPessoal.className = 'erro';
                
                return;
            }
            msgPessoal.textContent = data.message || 'Dados pessoais atualizados com sucesso!';
            msgPessoal.textContent = errorMessage; msgPessoal.className = 'sucesso';
            // sucessoDisplay.textContent = data.message || 'Cadastro realizado com sucesso!';
            // setTimeout(() => window.location.href = 'login.html', 3000);
    
        } catch (error) {
            msgPessoal.textContent = 'Erro de conexão com o servidor.';
            console.error('Erro na requisição:', error);
        }
        // Envia atualização
        const response = await consumirAPIAutenticada(`Usuario/${userId}`, 'PUT', updateDto);

        if (msgPessoal) {
            msgPessoal.textContent = 'Dados pessoais atualizados com sucesso!';
            msgPessoal.className = 'sucesso';
        }

        if (document.getElementById('nomeUsuario'))
            document.getElementById('nomeUsuario').textContent = updateDto.nome || 'Cliente';

        // habilitarEdicaoPessoal(false);

    } catch (error) {
        console.error("Erro ao salvar dados pessoais:", error);
        if (msgPessoal) {
            msgPessoal.textContent = 'Erro ao salvar dados. Verifique os campos e tente novamente.';
            msgPessoal.className = 'erro';
        }
    }
}




// --- Salvar endereço (POST ou PUT) ---

async function handleUpdateEndereco(event) {
    event.preventDefault();
    if (msgEndereco) msgEndereco.textContent = '';

    if (!userId) {
        if (msgEndereco) msgEndereco.textContent = 'Erro de sessão. Faça login novamente.';
        return;
    }

    // Se logradouro ainda estiver vazio, tenta buscar pelo CEP
    if (!logradouroInput.value.trim() && cepInput.value.trim()) {
        await buscarCep(); // aguarda a resposta do ViaCEP/backend
    }

    // Validação final
    if (!logradouroInput.value.trim()) {
        if (msgEndereco) {
            msgEndereco.textContent = 'Logradouro vazio. Preencha o endereço corretamente.';
            msgEndereco.className = 'erro';
        }
        logradouroInput.focus();
        return;
    }

    const dadosEndereco = {
        ...(idEndereco && { idEndereco: idEndereco }),
        logradouro: logradouroInput.value.trim(),
        numero: numeroInput.value.trim(),
        complemento: complementoInput.value.trim(),
        cep: cepInput.value.trim(),
        bairro: bairroInput.value.trim(),
        cidade: cidadeInput.value.trim(),
        estado: estadoInput.value.trim(),
        usuarioId: parseInt(userId) 
    };

    const url = idEndereco ? `Endereco/${idEndereco}` : `Endereco`;
    const method = idEndereco ? 'PUT' : 'POST';

    try {
        console.log(`Salvando endereço (${method}):`, dadosEndereco);
        const responseData = await consumirAPIAutenticada(url, method, dadosEndereco);

        if (method === 'POST' && responseData && responseData.idEndereco) {
            idEndereco = responseData.idEndereco;
        }

        if (msgEndereco) {
            msgEndereco.textContent = 'Endereço salvo com sucesso!';
            msgEndereco.className = 'sucesso';
        }

        habilitarEdicaoEndereco(false);
    } catch (error) {
        console.error("Erro ao salvar endereço:", error);
        if (msgEndereco) {
            msgEndereco.textContent = 'Erro ao salvar endereço. Verifique os dados e tente novamente.';
            msgEndereco.className = 'erro';
        }
    }
}



// --- Inicialização: verifica acesso e adiciona listeners apenas se os elementos existirem ---
if (typeof verificarAcesso === 'function' && verificarAcesso('cliente')) {
    if (btnEditarPessoal) btnEditarPessoal.addEventListener('click', () => habilitarEdicaoPessoal(true));
    if (btnSalvarPessoal) btnSalvarPessoal.addEventListener('click', handleUpdatePessoal);

    if (btnEditarEndereco) btnEditarEndereco.addEventListener('click', () => habilitarEdicaoEndereco(true));
    if (btnSalvarEndereco) btnSalvarEndereco.addEventListener('click', handleUpdateEndereco);

    const formDados = document.getElementById('formDadosPessoais');
    if (formDados) formDados.addEventListener('submit', handleUpdatePessoal);
    const formEnd = document.getElementById('formEndereco');
    if (formEnd) formEnd.addEventListener('submit', handleUpdateEndereco);

    carregarDadosCliente();
} else {
    console.warn('Acesso não verificado ou usuário sem perfil cliente. verificar acesso abortado.');
}
