let currentPage = 1;
let pageSize = 10;

document.addEventListener("DOMContentLoaded", async () => {

    if (!verificarAcesso(['administrador'])) return;

    // --- Carrega tipos dos usuarios ---
    await carregarCategoria();

    // --- Cria navegação da paginação ---
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.innerHTML = `
            <button id="btnPrev">&lt;</button>
            <span id="totalPages"></span>
            <button id="btnNext">&gt;</button>
            <select id="pageSizeSelect">
                <option value="10" selected>10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        `;
    }

    // --- Chama loadPage após os elementos existirem ---
    await loadPage(currentPage, pageSize);

    // --- Eventos de paginação ---
    document.getElementById('btnPrev')?.addEventListener('click', async () => {
        if (currentPage > 1) {
            currentPage--;
            await loadPage(currentPage, pageSize);
        }
    });

    document.getElementById('btnNext')?.addEventListener('click', async () => {
        currentPage++;
        await loadPage(currentPage, pageSize);
    });

    document.getElementById('pageSizeSelect')?.addEventListener('change', async (e) => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        await loadPage(currentPage, pageSize);
    });

    document.querySelector('.filters-item[type="button"]')?.addEventListener('click', async (e) => {
        e.preventDefault();
        currentPage = 1;
        await loadPage(currentPage, pageSize);
    });


    // --- Inicializa menus ---
    inicializarMenuLateral();
    inicializarPainelFiltros();
    inicializarMenuOptions();
});

async function loadPage(page = 1, pageSize = 10) {

    const tipoUsuario = document.getElementById('tipo-usuario')?.value || '';
    const dataInicio = document.getElementById('dataInicio')?.value || '';
    const dataFim = document.getElementById('dataFim')?.value || '';
    const nome = document.getElementById('nome')?.value || '';

    const params = new URLSearchParams();
    if (nome) params.append('nome', nome);
    if (tipoUsuario) params.append('tipoUsuario', tipoUsuario);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    params.append('page', page);
    params.append('pageSize', pageSize);

    const url = `Produto/`;
    const produtos = await consumirAPIAutenticada(url, 'GET');

    if (!produtos) {
        console.error("Sem resposta da API.");
        return;
    }

    const tabela = document.querySelector('.tbUsuarios');
    if (!tabela) return;

    if (produtos.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7">Nenhum produto encontrado.</td></tr>`;
    } else {
        renderTable(produtos);
    }

    console.log('Dados recebidos da API:', produtos);

    // --- Atualiza estatísticas ---
    // const totalPages = Math.max(1, Math.ceil((produtos.qTotalVendas || 0) / pageSize));
    // document.getElementById('totalPages').textContent = `Página ${page} de ${totalPages}`;
    // document.getElementById('btnPrev').disabled = page <= 1;
    // document.getElementById('btnNext').disabled = page >= totalPages;
}

function renderTable(produtos) {
    const tabela = document.querySelector('.tbUsuarios');
    tabela.innerHTML = '';

    produtos.forEach(produto => {
        const data = new Date(produto.validade);
        const dataFormatada = data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        console.log(produto);
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td style="display:flex;align-items:center;gap:10px;">${produto.urlImagem ? `<img src="${produto.urlImagem}" alt="${produto.urlImagem}" style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;" />` : `<div style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;"></div>`}</td>
            <td>${produto.marca}</td>
            <td>R$${produto.preco}</td>
            <td>${dataFormatada}</td>
            <td>${produto.categoriaNome}</td>
            <td><a href="/pages/admin/editar-produto.html?idProduto=${produto.id}">Ver Detalhes</a></td>
        `;
        tabela.appendChild(linha);
    });
}

async function carregarCategoria() {
    try {
        const data = await consumirAPIAutenticada('/Categoria', 'GET');
        const selectCategoria = document.getElementById('tipo-usuario');
        if (!selectCategoria || !data) return;

        console.log('Categorias carregadas:', data);

        data.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.nome;
            option.textContent = categoria.nome;
            selectCategoria.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar tipos do usuario:', error);
    }
}

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
