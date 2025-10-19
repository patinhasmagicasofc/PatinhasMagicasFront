document.addEventListener("DOMContentLoaded", async () => {
  // Verificação de acesso (opcional)
  // if (!verificarAcesso('administrador')) {
  //   window.location.href = 'login.html';
  //   return;
  // }

  const secctionProdutos = document.getElementById("secctionProdutos");
  const productCarousel = document.getElementById("product-carousel");

  await carregarCategorias();
  const produtos = await carregarProdutos();

  preencherProduto(produtos);

  // -------- Funções --------

  async function carregarCategorias() {
    try {
      if (!validarLogin()) return;

      const data = await consumirAPIAutenticada('/Categoria', 'GET');
      const selectCategoria = document.getElementById('categoria');
      if (!selectCategoria || !data) return;

      console.log('Categorias carregadas:', data);

      data.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        selectCategoria.appendChild(option);
      });
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  async function carregarProdutos() {
    try {
      if (!validarLogin()) return;

      const data = await consumirAPIAutenticada('/Produto', 'GET');
      console.log('Produtos carregados:', data);

      return data;
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      return [];
    }
  }

  function preencherProduto(produtos) {
    if (!secctionProdutos || !produtos?.length) return;

    secctionProdutos.innerHTML = "";

    productCarousel.innerHTML = "";

    produtos.forEach(produto => {
      secctionProdutos.innerHTML += `
        <div class="highlight-section-one">
          <div class="product-info">
            <p class="product-name">${produto.nome}</p>
          </div>

          <div class="main-image-product">
            <img src="${produto.urlImagem}" alt="${produto.nome}" />
          </div>

          <div class="product-price-stock">
            <div class="category">
              <ul>
                <li>
                  <p class="product-category">${produto.categoriaNome}</p>
                </li>
              </ul>
            </div>
            <div class="price-stock">
              <ul>
                <li>
                  <span class="price">R$${produto.preco.toFixed(2)}</span>
                </li>
                <li>
                  <span class="stock in-stock">Em estoque</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="product-actions">
            <button class="btn-details" data-id="${produto.id}"><a class="btn-details" href="produto-detalhes.html?idProduto=${produto.id}">Ver detalhes</a></button>
            <button class="btn-add" data-id="${produto.id} onclick="addToCart(${produto.id}, 1)">Adicionar</button>
          </div>
        </div>
      `;

      productCarousel.innerHTML += `
        <div class="product-card">
          <img src="${produto.urlImagem}" alt="" />
        </div>
      `;
    });
  }
});


// UTIL: cart in localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(id, quantidade = 1) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) item.quantidade += quantidade;
  else cart.push({ id, quantidade });
  setCart(cart);
  // feedback
  const produto = produtos.find(p => p.id === id);
  const nome = produto ? produto.nome : 'item';
  const toast = new bootstrap.Toast(document.getElementById('addToast'));
  document.getElementById('toastBody').textContent = `${quantidade}x ${nome} adicionado(s) ao carrinho.`;
  toast.show();
}
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.quantidade, 0);
  document.getElementById('cartCountBadge').textContent = total;
}

// Make functions accessible from inline attributes
window.addToCart = addToCart;
window.navigatePage = navigatePage;









const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const carousel = document.querySelector('.product-carousel');

const scrollAmount = 250; // quanto cada clique vai deslizar

nextBtn.addEventListener('click', () => {
  carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

prevBtn.addEventListener('click', () => {
  carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});

