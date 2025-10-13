let currentPage = 1;
let pageSize = 5;

$(document).ready(async function () {

    if (!verificarAcesso('administrador')) {
        window.location.href = 'login.html';
        return;
    }

    await carregarStatusPedidos();
    await loadPage(currentPage, pageSize);

    // Eventos
    $('#btnPrev').on('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadPage(currentPage, pageSize);
        }
    });

    $('#btnNext').on('click', () => {
        currentPage++;
        loadPage(currentPage, pageSize);
    });

    $('#btnFiltrar').on('click', () => {
        currentPage = 1;
        loadPage(currentPage, pageSize);
    });
});

async function loadPage(page = 1, pageSize = 5) {
    const status = $('#status-pedidos').val();
    const dataInicio = $('#dataInicio').val();
    const dataFim = $('#dataFim').val();
    const nome = $('#nome').val();

    const params = new URLSearchParams();
    if (nome) params.append('nome', nome);
    if (status) params.append('status', status);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    params.append('page', page);
    params.append('pageSize', pageSize);

    const endpoint = `/Pedido/paged?${params.toString()}`;

    const data = await consumirAPIAutenticada(endpoint, 'GET');

    if (!data) {
        console.warn('Não foi possível carregar os pedidos.');
        return;
    }

    renderTable(data.pedidoOutputDTO);

    const totalPages = Math.ceil(data.qTotalVendas / pageSize);
    $('#totalPages').text(`Página ${page} de ${totalPages}`);

    $('#btnPrev').prop('disabled', page <= 1);
    $('#btnNext').prop('disabled', page >= totalPages);

    atualizarResumoPedidos(data);
}


function atualizarResumoPedidos(data) {
    let totalPendentes = 0;
    let totalCancelados = 0;

    data.pedidoOutputDTO.forEach(p => {
        if (p.statusPedido === 'Pendente') totalPendentes++;
        if (p.statusPedido === 'Cancelado') totalCancelados++;
    });

    $('#totalVendas').html(`<p>Total de pedidos hoje</p><strong>${data.qTotalVendas}</strong>`);
    $('#valorTotalVendas').html(`<p>Total de vendas hoje</p><strong>${data.valorTotalVendas}</strong>`);
    $('#pedidosPendentes').html(`<p>Pedidos pendentes</p><strong>${totalPendentes}</strong>`);
    $('#pedidosCancelados').html(`<p>Pedidos cancelados</p><strong>${totalCancelados}</strong>`);
}

function renderTable(pedidos) {
    const tabela = $('#tabela-pedidos tbody');
    tabela.empty();

    if (!pedidos || pedidos.length === 0) {
        tabela.append('<tr><td colspan="6" class="text-center">Nenhum pedido encontrado</td></tr>');
        return;
    }

    pedidos.forEach(p => {
        tabela.append(`
            <tr>
                <td>${p.id}</td>
                <td>${p.nomeCliente}</td>
                <td>${p.dataPedido}</td>
                <td>${p.statusPedido}</td>
                <td>${p.valorTotal}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="verDetalhes(${p.id})">Ver</button>
                </td>
            </tr>
        `);
    });
}

async function carregarStatusPedidos() {
    const dados = await consumirAPIAutenticada('/StatusPedido', 'GET');

    const select = $('#status-pedidos');
    select.empty();
    select.append('<option value="">Todos</option>');

    if (dados) {
        dados.forEach(s => {
            select.append(`<option value="${s.nome}">${s.nome}</option>`);
        });
    }
}

async function verDetalhes(id) {
    const pedido = await consumirAPIAutenticada(`/Pedido/${id}`, 'GET');
    if (!pedido) {
        alert('Erro ao carregar detalhes do pedido.');
        return;
    }

    console.log('Detalhes do pedido:', pedido);
    alert(`Pedido #${pedido.id}\nCliente: ${pedido.nomeCliente}\nStatus: ${pedido.statusPedido}`);
}
