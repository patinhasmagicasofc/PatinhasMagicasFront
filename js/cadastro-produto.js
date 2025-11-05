document.addEventListener("DOMContentLoaded", async () => {
    if (!verificarAcesso(['administrador'])) return;

    const ADD_ENDPOINT = '/Produto';
    const form = document.getElementById("formProduto");

    await carregarCategoria();
    await carregarEspecies();

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const validadeInput = document.getElementById("validade").value;
        const produto = {
            nome: document.getElementById("nome").value,
            preco: parseFloat(document.getElementById("preco").value.replace(/\./g, '').replace(',', '.')),
            especieId: parseInt(document.getElementById("especie").value),
            marca: document.getElementById("marca").value,
            urlImagem: document.getElementById("urlImagem").value || "https://placehold.co/400x300?text=Produto",
            codigo: document.getElementById("codigo").value,
            descricao: document.getElementById("descricao").value,
            descricaoDetalhada: document.getElementById("descricaoDetalhada").value,
            validade: validadeInput ? new Date(validadeInput).toISOString() : null,
            categoriaId: parseInt(document.getElementById("categoria").value),
        };

        const categoriaValue = document.getElementById("categoria").value;
        const especieValue = document.getElementById("especie").value;

        if (!categoriaValue) {
            mostrarToast("⚠️ Por favor, selecione uma categoria válida!", "aviso");
            return;
        }
        if (!categoriaValue) {
            mostrarToast("⚠️ Por favor, selecione uma categoria válida", "aviso");
            return;
        }

        if (!especieValue) {
            mostrarToast("Por favor, selecione uma espécie válida", "aviso");
            return;
        }


        console.log("Produto a ser cadastrado:", produto);
        await cadastrarProduto(produto);
    });

    // --- Inicializa menus ---
    inicializarMenuLateral();
    inicializarPainelFiltros();
    inicializarMenuOptions();

    async function cadastrarProduto(produto) {
        try {
            const data = await consumirAPIAutenticada(ADD_ENDPOINT, 'POST', produto);

            if (!data) {
                console.error('Erro ao cadastrar produto: tente novamente.');
                console.error('❌ Erro ao cadastrar produto', error);
                return;
            }

            mostrarToast("✅ Produto cadastrado com sucesso!", "sucesso");

            console.log('✅ Produto cadastrado com sucesso:', data);
        } catch (error) {
            console.error('❌ Erro ao cadastrar produto', error);
            mostrarToast("❌ Erro ao cadastrar produto.", "erro");
        }
    }

    async function carregarCategoria() {
        try {

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

    async function carregarEspecies() {
        try {
            const data = await consumirAPIAutenticada('/Especie', 'GET');
            const selectEspecie = document.getElementById('especie');
            if (!selectEspecie || !data) return;

            console.log('Especies carregadas:', data);

            data.forEach(especie => {
                const option = document.createElement('option');
                option.value = especie.id;
                option.textContent = especie.nome;
                selectEspecie.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar tipos do usuario:', error);
        }
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

// --- Inicialização dos menus ---
function inicializarMenuLateral() {
    const menuItems = document.querySelectorAll('.item-menu');
    const btnExpandir = document.getElementById('btn-exp');
    const nav = document.querySelector('.menu-lateral');
    const header = document.querySelector('header');

    menuItems.forEach(item => item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('ativo'));
        item.classList.add('ativo');
    }));

    btnExpandir?.addEventListener('click', e => {
        e.stopPropagation();
        nav?.classList.toggle('expandir');
        header?.classList.toggle('expandir');
    });

    document.addEventListener('click', e => {
        if (!nav?.contains(e.target) && nav?.classList.contains('expandir')) {
            nav.classList.remove('expandir');
            header?.classList.remove('expandir');
        }
    });
}

function inicializarPainelFiltros() {
    const btnFilters = document.getElementById('btn-filters-expandir');
    const sidebar = document.querySelector('.filters-exp');
    const main = document.querySelector('main');

    btnFilters?.addEventListener('click', e => {
        e.stopPropagation();
        sidebar?.classList.toggle('open');
        main?.classList.toggle('shifted');
    });

    document.addEventListener('click', e => {
        if (!sidebar?.contains(e.target) && !btnFilters?.contains(e.target)) {
            sidebar?.classList.remove('open');
            main?.classList.remove('shifted');
        }
    });
}

function inicializarMenuOptions() {
    document.addEventListener("click", e => {
        document.querySelectorAll(".menu-container").forEach(menu => {
            if (!menu.contains(e.target)) menu.classList.remove("open");
        });

        const btn = e.target.closest(".menu-container");
        if (e.target.closest(".menu-btn") && btn) {
            btn.classList.toggle("open");
        }
    });
}