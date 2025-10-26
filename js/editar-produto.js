document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(document.location.search);
    const idProduto = params.get("idProduto");

    const GETBYPID_ENDPOINT = `/Produto/${idProduto}`;
    const UPDATE_ENDPOINT = `/Produto/${idProduto}`;

    const loadingContainer = document.getElementById("loading-container");
    const form = document.getElementById("formProduto");

    try {
        mostrarLoading(true);

        // Primeiro carregamos categorias e espécies
        await carregarCategoria();
        await carregarEspecies();

        // Depois buscamos o produto
        const produto = await consultarProduto();
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

        const validadeInput = document.getElementById("validade").value;
        const produto = {
            nome: document.getElementById("nome").value,
            preco: parseFloat(document.getElementById("preco").value.replace(/\./g, '').replace(',', '.')),
            especieId: parseInt(document.getElementById("especie").value),
            marca: document.getElementById("marca").value,
            urlImagem: document.getElementById("urlImagem").value,
            codigo: document.getElementById("codigo").value,
            descricao: document.getElementById("descricao").value,
            descricaoDetalhada: document.getElementById("descricaoDetalhada").value,
            validade: validadeInput ? validadeInput : null,
            categoriaId: parseInt(document.getElementById("categoria").value),
        };

        await atualizarProduto(produto);
    });

    function mostrarLoading(exibir) {
        loadingContainer.style.display = exibir ? "flex" : "none";
    }

    function preencherProduto(produto) {
        document.getElementById('nome').value = produto.nome || '';
        document.getElementById('preco').value = produto.preco || '';
        document.getElementById('descricao').value = produto.descricao || '';
        document.getElementById('marca').value = produto.marca || '';
        document.getElementById('urlImagem').value = produto.urlImagem || '';
        document.getElementById('codigo').value = produto.codigo || '';
        document.getElementById('descricaoDetalhada').value = produto.descricaoDetalhada || '';
        document.getElementById('validade').value = produto.validade?.split('T')[0] || '';

        // Categoria
        const categoriaSelect = document.getElementById('categoria');
        categoriaSelect.value = produto.categoriaId || '';

        // Espécie
        const especieSelect = document.getElementById('especie');
        especieSelect.value = produto.especieId || '';
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

            await sleep(3000);

            window.location.href = "../admin/lista-produtos.html";
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

            selectCategoria.innerHTML = ''; // limpa opções antes de adicionar
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

    async function carregarEspecies() {
        try {
            if (!validarLogin()) return;

            const data = await consumirAPIAutenticada('/Especie', 'GET');
            const selectEspecie = document.getElementById('especie');
            if (!selectEspecie || !data) return;

            console.log('Especies carregadas:', data);

            selectEspecie.innerHTML = ''; // limpa opções antes de adicionar
            data.forEach(especie => {
                const option = document.createElement('option');
                option.value = especie.id;
                option.textContent = especie.nome;
                selectEspecie.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar espécies:', error);
        }
    }
});

// --- Funções do menu lateral ---
const menuItem = document.querySelectorAll('.item-menu');

function selectLink() {
    menuItem.forEach((item) => item.classList.remove('ativo'));
    this.classList.add('ativo');
}

menuItem.forEach((item) => item.addEventListener('click', selectLink));

const btnExpandir = document.querySelector('#btn-exp');
const nav = document.querySelector('.menu-lateral');
const header = document.querySelector('header');

btnExpandir.addEventListener('click', (e) => {
    e.stopPropagation()
    nav.classList.toggle('expandir');
    header.classList.toggle('expandir');
});

document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('expandir')) {
        nav.classList.remove('expandir');
        header.classList.remove('expandir');
    }
});

// --- Máscara de preço ---
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
