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
        //msgPessoal.textContent = habilitar ? 'Modo de edição ativo. Clique em Salvar ao terminar.' : '';
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
    if (!validarLogin()) return;

    const userId = getUserIdFromToken();

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
}

// --- Salvar dados pessoais ---
async function handleUpdatePessoal(event) {
    event.preventDefault();

    if (!validarLogin()) return;

    if (msgPessoal) msgPessoal.textContent = '';

    const updateDto = {
        nome: nomeInput.value.trim(),
        email: emailInput.value.trim(),
        cpf: cpfInput.value.trim(),
        ddd: dddInput.value ? parseInt(dddInput.value) : null,
        telefone: telefoneInput.value.trim(),
        tipoUsuarioId: 1
    };

    const userId = getUserIdFromToken();
    const UPDATE_ENDPOINT = `/Usuario/${userId}`;

    try {
        const data = await consumirAPIAutenticada(UPDATE_ENDPOINT, 'PUT', updateDto);

        if (!data) {
            msgPessoal.textContent = 'Falha ao atualizar dados. Tente novamente.';
            msgPessoal.className = 'erro';
            return;
        }

        msgPessoal.textContent = data.message || 'Dados pessoais atualizados com sucesso!';
        msgPessoal.className = 'info';

    } catch (error) {
        msgPessoal.textContent = 'Erro de conexão com o servidor.';
        msgPessoal.className = 'erro';
        console.error(error);
    }

    habilitarEdicaoPessoal(false);
}

// --- Buscar CEP (usa a função consumirAPIAutenticada e fallback para ViaCEP) ---
async function buscarCep() {
    if (!validarLogin()) return;

    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    msgEndereco.textContent = 'Buscando CEP...';
    msgEndereco.className = 'info';

    logradouroInput.value = '';
    bairroInput.value = '';
    cidadeInput.value = '';
    estadoInput.value = '';

    try {
        const dadosCep = await consumirAPIAutenticada(`Cep/buscar/${cep}`, 'GET');

        if (dadosCep) {
            logradouroInput.value = dadosCep.logradouro || '';
            bairroInput.value = dadosCep.bairro || '';
            cidadeInput.value = dadosCep.localidade || '';
            estadoInput.value = dadosCep.uf || '';

            numeroInput.focus();
            msgEndereco.textContent = 'CEP encontrado!';
            msgEndereco.className = 'sucesso';
        } else {
            msgEndereco.textContent = 'CEP não encontrado. Preencha manualmente.';
            msgEndereco.className = 'erro';
            logradouroInput.disabled = false;
        }
    } catch (error) {
        msgEndereco.textContent = 'Erro de conexão ao buscar CEP.';
        msgEndereco.className = 'erro';
        console.error('Erro buscarCep:', error);
    }
}

// Dispara a busca quando o CEP perde o foco
cepInput.addEventListener('blur', buscarCep);


async function handleUpdateEndereco(event) {
    event.preventDefault();

    if (!validarLogin()) return;

    if (msgEndereco) msgEndereco.textContent = '';


    if (!logradouroInput.value.trim() && cepInput.value.trim()) {
        await buscarCep();
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
