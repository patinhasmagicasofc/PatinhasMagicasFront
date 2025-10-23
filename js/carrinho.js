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
  let total = 0;
  for (const item of cart) {
    const produto = produtos.find(p => p.id === item.id);
    if (!produto) continue;
    total += produto.preco * item.quantidade;
  }
  return total;
}

function renderCart() {
  const container = document.getElementById('cartContainer');
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
          <div class="empty-cart text-center my-5">
            <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" width="100" class="mb-3">
            <h5>Seu carrinho está vazio.</h5>
          </div>`;
    document.getElementById('btnCheckout').disabled = true;
    return;
  }

  document.getElementById('btnCheckout').disabled = false;

  let html = `
        <div class="table-responsive">
          <table class="table align-middle">
            <thead class="table-light">
              <tr>
                <th></th>
                <th>Produto</th>
                <th>Preço</th>
                <th>Quantidade</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>`;

  for (const item of cart) {
    const produto = produtos.find(p => p.id === item.id);
    if (!produto) continue;

    const subtotal = produto.preco * item.quantidade;
    html += `
          <tr>
            <td><img src="${produto.urlImage}" class="produto-img"></td>
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>
              <input type="number" class="form-control form-control-sm w-75"
                     value="${item.quantidade}" min="1"
                     onchange="updateQuantity(${produto.id}, this.value)">
            </td>
            <td><strong>R$ ${subtotal.toFixed(2)}</strong></td>
            <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${produto.id})">🗑</button></td>
          </tr>`;
  }

  const total = calcularTotal(cart);

  html += `
            </tbody>
          </table>
        </div>
        <div class="text-end my-3">
          <h4>Total: <span class="text-success">R$ ${total.toFixed(2)}</span></h4>
        </div>`;

  container.innerHTML = html;
}

// Checkout
document.getElementById('btnCheckout').addEventListener('click', () => {
  const cart = getCart();
  if (cart.length === 0) return;
  window.location.href = "checkout.html";
});

// Inicialização
document.addEventListener('DOMContentLoaded', renderCart);
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;



// ======== Dropdown Menu ========
const dropdowns = document.querySelectorAll('.shopping-cart-order-service .dropdown');

dropdowns.forEach(dropdown => {
  const link = dropdown.querySelector('a');

  // Só previne comportamento se não for o link do carrinho
  if (!link.classList.contains('cart-link')) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      dropdowns.forEach(item => {
        if (item !== dropdown) item.classList.remove('ativo');
      });
      dropdown.classList.toggle('ativo');
    });
  }
});

document.addEventListener('click', e => {
  if (![...dropdowns].some(dropdown => dropdown.contains(e.target))) {
    dropdowns.forEach(dropdown => dropdown.classList.remove('ativo'));
  }
});

// ======== Dropdown Perfil ========
const dropdownsPerfil = document.querySelectorAll('.dropdown-perfil');

function toggleDropdown(e) {
  e.preventDefault();
  if (this.classList.contains('ativo')) {
    this.classList.remove('ativo');
  } else {
    dropdownsPerfil.forEach(item => item.classList.remove('ativo'));
    this.classList.add('ativo');
  }
}

dropdownsPerfil.forEach(item => item.addEventListener('click', toggleDropdown));

document.addEventListener('click', (e) => {
  if (![...dropdownsPerfil].some(item => item.contains(e.target))) {
    dropdownsPerfil.forEach(item => item.classList.remove('ativo'));
  }
});
