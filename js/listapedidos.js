
if (!verificarAcesso('administrador')) {
    window.location.href = 'login.html';
}

$(document).ready(function () {



    const urlBase = "http://localhost:5260/api";

    let currentPage = 1;
    let pageSize = 10;

    function loadPage(page = 1, pageSize = 5) {
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
        console.log(params.toString());

        $.ajax({
            url: `${urlBase}/Pedido/paged?${params.toString()}`,
            type: "GET",
            contentType: "application/json",
            success: function (data) {
                console.log(data);
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
            },
            error: function (erro) {
                console.log('Deu erro!', erro);
            }
        });
    }

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

    $('#pageSizeSelect').on('change', function () {
        pageSize = parseInt($(this).val());
        currentPage = 1;
        loadPage(currentPage, pageSize);
    });

    loadPage(currentPage, pageSize);

    $.ajax({
        url: urlBase + "/StatusPedido",
        type: "GET",
        contentType: "application/json",
        success: function (dados) {
            const statusPedido = $('#status-pedidos');
            dados.forEach(status => {
                const option = `<option value="${status.nome}">${status.nome}</option>`;
                statusPedido.append(option);
            });
        },
        error: function (erro) {
            console.log('Deu erro!', erro);
        }
    });


    // Captura o clique no botão de filtro
    $('#btnFiltrar').on('click', function (event) {
        event.preventDefault(); // evita reload da página
        loadPage(); // carrega os pedidos com os filtros
    });
});


//função header

const menuItem = document.querySelectorAll('.item-menu')
function selectLink() {
    menuItem.forEach((item) => item.classList.remove('ativo'))
    this.classList.add('ativo')
};

menuItem.forEach((item) => item.addEventListener('click', selectLink)
);


const btnExpandir = document.querySelector('#btn-exp');
const nav = document.querySelector('.menu-lateral');
const header = document.querySelector('header');

btnExpandir.addEventListener('click', () => {
    nav.classList.toggle('expandir');
    header.classList.toggle('expandir');
});