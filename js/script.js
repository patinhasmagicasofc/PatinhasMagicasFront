// ======== REVEAL ANIMATION ========
const elements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    } else {
      entry.target.classList.remove('active');
    }
  });
}, { threshold: 0.1 });

elements.forEach(el => observer.observe(el));

// ======== TOAST ========
function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;

  switch (tipo) {
    case "erro":
      toast.style.backgroundColor = "#d9534f";
      break;
    case "aviso":
      toast.style.backgroundColor = "#f0ad4e";
      break;
    default:
      toast.style.backgroundColor = "#5cb85c";
  }

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
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
          <div class="product-actions">
          <button class="btn-details">
            <a href="/pages/public/produto-detalhes.html?idProduto=${produto.id}">Ver detalhes</a>
          </button>
          <button class="btn-add" data-id="${produto.id}">Adicionar</button>
        </div>
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

// ======== EVENTOS DE ADIÇÃO AO CARRINHO ========
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-add')) {
      const id = e.target.getAttribute('data-id');
      const produto = produtos.find(p => p.id == Number(id));
      if (produto) addToCart(produto);
    }
  });

// ======== FUNÇÕES DO CARRINHO ========
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const item = cart.find(p => p.id === product.id);

  if (item) {
    item.quantidade += 1; 
  } else {
    const newProduct = { ...product, quantidade: 1 }; // cópia para não mutar o original
    cart.push(newProduct);
  }

  setCart(cart);
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantidade || 1), 0);
  const badge = document.getElementById('cart-count');

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline' : 'none';
  }
}
