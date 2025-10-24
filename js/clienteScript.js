// clienteScript.js 

let userId = null;
let idEndereco = null;

// --- Inputs e elementos ---
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

    btnEditarPessoal.style.display = habilitar ? 'none' : 'block';
    btnSalvarPessoal.style.display = habilitar ? 'block' : 'none';

    msgPessoal.textContent = habilitar ? 'Modo de edição ativo. Clique em Salvar ao terminar.' : '';
    msgPessoal.className = habilitar ? 'info' : '';
}

function habilitarEdicaoEndereco(habilitar) {
    cepInput.disabled = !habilitar;
    logradouroInput.disabled = !habilitar;
    numeroInput.disabled = !habilitar;
    complementoInput.disabled = !habilitar;

    if (habilitar) cepInput.addEventListener('blur', buscarCep);
    else cepInput.removeEventListener('blur', buscarCep);

    btnEditarEndereco.style.display = habilitar ? 'none' : 'block';
    btnSalvarEndereco.style.display = habilitar ? 'block' : 'none';

    msgEndereco.textContent = habilitar ? 'Edite seu endereço e clique em Salvar.' : '';
    msgEndereco.className = habilitar ? 'info' : '';
}

// --- Carregar dados do cliente ---
async function carregarDadosCliente() {
    const currentUserId = localStorage.getItem('idUsuario');

    if (!currentUserId || currentUserId === 'undefined' || currentUserId === 'null') {
        document.getElementById('nomeUsuario').textContent = 'Erro';
        msgPessoal.textContent = 'ID do usuário não encontrado no navegador. Faça login novamente.';
        console.error('idUsuario ausente no localStorage');
        return;
    }

    userId = currentUserId;

    try {
        const userData = await consumirAPIAutenticada(`Usuario/${userId}`, 'GET', null);

        if (userData) {
            document.getElementById('nomeUsuario').textContent = userData.nome || 'Cliente';
            nomeInput.value = userData.nome || '';
            cpfInput.value = userData.cpf || 'Não disponível';
            emailInput.value = userData.email || '';
            dddInput.value = userData.ddd || '';
            telefoneInput.value = userData.telefone || '';

            if (userData.endereco) {
                idEndereco = userData.endereco.idEndereco;
                cepInput.value = userData.endereco.cep || '';
                logradouroInput.value = userData.endereco.logradouro || '';
                numeroInput.value = userData.endereco.numero || '';
                complementoInput.value = userData.endereco.complemento || '';
                bairroInput.value = userData.endereco.bairro || '';
                cidadeInput.value = userData.endereco.cidade || '';
                estadoInput.value = userData.endereco.estado || '';
            } else {
                msgEndereco.textContent = 'Endereço não cadastrado. Clique em Editar para adicionar.';
            }
        } else {
            msgPessoal.textContent = 'Falha ao carregar dados do perfil.';
        }
    } catch (error) {
        msgPessoal.textContent = 'Erro ao carregar dados do perfil.';
        console.error("Erro ao carregar dados do cliente:", error);
    } finally {
        habilitarEdicaoPessoal(false);
        habilitarEdicaoEndereco(false);
    }

    carregarPedidos(userId);
}

// --- Carregar pedidos ---
async function carregarPedidos(id) {
    const pedidosElement = document.getElementById('dadosPedidos');
    pedidosElement.textContent = 'Buscando pedidos...';

    try {
        const pedidosData = await consumirAPIAutenticada(`Pedido/Usuario/${id}`, 'GET', null);

        if (pedidosData && pedidosData.length > 0) {
            // CORREÇÃO: Usar os nomes das propriedades do PedidoOutputDTO do C#
            pedidosElement.innerHTML = pedidosData.map(p => {
                
                // Mapeamento de propriedades do C# para o JS
                const pedidoId = p.Id;
                const dataPedido = p.DataPedido;
                const statusPedido = p.StatusPedido;
                const valorTotal = p.ValorPedido;
                const itens = p.ItemPedidoOutputDTOs;
                
                // Define a classe CSS para o status (útil para cores)
                const statusClass = statusPedido ? statusPedido.toLowerCase() : 'desconhecido';
    
                return `
                <div class="pedido-card status-${statusClass}">
                    <div class="pedido-header">
                        <p><strong>Pedido #${pedidoId}</strong></p>
                        <p class="status-badge">${statusPedido || 'Status Desconhecido'}</p>
                    </div>
                    
                    <div class="pedido-info-summary">
                        <p>Data: ${new Date(dataPedido).toLocaleDateString('pt-BR')}</p>
                        <p class="valor-total">
                            Total: R$ ${valorTotal ? valorTotal.toFixed(2).replace('.', ',') : '0,00'}
                        </p>
                    </div>
                    
                    ${itens && itens.length ? `
                        <div class="itens-list">
                            <div class="itens-header-grid">
                                <span>Produto</span>
                                <span class="align-right">Qtd.</span>
                            </div>
                            <ul class="itens-grid">
                                ${itens.map(i => `
                                    <li class="item-row">
                                        <span>${i.ProdutoNome || 'Produto Desconhecido'}</span>
                                        <span class="align-right">${i.Quantidade}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        } else {
            pedidosElement.textContent = 'Nenhum pedido encontrado.';
        }
    } catch (error) {
        pedidosElement.textContent = 'Erro ao carregar histórico de pedidos.';
        console.error("Erro ao carregar pedidos:", error);
    }
}

// --- Buscar CEP ---
async function buscarCep() {
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    msgEndereco.textContent = 'Buscando CEP...';
    msgEndereco.className = 'info';
    logradouroInput.value = '';

    try {
        let dadosCep = await consumirAPIAutenticada(`Cep/buscar/${cep}`, 'GET', null);
        if (!dadosCep) {
            const viaResp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (viaResp.ok) {
                const viaData = await viaResp.json();
                if (!viaData.erro) dadosCep = viaData;
            }
        }

        if (dadosCep && !dadosCep.erro) {
            logradouroInput.value = dadosCep.logradouro || '';
            bairroInput.value = dadosCep.bairro || '';
            cidadeInput.value = dadosCep.localidade || dadosCep.cidade || '';
            estadoInput.value = dadosCep.uf || '';
            numeroInput.focus();
            msgEndereco.textContent = 'CEP encontrado!';
            msgEndereco.className = 'sucesso';
        } else {
            logradouroInput.value = '';
            msgEndereco.textContent = 'CEP não encontrado. Preencha o endereço manualmente.';
            msgEndereco.className = 'erro';
        }
    } catch (error) {
        msgEndereco.textContent = 'Erro de conexão ao buscar CEP.';
        msgEndereco.className = 'erro';
        console.error('Erro buscarCep:', error);
    }
}

// --- Atualizar dados pessoais ---
async function handleUpdatePessoal(event) {
    event.preventDefault();
    msgPessoal.textContent = '';

    if (!userId) {
        msgPessoal.textContent = 'Erro de sessão. Faça login novamente.';
        return;
    }

    const updateDto = {
        nome: nomeInput.value.trim(),
        email: emailInput.value.trim(),
        cpf: cpfInput.value.trim(),
        ddd: dddInput.value ? parseInt(dddInput.value) : null,
        telefone: telefoneInput.value.trim(),
        tipoUsuarioId: 1
    };

    try {
        await consumirAPIAutenticada(`Usuario/${userId}`, 'PUT', updateDto);
        msgPessoal.textContent = 'Dados pessoais atualizados com sucesso!';
        msgPessoal.className = 'sucesso';
        document.getElementById('nomeUsuario').textContent = updateDto.nome || 'Cliente';
        habilitarEdicaoPessoal(false);
    } catch (error) {
        msgPessoal.textContent = 'Erro ao salvar dados. Verifique os campos e tente novamente.';
        msgPessoal.className = 'erro';
        console.error("Erro ao salvar dados pessoais:", error);
    }
}

// --- Atualizar endereço ---
async function handleUpdateEndereco(event) {
    event.preventDefault();
    msgEndereco.textContent = '';

    if (!userId) {
        msgEndereco.textContent = 'Erro de sessão. Faça login novamente.';
        return;
    }

    if (!logradouroInput.value.trim() && cepInput.value.trim()) await buscarCep();

    if (!logradouroInput.value.trim()) {
        msgEndereco.textContent = 'Logradouro vazio. Preencha o endereço corretamente.';
        msgEndereco.className = 'erro';
        logradouroInput.focus();
        return;
    }

    const dadosEndereco = {
        ...(idEndereco && { idEndereco }),
        logradouro: logradouroInput.value.trim(),
        numero: numeroInput.value.trim(),
        complemento: complementoInput.value.trim(),
        cep: cepInput.value.trim(),
        bairro: bairroInput.value.trim(),
        cidade: cidadeInput.value.trim(),
        estado: estadoInput.value.trim(),
        usuarioId: parseInt(userId)
        usuarioId: parseInt(userId)
    };

    const url = idEndereco ? `Endereco/${idEndereco}` : `Endereco`;
    const method = idEndereco ? 'PUT' : 'POST';

    try {
        const responseData = await consumirAPIAutenticada(url, method, dadosEndereco);
        if (method === 'POST' && responseData && responseData.idEndereco)
            idEndereco = responseData.idEndereco;

        msgEndereco.textContent = 'Endereço salvo com sucesso!';
        msgEndereco.className = 'sucesso';
        habilitarEdicaoEndereco(false);
    } catch (error) {
        msgEndereco.textContent = 'Erro ao salvar endereço. Verifique os dados e tente novamente.';
        msgEndereco.className = 'erro';
        console.error("Erro ao salvar endereço:", error);
    }
}

// --- Inicialização ---
if (typeof verificarAcesso === 'function' && verificarAcesso(['cliente'])) {
    btnEditarPessoal.addEventListener('click', () => habilitarEdicaoPessoal(true));
    btnSalvarPessoal.addEventListener('click', handleUpdatePessoal);
    btnEditarEndereco.addEventListener('click', () => habilitarEdicaoEndereco(true));
    btnSalvarEndereco.addEventListener('click', handleUpdateEndereco);

    const formDados = document.getElementById('formDadosPessoais');
    if (formDados) formDados.addEventListener('submit', handleUpdatePessoal);
    const formEnd = document.getElementById('formEndereco');
    if (formEnd) formEnd.addEventListener('submit', handleUpdateEndereco);

    carregarDadosCliente();
} else {
    console.warn('Acesso não verificado ou usuário sem perfil cliente. Verificação abortada.');
}