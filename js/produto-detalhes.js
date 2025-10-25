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
    //showToast(`Adicionado ${quantidade}x "${produtos.find(p => p.id === id).nome}" ao carrinho.`);
}
function updateCartBadge() {
    const cart = getCart();
    const total = cart.reduce((s, i) => s + i.quantidade, 0);
    //document.getElementById('cartCountBadge').textContent = total;
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
    <div class="detail-container">
        <div class="img-product">
          <img src="${produto.urlImagem || 'https://placehold.co/400x300?text=Produto'}" alt="${produto.nome}">
        </div>


        <div class="container-product-detail">
        
          <div class="product-name">
            <ul>
              <li>
                <p>
                  ${produto.nome}
                </p>
              </li>
            </ul>
          </div>
          <div class="product-brand">
            <ul>
              <li>
                <p>${produto.marca} • ${produto.categoriaNome}</p>
              </li>
            </ul>
          </div>
          <div class="product-description">
            <ul>
              <li>
                <p class="descricao">${produto.descricaoDetalhada || produto.descricao}</p>
              </li>
            </ul>
          </div>
          <div class="product-code">
            <ul>
              <li>
                <p><strong>Código:</strong> ${produto.codigo}</p>
              </li>
            </ul>
          </div>
          <div class="product-price">
            <ul>
              <li>
                <p>R$ ${produto.preco.toFixed(2)}</p>
              </li>
            </ul>
          </div>


        </div>
        </div>
        <div class="cart-add">
          <div class="amount">
            <div class="amount-add">
              <label for="quantidade">
                Quantidade:
              </label>
              <ul>
                <li>
                  <button class="btn-quantidade men">-</button>
                  <input class="quantidade" type="text" pattern="[0-9]*" role="spinbutton" aria-valuenow="1" value="1">
                  <button class="btn-quantidade mas">+</button>
                </li>
              </ul>

            </div>
            <input id="quantidade" type="number" min="1" value="1">
            <button ${produto.estoque === 0 ? 'disabled' : ''} class="btn btn-primary"
              onclick="adicionar(${produto.id})">Adicionar ao carrinho</button>
          </div>
        </div>
      `;
}

function adicionar(id) {
    const q = parseInt(document.getElementById('quantidade').value);
    if (!q || q <= 0) return;
    addToCart(id, q);
}

window.adicionar = adicionar;