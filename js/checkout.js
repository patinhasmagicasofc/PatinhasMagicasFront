const carrinho = JSON.parse(localStorage.getItem("cart")) || [];
const resumoDiv = document.getElementById("resumoCarrinho");
const pagamentoSelect = document.getElementById("pagamento");
const cartBadge = document.getElementById("cart-badge");

// Atualiza badge do carrinho
function updateCartBadge() {
    const count = carrinho.reduce((total, item) => total + (item.quantidade || 1), 0);
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? "inline" : "none";
}

// Renderiza resumo do carrinho
function renderCarrinho() {
    updateCartBadge();

    if (!carrinho.length) {
        resumoDiv.innerHTML = `<div class="alert alert-warning">Seu carrinho está vazio.</div>`;
        document.getElementById("formCheckout").style.display = "none";
        return;
    }

    let total = 0;
    let html = `<h4>Resumo do Pedido</h4>
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preço Unitário</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>`;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        html += `
          <tr>
            <td><img src="${item.urlImagem}" class="produto-img me-2">${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.preco.toFixed(2)}</td>
            <td>R$ ${subtotal.toFixed(2)}</td>
          </tr>`;
    });

    html += `</tbody></table>
        <h5 class="text-end text-success">Total: R$ ${total.toFixed(2)}</h5>`;

    resumoDiv.innerHTML = html;
}

// Carrega formas de pagamento da API
async function carregarPagamentos() {
    try {
        const tiposPagamento = await consumirAPIAutenticada('/TipoPagamento', 'GET'); // ajuste sua função de API
        console.log(tiposPagamento)
        pagamentoSelect.innerHTML = `<option value="">Selecione</option>`;
        tiposPagamento.forEach(p => {
            pagamentoSelect.innerHTML += `<option value="${p.IdTipoPagamento}">${p.nome}</option>`;
        });
    } catch (err) {
        console.error(err);
        pagamentoSelect.innerHTML = `<option value="">Erro ao carregar pagamentos</option>`;
    }
}

renderCarrinho();
carregarPagamentos();

// Simula usuário logado
function getUsuarioLogadoId() {
    // Ajuste para pegar o Id do usuário logado da sua aplicação
    return JSON.parse(localStorage.getItem("usuarioLogado"))?.IdUsuario || 1;
}

// Finaliza pedido
document.getElementById("formCheckout").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!carrinho.length) return alert("Carrinho vazio!");
    const pagamentoId = pagamentoSelect.value;
    if (!pagamentoId) return alert("Selecione uma forma de pagamento");

    try {
        // Cria pedido
        const dataLocal = new Date();
        const dataPedidoLocal = dataLocal.toISOString().slice(0, 19);

        const pedido = {
            usuarioId: getUserIdFromToken(),
            dataPedido: dataPedidoLocal,
            StatusPedidoId: 1 // Pendente
        };

        console.log(pedido)
        const pedidoCriado = await consumirAPIAutenticada('/Pedido', 'POST', pedido)

        // Cria itens do pedido
        for (const item of carrinho) {
            await consumirAPIAutenticada('/ItensPedido', 'POST', {
                IdPedido: pedidoCriado.IdPedido,
                IdProduto: item.id,
                quantidade: item.quantidade,
                precoUnitario: item.preco
            });
        }

        // Cria pagamento
        await consumirAPIAutenticada('/Pagamento', 'POST', {
            IdPedido: pedidoCriado.IdPedido,
            valor: carrinho.reduce((t, i) => t + i.preco * i.quantidade, 0),
            IdTipoPagamento: pagamentoId,
            IdStatusPagamento: 1
        });

        // Limpa carrinho e redireciona
        localStorage.removeItem("cart");
        window.location.href = "confirmacao.html?id=" + pedidoCriado.IdPedido;

    } catch (err) {
        console.error(err);
        alert("Erro ao finalizar pedido. Tente novamente.");
    }
});