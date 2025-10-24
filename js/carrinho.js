// --- Funções do carrinho ---
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  setCart(cart);
}

function updateQuantity(id, quantidade) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantidade = Number(quantidade) > 0 ? Number(quantidade) : 1;
    setCart(cart);
  }
}

function calcularTotal(cart) {
  return cart.reduce((total, produto) => total + produto.preco * produto.quantidade, 0);
}

// --- Renderização ---
function renderCart() {
  const container = document.getElementById('cartContainer');
  const cart = getCart();

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart text-center my-5">
        <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" width="100" class="mb-3">
        <ul><li><p>Seu carrinho está vazio.</p></li></ul>
      </div>`;
    document.getElementById('btnCheckout').disabled = true;
    return;
  }

  document.getElementById('btnCheckout').disabled = false;

  let html = `
    <div class="lista-produtos">
      <ul class="cabecalho">
        <li><label class="checkbox-container">
            <input type="checkbox" id="selecao-geral">
            <span class="checkmark"></span>
        </label></li>
        <li>Produto</li>
        <li>Preço</li>
        <li>Quantidade</li>
        <li>Subtotal</li>
        <li></li>
      </ul>`;

  for (const produto of cart) {
    const subtotal = produto.preco * produto.quantidade;

    html += `
      <ul class="item" data-id="${produto.id}">
        <li>
          <label class="checkbox-container">
            <input class="remover" type="checkbox">
            <span class="checkmark"></span>
          </label>
        </li>
        <li class="img-produto">
          <img src="${produto.urlImagem || './img/img-adoption/adoption-for.png'}" alt="Produto" class="produto-img">
          ${produto.nome}
        </li>
        <li>R$ ${produto.preco.toFixed(2)}</li>
        <li>
          <button class="btn-quantidade" data-action="menos">-</button>
          <input class="quantidade" type="text" value="${produto.quantidade}" />
          <button class="btn-quantidade" data-action="mais">+</button>
        </li>
        <li><strong>R$ ${subtotal.toFixed(2)}</strong></li>
        <li><button class="btn btn-sm btn-danger btn-remover">🗑</button></li>
      </ul>`;
  }

  const total = calcularTotal(cart);

  html += `
    </div>
    <div class="text-end my-3">
      <ul><li><p>Total: <span class="text-success">R$ ${total.toFixed(2)}</span></p></li></ul>
    </div>`;

  container.innerHTML = html;

  // === Eventos dinâmicos ===

  // Botões + e -
  container.querySelectorAll('.btn-quantidade').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemEl = btn.closest('.item');
      const id = Number(itemEl.dataset.id);
      const input = itemEl.querySelector('.quantidade');
      let qtd = parseInt(input.value || '1', 10);

      if (btn.dataset.action === 'menos' && qtd > 1) qtd--;
      if (btn.dataset.action === 'mais') qtd++;

      updateQuantity(id, qtd);
    });
  });

  // Alteração manual no input
  container.querySelectorAll('.quantidade').forEach(input => {
    input.addEventListener('input', e => {
      const val = parseInt(e.target.value.replace(/[^\d]/g, ''), 10);
      const id = Number(e.target.closest('.item').dataset.id);
      updateQuantity(id, val || 1);
    });
  });

  // Remover item
  container.querySelectorAll('.btn-remover').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.closest('.item').dataset.id);
      removeFromCart(id);
    });
  });
}

// --- Checkout ---
document.getElementById('btnCheckout').addEventListener('click', () => {
  const cart = getCart();
  if (cart.length === 0) return;
  window.location.href = "checkout.html";
});

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', renderCart);
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
