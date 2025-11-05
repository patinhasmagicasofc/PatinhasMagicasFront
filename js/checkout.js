const carrinho = JSON.parse(localStorage.getItem("cart")) || [];
const resumoDiv = document.getElementById("resumoCarrinho");
const pagamentoSelect = document.getElementById("pagamento");
const cartBadge = document.getElementById("cart-count");

// Atualiza badge do carrinho
function updateCartBadge() {
  const count = carrinho.reduce((total, item) => total + (item.quantidade || 1), 0);
  if (cartBadge) {
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

renderCarrinho();
carregarPagamentos();

// Finaliza pedido
document.getElementById("formCheckout").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!verificarAcesso(['administrador', 'Cliente'])) return;

  if (!carrinho.length) return mostrarToast("⚠️ Carrinho vazio!.", "aviso");;
  const pagamentoId = pagamentoSelect.value;
  if (!pagamentoId) return mostrarToast("⚠️ Selecione uma forma de pagamento!.", "aviso");;

  

  try {
    const pedidoCompleto = {
      usuarioId: Number(getUserIdFromToken()),
      statusPedidoId: null,
      tipoPagamentoId: Number(pagamentoSelect.value),
      itensPedido: carrinho.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade,
        precoUnitario: item.preco
      }))
    };

    console.log(pedidoCompleto);
    const result = await consumirAPIAutenticada('/Pedido', 'POST', pedidoCompleto);
    console.log(result);

    if (!result.pedidoId) throw new Error("Erro ao criar pedido");

    mostrarToast("✅ Pedido finalizado com sucesso!.", "sucesso");

    localStorage.removeItem("cart");
    window.location.href = "/pages/user/confirmacao.html?id=" + result.pedidoId;

  } catch (err) {
    console.error(err);
    mostrarToast("❌ Erro ao finalizar pedido. Tente novamente.", "erro");
  }
});
