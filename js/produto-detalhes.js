document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(document.location.search);
  const idProduto = params.get("idProduto");

  updateCartBadge();

  try {
    mostrarLoading(true);

    const produto = await consultarProduto();
    await carregarCategoria();

    if (produto) carregarProduto(produto);
  } finally {
    mostrarLoading(false);
  }

  // ------------------- LOADING -------------------
  function mostrarLoading(exibir) {
    const loadingContainer = document.getElementById("loading-container");
    if (loadingContainer) loadingContainer.style.display = exibir ? "flex" : "none";
  }

  // ------------------- CONSULTAR PRODUTO -------------------
  async function consultarProduto() {
    try {
      const data = await consumirAPIAutenticada(`/Produto/${idProduto}`, "GET");
      console.log("✅ Produto consultado:", data);
      return data || null;
    } catch (error) {
      console.error("❌ Erro ao consultar produto:", error);
      return null;
    }
  }

  // ------------------- CARREGAR CATEGORIAS -------------------
  async function carregarCategoria() {
    try {
      const data = await consumirAPIAutenticada("/Categoria", "GET");
      const selectCategoria = document.getElementById("categoriaLogado");
      if (!selectCategoria || !data) return;

      data.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria.id;
        option.textContent = categoria.nome;
        selectCategoria.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }
});

// ------------------- CARRINHO -------------------
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, quantidade = 1) {
  const cart = getCart();
  const item = cart.find(p => p.id === product.id);

  if (item) {
    item.quantidade += quantidade;
  } else {
    const prodCopy = { ...product, quantidade }; // salva objeto completo
    cart.push(prodCopy);
  }

  setCart(cart);
  showToast(`✅ Adicionado ${quantidade}x ao carrinho.`);
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantidade || 1), 0);
  const badge = document.getElementById("cart-count");

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline" : "none";
  }
}

// ------------------- TOAST -------------------
function showToast(msg) {
  const toastBody = document.getElementById("toastBody");
  if (!toastBody) return;
  toastBody.textContent = msg;
  const toastEl = document.getElementById("addToast");
  if (!toastEl) return;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// ------------------- EXIBIR PRODUTO -------------------
function carregarProduto(produto) {
  const container = document.getElementById("produtoContainer");
  if (!produto) {
    container.innerHTML = `<div class="alert alert-danger">Produto não encontrado.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-container">
      <div class="img-product">
        <img src="${produto.urlImagem || 'https://placehold.co/400x300?text=Produto'}" alt="${produto.nome}">
      </div>

      <div class="container-product-detail">
        <nav class="breadcrumb">
          <a href="/index.html"><i class="material-icons">home</i></a>
          <span>›</span>
          <a href="pagina-venda.html">Cátalogo</a>
          <span>›</span>
          <a href="produto-detalhes.html?idProduto=${produto.id}">${produto.marca.split(" ").slice(0, 2).join(" ")}</a>
        </nav>
        <div class="product-name"><p>${produto.nome}</p></div>
        <div class="product-brand"><p>${produto.marca} • ${produto.categoriaNome}</p></div>
        <div class="product-description"><p class="descricao">${produto.descricaoDetalhada || produto.descricao}</p></div>
        <div class="product-code"><p><strong>Código:</strong> ${produto.codigo}</p></div>
        <div class="product-price"><p>R$ ${produto.preco.toFixed(2)}</p></div>
      </div>
    </div>

    <div class="cart-add">
  <div class="amount">
    <i class="material-icons position-relative">add_shopping_cart <span>Comprar</span></i>
    <div class="amount-add">
      <label for="quantidade">Quantidade</label>
      <ul>
        <li>
          <button id="btnMenos" class="btn-quantidade men">-</button>
          <input id="quantidade" type="text" pattern="[0-9]*" min="1" value="1">
          <button id="btnMais" class="btn-quantidade mas">+</button>
        </li>
      </ul>
    </div>
    <div class="btn-final">
      <button ${produto.estoque === 0 ? "disabled" : ""} id="btnAddCart">Adicionar ao carrinho</button>
    </div>
    <div class="informations">
      <ul>
        <li>
          <span>● Altere ou cancele, sem taxas.</span>
          <p>Descontos não cumulativos. O maior desconto elegível será aplicado no carrinho.</p>
        </li>
      </ul>
    </div>
  </div>
</div>

  `;

  const inputQuantidade = document.getElementById("quantidade");
  document.getElementById("btnMais").addEventListener("click", () => {
    let valor = parseInt(inputQuantidade.value) || 1;
    inputQuantidade.value = valor + 1;
  });

  document.getElementById("btnMenos").addEventListener("click", () => {
    let valor = parseInt(inputQuantidade.value) || 1;
    if (valor > 1) inputQuantidade.value = valor - 1;
  });

  document.getElementById("btnAddCart").addEventListener("click", () => {
    const quantidade = parseInt(inputQuantidade.value) || 1;
    addToCart(produto, quantidade);
  });
}



// ======== PRODUTOS ========
let produtos = []; // declarado fora para ser acessível globalmente

document.addEventListener("DOMContentLoaded", async () => {
  const secctionProdutos = document.getElementById("secctionProdutos");
  const productCarousel = document.getElementById("product-carousel");

  produtos = await carregarProdutos();
  preencherProduto(produtos);

  async function carregarProdutos() {
    try {
      //if (!validarLogin()) return [];
      return await consumirAPIAutenticada('/Produto', 'GET');
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      mostrarToast("Erro ao carregar produtos", "erro");
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
              <li><p class="product-category">${produto.categoriaNome}</p></li>
            </ul>
          </div>
          <div class="price-stock">
            <ul>
              <li><span class="price">R$${produto.preco.toFixed(2)}</span></li>
              <li><span class="stock in-stock">Em estoque</span></li>
            </ul>
          </div>
        </div>

        <div class="product-actions">
          <button class="btn-details">
            <a href="/pages/public/produto-detalhes.html?idProduto=${produto.id}">Ver detalhes</a>
          </button>
          <button class="btn-add" data-id="${produto.id}">Adicionar</button>
        </div>
      </div>
      `;

      productCarousel.innerHTML += `
      <div class="product-card">
        <a href="produto-detalhes.html?idProduto=${produto.id}">
          <img src="${produto.urlImagem}" alt="${produto.nome}" />
          <span>${produto.nome.split(" ").slice(0, 2).join(" ")}</span>
        </a>
      </div>
      `;
    });
  }
});


// ======== CARROSSEL ========
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const carousel = document.querySelector('.product-carousel');
const scrollAmount = 250;

if (nextBtn && carousel) {
  nextBtn.addEventListener('click', () => carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
}

if (prevBtn && carousel) {
  prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
}

// Movimento por arrastar
if (carousel) {
  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('active');
    startX = e.clientX;
    scrollLeft = carousel.scrollLeft;
    e.preventDefault();
  });

  carousel.addEventListener('mouseup', () => { isDown = false; carousel.classList.remove('active'); });
  carousel.addEventListener('mouseleave', () => { isDown = false; carousel.classList.remove('active'); });
  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const walk = e.clientX - startX;
    carousel.scrollLeft = scrollLeft - walk;
  });
}



window.adicionar = addToCart;
