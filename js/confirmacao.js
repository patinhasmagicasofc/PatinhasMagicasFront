document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idPedido = params.get("id");

    const dadosPedidoContainer = document.getElementById("pedidoItens");
    const pedidoTotalSpan = document.getElementById("pedidoTotal");

    if (!idPedido) {
        dadosPedidoContainer.innerHTML = `<div style="color:red; text-align:center;">ID do pedido não informado.</div>`;
        return;
    }

    try {
        const pedido = await consumirAPIAutenticada(`/Pedido/${idPedido}`, "GET");

        console.log(pedido)

        const itens = pedido.itemPedidoOutputDTOs; // <-- aqui

        if (!itens || itens.length === 0) {
            dadosPedidoContainer.innerHTML = `<div style="text-align:center;">Nenhum item encontrado para este pedido.</div>`;
            pedidoTotalSpan.textContent = "R$ 0,00";
            return;
        }

        let total = 0;
        dadosPedidoContainer.innerHTML = ""; // limpa antes de preencher

        itens.forEach(item => {
            const subtotal = item.precoUnitario * item.quantidade;
            total += subtotal;

            const card = document.createElement("div");
            card.className = "pedido-card";

            card.innerHTML = `
                <div class="item-info">
                <img src=${item.produtoOutputDTO.urlImagem} width=50px></img>
                    <p><strong>Produto:</strong> ${item.produto}</p>
                    <p><strong>Quantidade:</strong> ${item.quantidade}</p>
                    <p><strong>Preço unitário:</strong> R$ ${item.precoUnitario.toFixed(2)}</p>
                </div>
                <div class="item-total"><strong>Subtotal:</strong> R$ ${subtotal.toFixed(2)}</div>
            `;

            dadosPedidoContainer.appendChild(card);
        });

        pedidoTotalSpan.textContent = `R$ ${total.toFixed(2)}`;

    } catch (err) {
        console.error(err);
        dadosPedidoContainer.innerHTML = `<div style="color:red; text-align:center;">Erro ao carregar o pedido.</div>`;
        pedidoTotalSpan.textContent = "R$ 0,00";
    }
});
