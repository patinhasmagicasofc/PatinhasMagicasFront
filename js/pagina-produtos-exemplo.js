// CONFIG
const PAGE_SIZE = 8;
let produtosFiltrados = produtos.slice(); // `produtos` carregado de dados.js
let currentPage = 1;

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

// RENDER
function renderCategorias() {
    const select = document.getElementById('categoriaFilter');
    const categorias = [...new Set(produtos.map(p => p.categoria))].sort();
    categorias.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
}

function renderProdutos(page = 1) {
    currentPage = page;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = produtosFiltrados.slice(start, start + PAGE_SIZE);

    const container = document.getElementById('produtosContainer');
    container.innerHTML = '';

    if (pageItems.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="alert alert-info">Nenhum produto encontrado.</div></div>';
        renderPagination();
        return;
    }

    pageItems.forEach(prod => {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3';
        col.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${prod.imagem || 'https://via.placeholder.com/400x300?text=Produto'}" class="card-img-top" alt="${prod.nome}">
            <div class="card-body d-flex flex-column">
              <h6 class="card-title">${prod.nome}</h6>
              <p class="card-text small mb-1 text-muted">${prod.marca} • ${prod.categoria}</p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <strong>R$ ${prod.preco.toFixed(2)}</strong>
                  <span class="badge ${prod.estoque > 0 ? 'bg-success' : 'bg-secondary'} badge-stock">
                    ${prod.estoque > 0 ? 'Em estoque' : 'Indisponível'}
                  </span>
                </div>
                <div class="d-flex gap-2">
                  <a href="produto-detalhes.html?id=${prod.id}" class="btn btn-sm btn-outline-primary w-50">Ver</a>
                  <button ${prod.estoque === 0 ? 'disabled' : ''} class="btn btn-sm btn-primary w-50" onclick="addToCart(${prod.id}, 1)">Adicionar</button>
                </div>
              </div>
            </div>
          </div>
        `;
        container.appendChild(col);
    });

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(produtosFiltrados.length / PAGE_SIZE) || 1;
    const ul = document.getElementById('pagination');
    ul.innerHTML = '';

    // prev
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item ' + (currentPage === 1 ? 'disabled' : '');
    prevLi.innerHTML = `<a class="page-link" href="#" tabindex="-1" onclick="navigatePage(${currentPage - 1}); return false;">Anterior</a>`;
    ul.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item ' + (i === currentPage ? 'active' : '');
        li.innerHTML = `<a class="page-link" href="#" onclick="navigatePage(${i}); return false;">${i}</a>`;
        ul.appendChild(li);
    }

    // next
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item ' + (currentPage === totalPages ? 'disabled' : '');
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="navigatePage(${currentPage + 1}); return false;">Próxima</a>`;
    ul.appendChild(nextLi);
}

function navigatePage(page) {
    const totalPages = Math.ceil(produtosFiltrados.length / PAGE_SIZE) || 1;
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    renderProdutos(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FILTROS
function applyFilters() {
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const categoria = document.getElementById('categoriaFilter').value;
    produtosFiltrados = produtos.filter(p => {
        const matchesQ = q === '' || (p.nome + ' ' + p.marca + ' ' + p.descricao).toLowerCase().includes(q);
        const matchesCat = categoria === '' || p.categoria === categoria;
        return matchesQ && matchesCat;
    });
    renderProdutos(1);
}

// EVENTOS init
document.addEventListener('DOMContentLoaded', () => {
    renderCategorias();
    renderProdutos(1);
    updateCartBadge();

    document.getElementById('searchInput').addEventListener('input', () => {
        applyFilters();
    });
    document.getElementById('categoriaFilter').addEventListener('change', applyFilters);
    document.getElementById('limparFiltro').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoriaFilter').value = '';
        applyFilters();
    });
});

// Make functions accessible from inline attributes
window.addToCart = addToCart;
window.navigatePage = navigatePage;