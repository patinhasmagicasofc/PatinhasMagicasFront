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

    loadPage(currentPage, pageSize);


    // Captura o clique no botão de filtro
    $('#btnFiltrar').on('click', function (event) {
        event.preventDefault(); // evita reload da página
        //loadPage(); // carrega os pedidos com os filtros
    });

});


//função header
const menuItem = document.querySelectorAll('.item-menu');

function selectLink() {
    menuItem.forEach((item) => item.classList.remove('ativo'));
    this.classList.add('ativo');
}

menuItem.forEach((item) => item.addEventListener('click', selectLink));

const btnExpandir = document.querySelector('#btn-exp');
const nav = document.querySelector('.menu-lateral');
const header = document.querySelector('header');

// Abrir/fechar menu
btnExpandir.addEventListener('click', (e) => {
    e.stopPropagation()
    nav.classList.toggle('expandir');
    header.classList.toggle('expandir');
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('expandir')) {
        nav.classList.remove('expandir');
        header.classList.remove('expandir');
    }
});


//função filters
const btnFilters = document.querySelector('#btn-filters-expandir');
const sidebar = document.querySelector('.filters-exp');
const main = document.querySelector('main');

btnFilters.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
    main.classList.toggle('shifted');
});


// Fechar painel ao clicar fora
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !btnFilters.contains(e.target)) {
        sidebar.classList.remove('open');
        main.classList.remove('shifted');
    }
});

//menu-options
document.addEventListener("click", (e) => {
    const menus = document.querySelectorAll(".menu-container");

    menus.forEach(menu => {
        if (!menu.contains(e.target)) {
            menu.classList.remove("open");
        }
    });


    if (e.target.closest(".menu-btn")) {
        const btn = e.target.closest(".menu-container");
        btn.classList.toggle("open");
    }
});


function renderTable(pedidos) {
    const tabelaPedidos = $('.tbPedidos');
    tabelaPedidos.empty();

    pedidos.forEach(pedido => {
        const data = new Date(pedido.dataPedido);
        const dataFormatada = data.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });

        const linha = `
        <tr>
            <td>${pedido.id}</td>
            <td>${pedido.nomeCliente}</td>
            <td>${dataFormatada}</td>
            <td>R$${pedido.valorPedido}</td>
            <td>${pedido.formaPagamento}</td>
            <td><span class="status ${pedido.statusPedido.toLowerCase()}">${pedido.statusPedido}</span></td>
            <td>
                <button title="Ver"><a href="detalhespedidos.html?idPedido=${pedido.id}" title="Ver">👁</a></button>
                <button title="Editar">✏️</button>
                <button title="Excluir">🗑</button>
            </td>
        </tr>
    `;
        tabelaPedidos.append(linha);
    });
}

const pagination = $('.pagination');
const navPagination = `
<button id="btnPrev">&lt;</button>
<span id="totalPages"></span>
<button id="btnNext">&gt;</button>
<select id="pageSizeSelect">
    <option value="10">10</option>
    <option value="25">25</option>
    <option value="50">50</option>
</select>
`;

pagination.append(navPagination);
async function loadPage(page = 1, pageSize = 5) {
    // pega os valores dos inputs
    const status = $('#status-pedidos').val();
    const dataInicio = $('#dataInicio').val();
    const dataFim = $('#dataFim').val();
    const nome = $('#nome').val();

    // monta a query string dinamicamente
    const params = new URLSearchParams();

    if (nome) params.append('nome', nome);
    if (status) params.append('status', status);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    // também pode incluir paginação
    params.append('page', page);
    params.append('pageSize', pageSize);

    try {
        if (!validarLogin()) return;

        const URL = `Pedido/paged?${params.toString()}`
        const data = await consumirAPIAutenticada(URL, 'GET');

        const totalPages = Math.ceil(data.qTotalVendas / pageSize);
        $('#totalPages').text(`Página ${page} de ${totalPages}`);

        renderTable(data.pedidoOutputDTO);

        let totalPedidosPendentes = 0;
        let totalPedidosCancelados = 0;
        data.pedidoOutputDTO.forEach(pedido => {
            if (pedido.statusPedido === "Pendente") totalPedidosPendentes++;
            if (pedido.statusPedido === "Cancelado") totalPedidosCancelados++;

            const cardTotalVendas = $('#totalVendas');
            const linhaTotalVendas = `<p>Total de pedidos hoje</p>
                                    <strong>${data.qTotalVendas}</strong>`;

            cardTotalVendas.html(linhaTotalVendas);

            const cardvalorTotalVendas = $('#valorTotalVendas');
            const linhacardvalorTotalVendas = `<p>Total de vendas hoje</p>
                                    <strong>${data.valorTotalVendas}</strong>`;
            cardvalorTotalVendas.html(linhacardvalorTotalVendas);
        });

        const cardPedidosPendentes = $('#pedidosPendentes');
        const linhaPedidosPendentes = `<p>Pedidos pendentes</p>
                                    <strong>${totalPedidosPendentes}</strong>`;

        cardPedidosPendentes.html(linhaPedidosPendentes);

        const cardPedidosCancelados = $('#pedidosCancelados');
        const linhaPedidosCancelados = `<p>Pedidos cancelados</p>
                                    <strong>${totalPedidosCancelados}</strong>`;
        cardPedidosCancelados.html(linhaPedidosCancelados);

        $('#btnPrev').prop('disabled', page <= 1);
        $('#btnNext').prop('disabled', page >= totalPages);

        //window.history.replaceState({}, document.title, window.location.pathname);

    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}


$('#pageSizeSelect').on('change', function () {
    pageSize = parseInt($(this).val());
    currentPage = 1;
    loadPage(currentPage, pageSize);
});

loadPage(currentPage, pageSize);


//Carregar Status Pedidos
async function carregarStatusPedidos() {
    try {
        if (!validarLogin()) return;

        const data = await consumirAPIAutenticada('/StatusPedido', 'GET');
        const selectStatus = $('#status-pedidos');

        data.forEach(status => {
            const option = `<option value="${status.nome}">${status.nome}</option>`;
            console.log(status.nome)
            selectStatus.append(option);
        });
    } catch (error) {
        console.error('Erro ao carregar status dos pedidos:', error);
    }
}
