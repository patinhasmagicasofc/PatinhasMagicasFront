document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(document.location.search);
    const idProduto = params.get("idProduto");

    const GETBYPID_ENDPOINT = `/Produto/${idProduto}`;
    const UPDATE_ENDPOINT = `/Produto/${idProduto}`;

    const loadingContainer = document.getElementById("loading-container");
    const form = document.getElementById("formProduto");

    try {
        mostrarLoading(true);

        const produto = await consultarProduto();
        await carregarCategoria();
        console.log("Produto a ser atualizado:", produto);

        if (produto) {
            preencherProduto(produto);
            form.style.display = "block";
        }

    } finally {
        mostrarLoading(false);
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const produto = {
            nome: document.getElementById("nome").value,
            preco: parseFloat(document.getElementById("preco").value),
            //especie: document.getElementById("especie").value,
            marca: document.getElementById("marca").value,
            urlImagem: document.getElementById("urlImagem").value,
            codigo: document.getElementById("codigo").value,
            descricao: document.getElementById("descricao").value,
            descricaoDetalhada: document.getElementById("descricaoDetalhada").value,
            validade: document.getElementById("validade").value,
            categoriaId: parseInt(document.getElementById("categoria").value),
        };

        await atualizarProduto(produto);
    });

    function mostrarLoading(exibir) {
        loadingContainer.style.display = exibir ? "flex" : "none";
    }

    function preencherProduto(produto) {
        document.getElementById('nome').value = produto.nome || '';
        //document.getElementById('especie').value = produto.especie || '';
        document.getElementById('preco').value = produto.preco || '';
        document.getElementById('descricao').value = produto.descricao || '';
        document.getElementById('marca').value = produto.marca || '';
        document.getElementById('urlImagem').value = produto.urlImagem || '';
        document.getElementById('codigo').value = produto.codigo || '';
        document.getElementById('descricaoDetalhada').value = produto.descricaoDetalhada || '';
        document.getElementById('validade').value = produto.validade?.split('T')[0] || '';
        document.getElementById('categoria').value = produto.categoriaId || '';
    }

    async function consultarProduto() {
        try {
            if (!validarLogin()) return;

            const data = await consumirAPIAutenticada(GETBYPID_ENDPOINT, 'GET');
            if (!data) {
                console.error('❌ Erro ao consultar produto: resposta vazia.');
                mostrarToast("❌ Erro ao consultar produto.", "erro");
                return null;
            }

            console.log('✅ Produto consultado com sucesso:', data);
            return data;
        } catch (error) {
            console.error('❌ Erro ao consultar produto:', error);
            mostrarToast("❌ Erro ao consultar produto.", "erro");
            return null;
        }
    }

    async function atualizarProduto(produto) {
        try {
            if (!validarLogin()) return;

            mostrarLoading(true);

            console.log(produto)

            const data = await consumirAPIAutenticada(UPDATE_ENDPOINT, 'PUT', produto);
            console.log(data)

            if (!data) {
                console.error('Erro ao atualizar produto: tente novamente.');
                return;
            }

            mostrarToast("✅ Produto atualizado com sucesso!", "sucesso");
            console.log('✅ Produto atualizado com sucesso:', data);
        } catch (error) {
            console.error('❌ Erro ao atualizar produto', error);
            mostrarToast("❌ Erro ao atualizar produto.", "erro");
        } finally {
            mostrarLoading(false);
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


//função header
const menuItem = document.querySelectorAll('.item-menu');

function selectLink() {
    menuItem.forEach((item) => item.classList.remove('ativo'));
    this.classList.add('ativo');
}

menuItem.forEach((item) => item.addEventListener('click', selectLink));

const btnExpandir = document.querySelector('#btn-exp');
const nav = document.querySelector('.menu-lateral');
const header = document.querySelector('header');

// Abrir/fechar menu
btnExpandir.addEventListener('click', (e) => {
    e.stopPropagation()
    nav.classList.toggle('expandir');
    header.classList.toggle('expandir');
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('expandir')) {
        nav.classList.remove('expandir');
        header.classList.remove('expandir');
    }
});

// Máscara de preço
const precoInput = document.getElementById('preco');
precoInput.addEventListener('input', function (e) {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2) + '';
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    e.target.value = valor;
});

const costPrecoInput = document.getElementById('cost-price');
costPrecoInput.addEventListener('input', function (e) {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2) + '';
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    e.target.value = valor;
});

function mostrarToast(mensagem, tipo = "sucesso") {
    const toast = document.getElementById("toast");
    toast.textContent = mensagem;

    if (tipo === "erro") {
        toast.style.backgroundColor = "#d9534f"; // vermelho
    } else if (tipo === "aviso") {
        toast.style.backgroundColor = "#f0ad4e"; // amarelo
    } else {
        toast.style.backgroundColor = "#5cb85c"; // verde sucesso
    }

    toast.className = "toast show";
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}