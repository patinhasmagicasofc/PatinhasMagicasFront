document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idPedido = params.get("id");

    if (!idPedido) {
        document.getElementById("dadosPedido").innerHTML = `
            <div class="alert alert-danger">ID do pedido não informado.</div>
        `;
        return;
    }

    try {
        const pedido = await consumirAPIAutenticada(`/Pedido/${idPedido}`, "GET");

        let total = pedido.itens.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);

        let html = `
            <h4>Resumo do Pedido #${pedido.id}</h4>
            <p><strong>Cliente:</strong> ${pedido.usuario.nome}</p>
            <p><strong>E-mail:</strong> ${pedido.usuario.email}</p>
            <p><strong>Forma de Pagamento:</strong> ${pedido.pagamento.tipoPagamento}</p>
            <p><strong>Status:</strong> ${pedido.statusPedido.nome}</p>
            <p><strong>Data:</strong> ${new Date(pedido.dataPedido).toLocaleString()}</p>

            <table class="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço Unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
        `;

        pedido.itens.forEach(item => {
            html += `
              <tr>
                <td>${item.produto.nome}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.precoUnitario.toFixed(2)}</td>
                <td>R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}</td>
              </tr>
            `;
        });

        html += `
              </tbody>
            </table>
            <h5 class="text-end text-success">Total: R$ ${total.toFixed(2)}</h5>
        `;

        document.getElementById("dadosPedido").innerHTML = html;

    } catch (err) {
        console.error(err);
        document.getElementById("dadosPedido").innerHTML = `
            <div class="alert alert-danger">Erro ao carregar o pedido.</div>
        `;
    }
});
