// clienteScript.js — versão AJAX compatível com ASP.NET Core + JWT
// const API_BASE_URL = 'http://localhost:5260/api';s
let userId = localStorage.getItem('idUsuario');
let idEndereco = null;

// Seletores dos campos
const nomeInput = $('#nome');
const cpfInput = $('#cpf');
const emailInput = $('#email');
const dddInput = $('#ddd');
const telefoneInput = $('#telefone');
const msgPessoal = $('#msgPessoal');
const btnEditarPessoal = $('#btnEditarPessoal');
const btnSalvarPessoal = $('#btnSalvarPessoal');

const cepInput = $('#cep');
const logradouroInput = $('#logradouro');
const numeroInput = $('#numero');
const complementoInput = $('#complemento');
const bairroInput = $('#bairro');
const cidadeInput = $('#cidade');
const estadoInput = $('#estado');
const msgEndereco = $('#msgEndereco');
const btnEditarEndereco = $('#btnEditarEndereco');
const btnSalvarEndereco = $('#btnSalvarEndereco');

// -------- UTILITÁRIA AJAX AUTENTICADA --------
function consumirAPIAutenticada(endpoint, method = 'GET', bodyData = null) {
    const token = localStorage.getItem('authToken');
    return $.ajax({
        url: `${API_BASE_URL}/${endpoint}`,
        method: method,
        data: bodyData ? JSON.stringify(bodyData) : null,
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        xhrFields: { withCredentials: true },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// -------- FUNÇÕES DE EDIÇÃO --------
function habilitarEdicaoPessoal(habilitar) {
    nomeInput.prop('disabled', !habilitar);
    emailInput.prop('disabled', !habilitar);
    dddInput.prop('disabled', !habilitar);
    telefoneInput.prop('disabled', !habilitar);
    cpfInput.prop('disabled', true);

    btnEditarPessoal.toggle(!habilitar);
    btnSalvarPessoal.toggle(habilitar);
    btnSalvarPessoal.prop('disabled', !habilitar);

    msgPessoal
        .text(habilitar ? 'Modo de edição ativo. Clique em Salvar.' : '')
        .attr('class', habilitar ? 'info' : '');
}

function habilitarEdicaoEndereco(habilitar) {
    cepInput.prop('disabled', !habilitar);
    logradouroInput.prop('disabled', !habilitar);
    numeroInput.prop('disabled', !habilitar);
    complementoInput.prop('disabled', !habilitar);

    if (habilitar) cepInput.on('blur', buscarCep);
    else cepInput.off('blur', buscarCep);

    btnEditarEndereco.toggle(!habilitar);
    btnSalvarEndereco.toggle(habilitar);
    btnSalvarEndereco.prop('disabled', !habilitar);

    msgEndereco
        .text(habilitar ? 'Edite seu endereço e clique em Salvar.' : '')
        .attr('class', habilitar ? 'info' : '');
}

// -------- CARREGAR DADOS DO CLIENTE --------
function carregarDadosCliente() {
    const currentUserId = localStorage.getItem('idUsuario');
    if (!currentUserId) {
        msgPessoal.text('ID do usuário não encontrado. Faça login novamente.').attr('class', 'erro');
        return;
    }

    userId = currentUserId;

    consumirAPIAutenticada(`Usuario/${userId}`, 'GET')
        .done(userData => {
            if (!userData) {
                msgPessoal.text('Falha ao carregar dados.').attr('class', 'erro');
                return;
            }

            $('#nomeUsuario').text(userData.nome || 'Cliente');
            nomeInput.val(userData.nome);
            cpfInput.val(userData.cpf);
            emailInput.val(userData.email);
            dddInput.val(userData.ddd);
            telefoneInput.val(userData.telefone);

            if (userData.endereco) {
                idEndereco = userData.endereco.idEndereco;
                cepInput.val(userData.endereco.cep);
                logradouroInput.val(userData.endereco.logradouro);
                numeroInput.val(userData.endereco.numero);
                complementoInput.val(userData.endereco.complemento);
                bairroInput.val(userData.endereco.bairro);
                cidadeInput.val(userData.endereco.cidade);
                estadoInput.val(userData.endereco.estado);
            } else {
                msgEndereco.text('Endereço não cadastrado.').attr('class', 'info');
            }
        })
        .fail(() => msgPessoal.text('Erro ao carregar dados.').attr('class', 'erro'))
        .always(() => {
            habilitarEdicaoPessoal(false);
            habilitarEdicaoEndereco(false);
            carregarPedidos(userId);
        });
}

// -------- CARREGAR PEDIDOS --------
function carregarPedidos(id) {
    const pedidosElement = $('#dadosPedidos');
    pedidosElement.text('Carregando pedidos...');

    consumirAPIAutenticada(`Pedido/cliente/${id}`, 'GET')
        .done(data => {
            pedidosElement.text(
                data?.length > 0 ? JSON.stringify(data, null, 2) : 'Nenhum pedido encontrado.'
            );
        })
        .fail(() => pedidosElement.text('Erro ao carregar pedidos.'));
}



// clienteScript.js — Histórico de pedidos com produtos detalhados
function carregarPedidosAJAX(userId) {
    const pedidosElement = $('#dadosPedidos');
    pedidosElement.text('Carregando histórico de pedidos...');

    consumirAPIAutenticada(
        `/Pedido/cliente/${userId}`, // endpoint da sua API
        'GET',
        null,
        function(pedidosData) {
            pedidosElement.empty();

            if (pedidosData && pedidosData.length > 0) {
                pedidosData.forEach(pedido => {
                    const dataFormatada = new Date(pedido.dataPedido).toLocaleDateString();
                    const status = pedido.statusPedido || 'Não informado';

                    // Lista de produtos
                    let produtosHTML = '';
                    if (pedido.produtos && pedido.produtos.length > 0) {
                        produtosHTML = '<ul>';
                        pedido.produtos.forEach(prod => {
                            produtosHTML += `
                                <li>
                                    <img src="${prod.foto}" alt="${prod.nome}" style="width:50px; height:50px; object-fit:cover; margin-right:5px;">
                                    <strong>${prod.nome}</strong> 
                                    - R$ ${prod.preco.toFixed(2)}
                                    <br>Validade: ${new Date(prod.validade).toLocaleDateString()} 
                                    - Código: ${prod.codigo} 
                                    - Categoria: ${prod.categoriaNome || 'Não informado'}
                                </li>
                            `;
                        });
                        produtosHTML += '</ul>';
                    } else {
                        produtosHTML = '<p>Produtos não disponíveis.</p>';
                    }

                    // Monta o HTML do pedido
                    const pedidoHTML = `
                        <div class="pedido-item" style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:5px;">
                            <p><strong>ID Pedido:</strong> ${pedido.id}</p>
                            <p><strong>Data:</strong> ${dataFormatada}</p>
                            <p><strong>Status:</strong> ${status}</p>
                            <p><strong>Produtos:</strong></p>
                            ${produtosHTML}
                        </div>
                    `;

                    pedidosElement.append(pedidoHTML);
                });
            } else {
                pedidosElement.text('Nenhum pedido encontrado.');
            }
        },
        function(error) {
            pedidosElement.text('Erro ao carregar histórico de pedidos.');
            console.error('Erro AJAX ao carregar pedidos:', error);
        }
    );
}

// Inicialização
$(document).ready(function() {
    const userId = localStorage.getItem('idUsuario');

    if (!userId) {
        $('#dadosPedidos').text('ID do usuário não encontrado. Faça login novamente.');
        return;
    }

    carregarPedidosAJAX(userId);
});




// -------- BUSCAR CEP --------
function buscarCep() {
    const cep = cepInput.val().replace(/\D/g, '');
    if (cep.length !== 8) return;

    msgEndereco.text('Buscando CEP...').attr('class', 'info');

    $.getJSON(`https://viacep.com.br/ws/${cep}/json/`)
        .done(data => {
            if (!data.erro) {
                logradouroInput.val(data.logradouro);
                bairroInput.val(data.bairro);
                cidadeInput.val(data.localidade);
                estadoInput.val(data.uf);
                msgEndereco.text('CEP encontrado!').attr('class', 'sucesso');
            } else {
                msgEndereco.text('CEP não encontrado.').attr('class', 'erro');
            }
        })
        .fail(() => msgEndereco.text('Erro ao buscar CEP.').attr('class', 'erro'));
}

// -------- SALVAR DADOS PESSOAIS --------
function handleUpdatePessoal(event) {
    event.preventDefault();
    msgPessoal.text('');

    if (!userId) return msgPessoal.text('Erro de sessão. Faça login novamente.').attr('class', 'erro');

    const updateDto = {
        idUsuario: parseInt(userId),
        nome: nomeInput.val(),
        email: emailInput.val(),
        cpf: cpfInput.val(),
        senha: localStorage.getItem('senhaUsuario') || '123456',
        ddd: parseInt(dddInput.val()),
        telefone: telefoneInput.val(),
        tipoUsuarioId: 2
    };

    consumirAPIAutenticada(`Usuario/${userId}`, 'PUT', updateDto)
        .done(() => {
            msgPessoal.text('Dados atualizados com sucesso!').attr('class', 'sucesso');
            $('#nomeUsuario').text(updateDto.nome);
            habilitarEdicaoPessoal(false);
        })
        .fail(() => msgPessoal.text('Erro ao salvar dados.').attr('class', 'erro'));
}

// -------- SALVAR ENDEREÇO --------
function handleUpdateEndereco(event) {
    event.preventDefault();
    msgEndereco.text('');

    if (!userId) return msgEndereco.text('Erro de sessão. Faça login novamente.').attr('class', 'erro');

    const dadosEndereco = {
        ...(idEndereco && { idEndereco }),
        logradouro: logradouroInput.val(),
        numero: numeroInput.val(),
        complemento: complementoInput.val(),
        cep: cepInput.val(),
        bairro: bairroInput.val(),
        cidade: cidadeInput.val(),
        estado: estadoInput.val(),
        usuarioId: parseInt(userId)
    };

    const method = idEndereco ? 'PUT' : 'POST';
    const url = idEndereco ? `Endereco/${idEndereco}` : 'Endereco';

    consumirAPIAutenticada(url, method, dadosEndereco)
        .done(resp => {
            if (method === 'POST' && resp?.idEndereco) idEndereco = resp.idEndereco;
            msgEndereco.text('Endereço salvo com sucesso!').attr('class', 'sucesso');
            habilitarEdicaoEndereco(false);
        })
        .fail(() => msgEndereco.text('Erro ao salvar endereço.').attr('class', 'erro'));
}

// -------- INICIALIZAÇÃO --------
$(document).ready(function () {
    if (typeof verificarAcesso === 'function' && verificarAcesso('cliente')) {
        btnEditarPessoal.on('click', () => habilitarEdicaoPessoal(true));
        btnSalvarPessoal.on('click', handleUpdatePessoal);
        btnEditarEndereco.on('click', () => habilitarEdicaoEndereco(true));
        btnSalvarEndereco.on('click', handleUpdateEndereco);

        carregarDadosCliente();
    } else {
        console.warn('Acesso negado ou sessão expirada.');
    }
});


function carregarPedidos() {
    consumirAPIAutenticada(`/Pedido/cliente/${userId}`, "GET", null, function (pedidos) {
        const container = $("#dadosPedidos");
        container.empty();

        if (!pedidos || pedidos.length === 0) {
            container.text("Nenhum pedido encontrado.");
            return;
        }

        pedidos.forEach(p => {
            // Card do pedido
            let card = $(`
                <div class="pedido-card">
                    <div class="pedido-header">
                        <span><strong>ID Pedido:</strong> ${p.id}</span>
                        <span><strong>Data:</strong> ${new Date(p.dataPedido).toLocaleString()}</span>
                        <span><strong>Status:</strong> ${p.statusPedidoNome || p.statusPedidoId}</span>
                    </div>
                    <div class="pedido-produtos"></div>
                </div>
            `);

            // Lista de produtos
            const produtosContainer = card.find(".pedido-produtos");
            if (p.produtos && p.produtos.length > 0) {
                p.produtos.forEach(prod => {
                    const prodCard = $(`
                        <div class="produto-card">
                            <img src="${prod.foto}" alt="${prod.nome}">
                            <div class="produto-info">
                                <span class="produto-nome">${prod.nome}</span>
                                <span class="produto-preco">R$ ${prod.preco.toFixed(2)}</span>
                            </div>
                        </div>
                    `);
                    produtosContainer.append(prodCard);
                });
            } else {
                produtosContainer.text("Nenhum produto encontrado neste pedido.");
            }

            container.append(card);
        });

    }, function (err) {
        console.error(err);
        $("#dadosPedidos").text("Erro ao carregar pedidos.");
    });
}
