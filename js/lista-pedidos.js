let currentPage = 1;
let pageSize = 10;

document.addEventListener("DOMContentLoaded", async () => {

    if (!verificarAcesso(['administrador'])) return;

    const loadingContainer = document.getElementById("loading-container");
    try {
        mostrarLoading(true);
        await carregarStatusPedidos();
        // Depois buscamos o produto

    } finally {
        mostrarLoading(false);
    }

    function mostrarLoading(exibir) {
        loadingContainer.style.display = exibir ? "flex" : "none";
    }
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

    const status = document.getElementById('status-pedidos')?.value || '';
    const dataInicio = document.getElementById('dataInicio')?.value || '';
    const dataFim = document.getElementById('dataFim')?.value || '';
    const nome = document.getElementById('nome')?.value || '';

    const params = new URLSearchParams();
    if (nome) params.append('nome', nome);
    if (status) params.append('status', status);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    params.append('page', page);
    params.append('pageSize', pageSize);

    const url = `Pedido/paged?${params.toString()}`;
    const data = await consumirAPIAutenticada(url, 'GET');

    if (!data) {
        console.error("Sem resposta da API.");
        return;
    }

    const pedidos = data.pedidoOutputDTO || data.pedidos || [];
    console.log('Pedidos recebidos:', pedidos);
    const tabela = document.querySelector('.tbPedidos');
    if (!tabela) return;

    if (pedidos.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7">Nenhum pedido encontrado.</td></tr>`;
    } else {
        renderTable(pedidos);
    }

    console.log('Dados recebidos da API:', data);

    // --- Atualiza estatísticas ---
    const totalPages = Math.max(1, Math.ceil((data.qTotalVendas || 0) / pageSize));
    document.getElementById('totalPages').textContent = `Página ${page} de ${totalPages}`;

    document.getElementById('totalVendas').innerHTML = `<p>Total de pedidos</p><strong>${data.qTotalVendas || 0}</strong>`;
    document.getElementById('valorTotalVendas').innerHTML = `<p>Total de vendas</p><strong>R$${data.valorTotalVendas || 0}</strong>`;
    document.getElementById('pedidosPendentes').innerHTML = `<p>Pedidos pendentes</p><strong>${data.qPedidosPendente || 0}</strong>`;
    document.getElementById('pedidosCancelados').innerHTML = `<p>Pedidos cancelados</p><strong>${data.qPedidosCancelado || 0}</strong>`;

    document.getElementById('btnPrev').disabled = page <= 1;
    document.getElementById('btnNext').disabled = page >= totalPages;
}

function renderTable(pedidos) {
    const tabela = document.querySelector('.tbPedidos');
    tabela.innerHTML = '';

    pedidos.forEach(pedido => {
        const data = new Date(pedido.dataPedido);
        const dataFormatada = data.toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: false
        });

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${pedido.id}</td>
            <td><div class="email">${pedido.nomeUsuario}</div></td>
            <td>${dataFormatada}</td>
            <td>R$${pedido.valorPedido}</td>
            <td>${pedido.formaPagamento}</td>
            <td><span class="status ${pedido.statusPedido.toLowerCase()}">${pedido.statusPedido}</span></td>
             <td class="actions">
                <div class="menu-container">
                  <button class="menu-btn" title="Mais opções">
                    <span class="material-icons">more_vert</span>
                  </button>

                  <div class="menu-options">
                    <button class="view-btn" title="Ver">
                      <a href="/pedido-detalhes.html?idPedido=${pedido.id}" title="Ver">
                        <span class="material-icons">visibility</span>
                        <span> Detalhes</span>
                      </a>
                    </button>
                    <button title="Editar"><span class="material-icons">edit</span> Editar</button>
                  </div>
                </div>
              </td>
        `;
        tabela.appendChild(linha);
    });
}

async function carregarStatusPedidos() {
    try {
        const data = await consumirAPIAutenticada('/StatusPedido', 'GET');
        const selectStatus = document.getElementById('status-pedidos');
        if (!selectStatus || !data) return;

        data.forEach(status => {
            const option = document.createElement('option');
            option.value = status.nome;
            option.textContent = status.nome;
            selectStatus.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar status dos pedidos:', error);
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
