document.addEventListener("DOMContentLoaded", async () => {
    if (!verificarAcesso(['administrador'])) return;

    const toBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    let valorTotalProduto = 0;

    const params = new URLSearchParams(window.location.search);
    const idPedido = params.get("idPedido");
    console.log('ID do pedido:', idPedido);

    let dados = await consultarPedido(idPedido);
    if (!dados) {
        console.error("❌ Sem resposta da API.");
        return;
    }
    console.log('Dados do pedido:', dados);

    // --- helpers para extrair IDs (tenta vários formatos possíveis)
    const extractStatusIdFromPedido = p => {
        if (!p) return null;
        if (p.statusPedidoId !== undefined) return String(p.statusPedidoId);
        if (p.statusPedido && typeof p.statusPedido === 'object' && p.statusPedido.id !== undefined) return String(p.statusPedido.id);
        if (p.statusPedido && (typeof p.statusPedido === 'number' || typeof p.statusPedido === 'string')) return String(p.statusPedido);
        return null;
    };
    const extractTipoPagamentoIdFromPedido = p => {
        if (!p) return null;
        if (p.tipoPagamentoId !== undefined) return String(p.tipoPagamentoId);
        if (p.tipoPagamento && typeof p.tipoPagamento === 'object' && p.tipoPagamento.id !== undefined) return String(p.tipoPagamento.id);
        if (p.formaPagamentoId !== undefined) return String(p.formaPagamentoId);
        if (p.formaPagamento && (typeof p.formaPagamento === 'number' || typeof p.formaPagamento === 'string')) return String(p.formaPagamento);
        if (p.tipoPagamento && (typeof p.tipoPagamento === 'number' || typeof p.tipoPagamento === 'string')) return String(p.tipoPagamento);
        return null;
    };

    // pega os ids atuais (strings)
    const pedidoStatusIdAtual = extractStatusIdFromPedido(dados);
    const pedidoTipoPagamentoIdAtual = extractTipoPagamentoIdFromPedido(dados);

    // ===================== DADOS DO PEDIDO =====================
    const tabelaPedidos = document.querySelector('.order-meta');
    if (tabelaPedidos) {
        const data = new Date(dados.dataPedido);
        const dataFormatada = data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

        // se status/forma vierem como objetos, tenta pegar o nome para exibir
        const displayFormaPagamento = (
            (typeof dados.formaPagamento === 'string' && dados.formaPagamento) ||
            (dados.tipoPagamento && dados.tipoPagamento.nome) ||
            (dados.formaPagamento && dados.formaPagamento.nome) ||
            '—'
        );

        const displayStatusPedido = (
            (typeof dados.statusPedido === 'string' && dados.statusPedido) ||
            (dados.statusPedido && dados.statusPedido.nome) ||
            '—'
        );

        tabelaPedidos.innerHTML = `
            <p><strong>ID</strong><br><span id="order-id">#${dados.id}</span></p>
            <p><strong>Data</strong><br><span id="order-date">${dataFormatada}</span></p>
            <p><strong>Pagamento</strong><br><span id="order-payment" class="small">${displayFormaPagamento}</span></p>
            <p><strong>Status</strong><br><span id="order-status" class="badge">${displayStatusPedido}</span></p>
        `;
    }

    // ===================== CLIENTE =====================
    const cardCliente = document.getElementById('info-cliente');
    if (cardCliente) {
        cardCliente.innerHTML = `
            <div class="section-title">Informações do Cliente</div>
            <p><strong id="client-name">${dados.usuarioOutputDTO?.nome ?? ""}</strong></p>
            <p class="small" id="client-email">${dados.usuarioOutputDTO?.email ?? ""}</p>
            <p class="small" id="client-phone">${dados.usuarioOutputDTO?.telefone ?? ""}</p>
        `;
    }

    // ===================== ITENS =====================
    const tbody = document.getElementById('items-body');
    if (tbody) {
        tbody.innerHTML = '';
        (dados.itemPedidoOutputDTOs || []).forEach(itemPedido => {
            const subtotal = (itemPedido.produtoOutputDTO?.preco ?? 0) * (itemPedido.quantidade ?? 0);
            valorTotalProduto += subtotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="display:flex;align-items:center;gap:10px;">
                    ${itemPedido.produtoOutputDTO?.urlImagem
                    ? `<img src="${itemPedido.produtoOutputDTO.urlImagem}" alt="${itemPedido.produtoOutputDTO.nome}" style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;" />`
                    : `<div style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;"></div>`}
                    <div>
                        <div style="font-weight:600">${itemPedido.produtoOutputDTO?.nome}</div>
                        <div class="muted" style="margin-top:6px;">SKU: ${itemPedido.produtoOutputDTO?.codigo}</div>
                    </div>
                </td>
                <td>${toBRL(itemPedido.produtoOutputDTO?.preco ?? 0)}</td>
                <td>${itemPedido.quantidade ?? 0}</td>
                <td class="right">${toBRL(subtotal)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ===================== ENDEREÇO =====================
    const delivery = document.getElementById("endereco-delivery");
    if (delivery) {
        delivery.innerHTML = `
            <h4>Endereço de Entrega</h4>
            <p id="delivery-name"><strong>Nome:</strong> ${dados.usuarioOutputDTO?.nome ?? ''}</p>
            <p id="delivery-street"><strong>Rua:</strong> ${dados.usuarioOutputDTO?.endereco?.logradouro ?? ''}</p>
            <p id="delivery-city"><strong>Cidade:</strong> ${dados.usuarioOutputDTO?.endereco?.cidade ?? ''} - ${dados.usuarioOutputDTO?.endereco?.estado ?? ''}</p>
            <p id="delivery-zip"><strong>CEP:</strong> ${dados.usuarioOutputDTO?.endereco?.cep ?? ''}</p>
            <p id="delivery-phone"><strong>Tel:</strong> ${dados.usuarioOutputDTO?.telefone ?? ''}</p>
        `;
    }

    // ===================== TOTAIS =====================
    const boxSubTotal = document.getElementById("box-subtotal");
    const boxTotal = document.getElementById("box-total");
    if (boxSubTotal) boxSubTotal.innerHTML = `<b>${toBRL(valorTotalProduto)}</b>`;
    if (boxTotal) boxTotal.innerHTML = `<b>${toBRL(valorTotalProduto)}</b>`;

    console.log('✅ Pedido carregado com sucesso:', dados);

    // ===================== BOTÕES =====================
    const btnPrint = document.getElementById('btn-print');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());

    const btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.addEventListener('click', () => history.back());

    // ===================== MODAL =====================
    const btnUpdateStatus = document.getElementById('btn-update-status');
    const modalEditar = document.getElementById('modal-editar');
    const modalSalvar = document.getElementById('modal-salvar');
    const modalCancelar = document.getElementById('modal-cancelar');

    if (btnUpdateStatus && modalEditar) {
        btnUpdateStatus.addEventListener('click', async () => {
            modalEditar.style.display = 'flex';

            const statusSelect = document.getElementById('modal-status');
            const pagamentoSelect = document.getElementById('modal-pagamento');

            // feedback inicial
            statusSelect.innerHTML = '<option>Carregando...</option>';
            pagamentoSelect.innerHTML = '<option>Carregando...</option>';

            try {
                // buscar listas do banco (assume retorno [{id, nome}, ...])
                const [statusList, pagamentoList] = await Promise.all([
                    consumirAPIAutenticada('/StatusPedido', 'GET'),
                    consumirAPIAutenticada('/TipoPagamento', 'GET')
                ]);

                // monta options com value = id (string), label = nome
                statusSelect.innerHTML = (statusList || []).map(status => {
                    const val = status.id ?? status.statusPedidoId ?? status.value ?? status.nome;
                    return `<option value="${val}" ${String(val) === String(pedidoStatusIdAtual) ? 'selected' : ''}>${status.nome ?? status.titulo ?? status.label ?? val}</option>`;
                }).join('') || '<option value="">Nenhum status</option>';

                pagamentoSelect.innerHTML = (pagamentoList || []).map(pag => {
                    const val = pag.id ?? pag.tipoPagamentoId ?? pag.value ?? pag.nome;
                    return `<option value="${val}" ${String(val) === String(pedidoTipoPagamentoIdAtual) ? 'selected' : ''}>${pag.nome ?? pag.titulo ?? pag.label ?? val}</option>`;
                }).join('') || '<option value="">Nenhuma forma</option>';

            } catch (err) {
                console.error('❌ Erro ao buscar opções do banco:', err);
                mostrarToast('❌ Erro ao carregar opções.', 'erro');
                // deixa selects vazios mas usáveis
                statusSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                pagamentoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
            }

            // preencher campos somente leitura do modal
            document.getElementById('modal-nome').value = dados.usuarioOutputDTO?.nome ?? '';
            document.getElementById('modal-rua').value = dados.usuarioOutputDTO?.endereco?.logradouro ?? '';
            document.getElementById('modal-cidade').value = dados.usuarioOutputDTO?.endereco?.cidade ?? '';
            document.getElementById('modal-estado').value = dados.usuarioOutputDTO?.endereco?.estado ?? '';
            document.getElementById('modal-cep').value = dados.usuarioOutputDTO?.endereco?.cep ?? '';
            document.getElementById('modal-telefone').value = dados.usuarioOutputDTO?.telefone ?? '';
        });
    }

    if (modalCancelar && modalEditar) {
        modalCancelar.addEventListener('click', () => modalEditar.style.display = 'none');
    }

    if (modalSalvar && modalEditar) {
        modalSalvar.addEventListener('click', async () => {
            const novoStatusId = document.getElementById('modal-status').value;
            const novoTipoPagamentoId = document.getElementById('modal-pagamento').value;

            if (!novoStatusId || !novoTipoPagamentoId) {
                mostrarToast('⚠️ Selecione status e forma de pagamento válidos.', 'aviso');
                return;
            }

            try {
                // monta payload usando IDs (numéricos se possível)
                const payload = {
                    id: dados.id,
                    statusPedidoId: Number.isNaN(Number(novoStatusId)) ? novoStatusId : parseInt(novoStatusId, 10),
                    tipoPagamentoId: Number.isNaN(Number(novoTipoPagamentoId)) ? novoTipoPagamentoId : parseInt(novoTipoPagamentoId, 10)
                };

                // envia PUT para persistir no banco
                await consumirAPIAutenticada(`/Pedido/${dados.id}`, 'PUT', payload);
                console.log(dados)

                // recarrega o pedido atualizado do backend para garantia de consistência
                dados = await consultarPedido(dados.id);
                if (!dados) {
                    mostrarToast('⚠️ Atualização realizada, mas não foi possível recarregar o pedido.', 'aviso');
                    modalEditar.style.display = 'none';
                    return;
                }

                // atualiza UI principal: pega nome do status / forma — tenta campos aninhados vindo do backend
                let displayStatus = '';
                if (dados.statusPedido && typeof dados.statusPedido === 'object') displayStatus = dados.statusPedido.nome ?? dados.statusPedido.titulo ?? '';
                if (!displayStatus && typeof dados.statusPedido === 'string') displayStatus = dados.statusPedido;
                // se backend retornou apenas ids, pegamos o texto selecionado no select atual
                if (!displayStatus) {
                    const opt = document.querySelector('#modal-status option:checked');
                    displayStatus = opt ? opt.textContent : '';
                }

                let displayPagamento = '';
                if (dados.tipoPagamento && typeof dados.tipoPagamento === 'object') displayPagamento = dados.tipoPagamento.nome ?? dados.tipoPagamento.titulo ?? '';
                if (!displayPagamento && typeof dados.formaPagamento === 'string') displayPagamento = dados.formaPagamento;
                if (!displayPagamento) {
                    const opt = document.querySelector('#modal-pagamento option:checked');
                    displayPagamento = opt ? opt.textContent : '';
                }

                const orderStatusEl = document.getElementById('order-status');
                const orderPaymentEl = document.getElementById('order-payment');
                if (orderStatusEl) orderStatusEl.textContent = displayStatus;
                if (orderPaymentEl) orderPaymentEl.textContent = displayPagamento;

                mostrarToast('✅ Pedido atualizado com sucesso!', 'sucesso');
                modalEditar.style.display = 'none';
            } catch (err) {
                console.error('❌ Erro ao salvar pedido:', err);
                mostrarToast('❌ Erro ao salvar pedido.', 'erro');
            }
        });
    }

    // --- Inicializa menus ---
    inicializarMenuLateral();
    inicializarPainelFiltros();
    inicializarMenuOptions();

});

// ===================== FUNÇÃO DE CONSULTA =====================
async function consultarPedido(idPedido) {
    try {
        const data = await consumirAPIAutenticada(`/Pedido/${idPedido}`, 'GET');
        if (!data) {
            console.error('❌ Resposta da API vazia.');
            mostrarToast("❌ Erro ao consultar pedido.", "erro");
            return null;
        }
        return data;
    } catch (error) {
        console.error('❌ Erro ao consultar pedido:', error);
        mostrarToast("❌ Erro ao consultar pedido.", "erro");
        return null;
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