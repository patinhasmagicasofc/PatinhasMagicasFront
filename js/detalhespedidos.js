$(document).ready(function () {

    let params = new URLSearchParams(document.location.search);
    let idPedido = params.get("idPedido");

    const urlBase = "http://localhost:5260/api";

    console.log("ID do pedido:", idPedido);

    $.ajax({
        url: urlBase + "/Pedido/" + idPedido,
        type: "GET",
        contentType: "application/json",
        success: function (dados) {
            console.log(dados);

            const tabelaPedidos = $('order-meta');
            tabelaPedidos.empty();

            const linha = `<p><strong>ID</strong><br><span id="order-id">#${dados.id}</span></p>
                           <p><strong>Data</strong><br><span id="order-date">${dados.dataPedido}</span></p>
                           <p><strong>Pagamento</strong><br><span id="order-payment" class="small">Pix</span></p>
                           <p><strong>Status</strong><br><span id="order-status" class="badge pago">Pago</span></p>`;
            tabelaPedidos.append(linha);

            const cardCliente = $('#info-cliente');
            cardCliente.empty();

            const card = `<div class="section-title">Informações do Cliente</div>
                            <p><strong id="client-name">${dados.usuarioOutputDTO.nome}</strong></p>
                            <p class="small" id="client-email">${dados.usuarioOutputDTO.email}</p>
                            <p class="small" id="client-phone">${dados.usuarioOutputDTO.telefone}</p>`;
            cardCliente.append(card);


            const tbody = $('items-body');
            tbody.empty();

            dados.itemPedidoOutputDTOs.forEach(itemPedido => {
                console.log(itemPedido.produto)
                console.log("teste");
                console.log(itemPedido);

                const item = `<td style="display:flex;align-items:center;gap:10px;">
                        ${produtoOutputDTO.foto ? `<img src="${produtoOutputDTO.foto}" alt="${produtoOutputDTO.foto}">` : `<div style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;"></div>`}
                        <div>
                            <div style="font-weight:600">${it.title}</div>
                            <div class="muted" style="margin-top:6px;">SKU: ${it.id}</div>
                        </div>
                        </td>`;

                tbody.append(item);
            });
        },
        error: function (erro) {
            console.log('Deu erro!', erro);
        }
    });

});