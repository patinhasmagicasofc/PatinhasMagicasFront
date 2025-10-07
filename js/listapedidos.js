const urlBase = "http://localhost:5260/api";

let currentPage = 1;
let pageSize = 10;
const hoje = new Date().toISOString().split('T')[0]; // "yyyy-MM-dd"
let dataInicio = document.getElementById('dataInicio').value = hoje;
let datafim = document.getElementById('dataFim').value = hoje;
console.log(dataInicio);


function loadPage(page = 1, pageSize = 5) {
    $.ajax({
        url: `${urlBase}/Pedido/paged?page=${page}&pageSize=${pageSize}&dataInicio=${dataInicio}&dataFim=${dataFim}`,
        type: "GET",
        contentType: "application/json",
        success: function (data) {
            const totalPages = Math.ceil(data.total / pageSize);
            $('#totalPages').text(`Página ${page} de ${totalPages}`);

            renderTable(data.pedidosDTO);


            let totalPedidosPendentes = 0;
            let totalPedidosCancelados = 0;
            data.pedidosDTO.forEach(pedido => {
                if (pedido.statusPedido === "Pendente") totalPedidosPendentes++;
                if (pedido.statusPedido === "Cancelado") totalPedidosCancelados++;
            });
            const cardPedidosPendentes = $('#pedidosPendentes');
            const linhaPedidosPendentes = `<p>Pedidos pendentes</p>
                                            <strong>${totalPedidosPendentes}</strong>`;

            cardPedidosPendentes.html(linhaPedidosPendentes);

            const cardPedidosCancelados = $('#pedidosCancelados');
            const linhaPedidosCancelados = `<p>Pedidos cancelados</p>
                                            <strong>${totalPedidosCancelados}</strong>`;
            cardPedidosCancelados.html(linhaPedidosCancelados);


            console.log(data);

            $('#btnPrev').prop('disabled', page <= 1);
            $('#btnNext').prop('disabled', page >= totalPages);
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
                <td>R$${pedido.valorTotal}</td>
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