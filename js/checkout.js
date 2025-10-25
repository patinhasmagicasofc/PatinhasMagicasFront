const carrinho = JSON.parse(localStorage.getItem("cart")) || [];
const resumoDiv = document.getElementById("resumoCarrinho");
const pagamentoSelect = document.getElementById("pagamento");
const cartBadge = document.getElementById("cart-count");

// Atualiza badge do carrinho
function updateCartBadge() {
    const count = carrinho.reduce((total, item) => total + (item.quantidade || 1), 0);
    if(cartBadge){
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? "inline" : "none";
    }
}

// Renderiza resumo do carrinho
function renderCarrinho() {
    updateCartBadge();

    if (!carrinho.length) {
        resumoDiv.innerHTML = `<div class="alert">Seu carrinho está vazio.</div>`;
        document.getElementById("formCheckout").style.display = "none";
        return;
    }

    let total = 0;
    let html = `<div class="title-resumoCarrinho">
          <ul>
            <li>
              <p>
                Resumo do Pedido
              </p>
            </li>
          </ul>
        </div>
        <table >
          <thead >
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preço Unitário</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>`;

    carrinho.forEach(item => {
        const precoUnitario = item.preco || 0;
        const quantidade = item.quantidade || 1;
        const subtotal = precoUnitario * quantidade;
        total += subtotal;
        html += `
          <tr>
            <td><img src="${item.urlImagem}" class="produto-img">${item.nome}</td>
            <td>${quantidade}</td>
            <td>R$ ${precoUnitario.toFixed(2)}</td>
            <td>R$ ${subtotal.toFixed(2)}</td>
          </tr>`;
    });

    html += `</tbody></table>
    <div class="total">
          <ul>
            <li>
              <p>
                Total: R$ ${total.toFixed(2)}
              </p>
            </li>
          </ul>
        </div>`;

    resumoDiv.innerHTML = html;
}

// Carrega formas de pagamento da API
async function carregarPagamentos() {
    try {
        const tiposPagamento = await consumirAPIAutenticada('/TipoPagamento', 'GET'); // ajuste sua função de API
        pagamentoSelect.innerHTML = `<option value="">Selecione</option>`;
        tiposPagamento.forEach(p => {
            pagamentoSelect.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
        });
    } catch (err) {
        console.error(err);
        pagamentoSelect.innerHTML = `<option value="">Erro ao carregar pagamentos</option>`;
    }
}

// Simula usuário logado
function getUsuarioLogadoId() {
    return JSON.parse(localStorage.getItem("usuarioLogado"))?.IdUsuario || 1;
}

renderCarrinho();
carregarPagamentos();

// Finaliza pedido
document.getElementById("formCheckout").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!carrinho.length) return alert("Carrinho vazio!");
    const pagamentoId = pagamentoSelect.value;
    if (!pagamentoId) return alert("Selecione uma forma de pagamento");

    try {
        const dataPedidoLocal = new Date().toISOString().slice(0, 19);

        const pedido = {
            usuarioId: getUsuarioLogadoId(),
            dataPedido: dataPedidoLocal,
            StatusPedidoId: 1
        };

        const responsePedido = await consumirAPIAutenticada('/Pedido', 'POST', pedido);

        await Promise.all(carrinho.map(item => {
            const itemPedido = {
                pedidoId: responsePedido.pedidoId,
                produtoId: item.id,
                quantidade: item.quantidade,
                precoUnitario: item.preco
            };
            return consumirAPIAutenticada('/ItemPedido', 'POST', itemPedido);
        }));

        const valorTotal = carrinho.reduce((t, i) => t + (i.preco || 0) * (i.quantidade || 1), 0);

        const pagamento = {
            pedidoId: responsePedido.pedidoId,
            valor: valorTotal,
            observacao: '',
            tipoPagamentoId: pagamentoId,
            statusPagamentoId: 1,
            dataPagamento: new Date().toISOString().slice(0, 19)
        };

        await consumirAPIAutenticada('/Pagamento', 'POST', pagamento);

        localStorage.removeItem("cart");
        window.location.href = "../pages/user/confirmacao.html?id=" + responsePedido.pedidoId;

    } catch (err) {
        console.error(err);
        alert("Erro ao finalizar pedido. Tente novamente.");
    }
});
