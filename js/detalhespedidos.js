$(document).ready(function () {

    let params = new URLSearchParams(document.location.search);
    let idPedido = params.get("idPedido");

    const urlBase = "http://localhost:5260/api";
    const toBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    console.log("ID do pedido:", idPedido);
    let valorTotalProduto = 0;

    $.ajax({
        url: urlBase + "/Pedido/" + idPedido,
        type: "GET",
        contentType: "application/json",
        success: function (dados) {
            console.log(dados);

            const tabelaPedidos = $('.order-meta');
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


            const tbody = $('#items-body');
            tbody.empty();

            dados.itemPedidoOutputDTOs.forEach(itemPedido => {
                console.log(itemPedido.produto)
                console.log("teste");
                console.log(itemPedido);

                const item = `
                            <tr>
                                <td style="display:flex;align-items:center;gap:10px;">
                                    ${itemPedido.produtoOutputDTO.foto
                        ? `<img src="${itemPedido.produtoOutputDTO.foto}" alt="${itemPedido.produtoOutputDTO.nome}" style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;" />`
                        : `<div style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;"></div>`}
                                    <div>
                                        <div style="font-weight:600">${itemPedido.produtoOutputDTO.nome}</div>
                                        <div class="muted" style="margin-top:6px;">SKU: ${itemPedido.produtoOutputDTO.codigo}</div>
                                    </div>
                                </td>
                                <td>${toBRL(itemPedido.produtoOutputDTO.preco)}</td>
                                <td>${itemPedido.quantidade}</td>
                                <td class="right">${toBRL(itemPedido.produtoOutputDTO.preco * itemPedido.quantidade)}</td>
                            </tr>`;

                            valorTotalProduto = valorTotalProduto + (itemPedido.produtoOutputDTO.preco * itemPedido.quantidade)

                tbody.append(item);
            });

            const delivery = $("#endereco-delivery")
            delivery.empty();

            const endereco = `<h4>Endereço de Entrega</h4>
                                <p id="delivery-name"><strong>Nome:</strong>${dados.usuarioOutputDTO.nome}</p>
                                <p id="delivery-street"><strong>Rua:</strong>${dados.usuarioOutputDTO.enderecoOutputDTO.logradouro}</p>
                                <p id="delivery-city"><strong>Cidade:</strong>${dados.usuarioOutputDTO.enderecoOutputDTO.cidade} - ${dados.usuarioOutputDTO.enderecoOutputDTO.estado}</p>
                                <p id="delivery-zip"><strong>CEP:</strong>${dados.usuarioOutputDTO.enderecoOutputDTO.cep}</p>
                                <p id="delivery-phone"><strong>Tel:</strong>${dados.usuarioOutputDTO.telefone}</p>`;
            delivery.append(endereco);

            const boxTotal = $("#box-total");
            delivery.empty();
            const boxValorTotal= `<b id="box-total">${toBRL(valorTotalProduto)}</b>`;
            boxTotal.append(boxValorTotal);

            const boxSubTotal = $("#box-subtotal");
            boxSubTotal.empty();
            const boxValorSubTotal = `<b id="box-subtotal">${toBRL(valorTotalProduto)}</b>`
            boxSubTotal.append(boxValorSubTotal);




        },
        error: function (erro) {
            console.log('Deu erro!', erro);
        }
    });

});