document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(document.location.search);
    const idProduto = params.get("idProduto");

    console.log(idProduto)

    const GETBYPID_ENDPOINT = `/Produto/${idProduto}`;

    const loadingContainer = document.getElementById("loading-container");

    updateCartBadge();

    try {
        mostrarLoading(true);

        const produto = await consultarProduto();
        await carregarCategoria();
        console.log("Produto a ser atualizado:", produto);

        if (produto) {
            carregarProduto(produto);

            // form.style.display = "block";
        }

    } finally {
        mostrarLoading(false);
    }

    function mostrarLoading(exibir) {
        // loadingContainer.style.display = exibir ? "flex" : "none";
    }

    async function consultarProduto() {
        try {
            if (!validarLogin()) return;

            const data = await consumirAPIAutenticada(GETBYPID_ENDPOINT, 'GET');
            if (!data) {
                console.error('❌ Erro ao consultar produto: resposta vazia.');
                // mostrarToast("❌ Erro ao consultar produto.", "erro");
                return null;
            }

            console.log('✅ Produto consultado com sucesso:', data);
            return data;
        } catch (error) {
            console.error('❌ Erro ao consultar produto:', error);
            // mostrarToast("❌ Erro ao consultar produto.", "erro");
            return null;
        }
    }

    async function carregarCategoria() {
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
            console.error('Erro ao carregar tipos do usuario:', error);
        }
    }
});


// FUNÇÕES DE CARRINHO
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}
function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}
function addToCart(id, quantidade) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) item.quantidade += quantidade;
    else cart.push({ id, quantidade });
    setCart(cart);
    showToast(`Adicionado ${quantidade}x "${produtos.find(p => p.id === id).nome}" ao carrinho.`);
}
function updateCartBadge() {
    const cart = getCart();
    const total = cart.reduce((s, i) => s + i.quantidade, 0);
    document.getElementById('cartCountBadge').textContent = total;
}

// TOAST
function showToast(msg) {
    const toastBody = document.getElementById('toastBody');
    toastBody.textContent = msg;
    const toast = new bootstrap.Toast(document.getElementById('addToast'));
    toast.show();
}

// EXIBIR PRODUTO
function carregarProduto(produto) {

    const container = document.getElementById('produtoContainer');

    if (!produto) {
        container.innerHTML = `<div class="col-12"><div class="alert alert-danger">Produto não encontrado.</div></div>`;
        return;
    }

    container.innerHTML = `
        <div class="col-md-5 text-center">
          <img src="${produto.urlImagem || 'https://placehold.co/400x300?text=Produto'}"
               alt="${produto.nome}" class="produto-img img-fluid shadow-sm">
        </div>
        <div class="col-md-7">
          <h2>${produto.nome}</h2>
          <p class="text-muted">${produto.marca} • ${produto.categoriaNome}</p>
          <h4 class="text-success mb-3">R$ ${produto.preco.toFixed(2)}</h4>
          <p class="descricao">${produto.descricaoDetalhada || produto.descricao}</p>

          <div class="d-flex align-items-center mb-3">
            <label for="quantidade" class="me-2">Quantidade:</label>
            <input id="quantidade" type="number" min="1" value="1" class="form-control w-auto me-3">
            <button ${produto.estoque === 0 ? 'disabled' : ''} 
                    class="btn btn-primary" 
                    onclick="adicionar(${produto.id})">Adicionar ao carrinho</button>
          </div>

          <p><strong>Código:</strong> ${produto.codigo}</p>
          <p><strong>Validade:</strong> ${produto.validade}</p>
          <a href="index.html" class="btn btn-outline-secondary mt-3">← Voltar ao catálogo</a>
        </div>
      `;
}

function adicionar(id) {
    const q = parseInt(document.getElementById('quantidade').value);
    if (!q || q <= 0) return;
    addToCart(id, q);
}

window.adicionar = adicionar;