const botoesAdd = document.querySelectorAll(".btn-add");
const listaCarrinho = document.getElementById("lista-carrinho");
const totalEl = document.getElementById("total");
const btnLimpar = document.getElementById("limpar-carrinho");

// Carrega carrinho do localStorage
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
atualizarCarrinho();

// Adicionar produto ao carrinho
botoesAdd.forEach(botao => {
  botao.addEventListener("click", () => {
    const produtoEl = botao.parentElement;
    const id = produtoEl.dataset.id;
    const nome = produtoEl.dataset.nome;
    const preco = parseFloat(produtoEl.dataset.preco);

    const item = carrinho.find(p => p.id === id);
    if (item) {
      item.qtd += 1;
    } else {
      carrinho.push({ id, nome, preco, qtd: 1 });
    }

    salvarCarrinho();
    atualizarCarrinho();
  });
});

// Atualiza interface do carrinho
function atualizarCarrinho() {
  listaCarrinho.innerHTML = "";
  let total = 0;

  carrinho.forEach(item => {
    const li = document.createElement("li");
    li.classList.add("item-carrinho");
    li.innerHTML = `
      <span>${item.nome}</span>
      <div class="acoes">
        <button class="menos">−</button>
        <span>${item.qtd}</span>
        <button class="mais">+</button>
        <span>R$ ${(item.preco * item.qtd).toFixed(2)}</span>
        <button class="remover">🗑️</button>
      </div>
    `;

    // Eventos dos botões
    li.querySelector(".mais").onclick = () => alterarQuantidade(item.id, +1);
    li.querySelector(".menos").onclick = () => alterarQuantidade(item.id, -1);
    li.querySelector(".remover").onclick = () => removerItem(item.id);

    listaCarrinho.appendChild(li);
    total += item.preco * item.qtd;
  });

  totalEl.textContent = total.toFixed(2);
}

// Altera quantidade
function alterarQuantidade(id, delta) {
  const item = carrinho.find(p => p.id === id);
  if (!item) return;

  item.qtd += delta;
  if (item.qtd <= 0) {
    carrinho = carrinho.filter(p => p.id !== id);
  }

  salvarCarrinho();
  atualizarCarrinho();
}

// Remove item
function removerItem(id) {
  carrinho = carrinho.filter(p => p.id !== id);
  salvarCarrinho();
  atualizarCarrinho();
}

// Limpa carrinho
btnLimpar.addEventListener("click", () => {
  carrinho = [];
  salvarCarrinho();
  atualizarCarrinho();
});

// Salva no localStorage
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}
