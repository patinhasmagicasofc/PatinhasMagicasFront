document.addEventListener("DOMContentLoaded", async () => {

    const toBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    let valorTotalProduto = 0;

    const params = new URLSearchParams(window.location.search);
    const idPedido = params.get("idPedido");

    console.log('ID do pedido:', idPedido);

    const dados = await consultarPedido(idPedido);
    if (!dados) {
        console.error("❌ Sem resposta da API.");
        return;
    }

    // ===================== DADOS DO PEDIDO =====================
    const tabelaPedidos = document.querySelector('.order-meta');
    if (tabelaPedidos) {
        tabelaPedidos.innerHTML = `
            <p><strong>ID</strong><br><span id="order-id">#${dados.id}</span></p>
            <p><strong>Data</strong><br><span id="order-date">${dados.dataPedido}</span></p>
            <p><strong>Pagamento</strong><br><span id="order-payment" class="small">${dados.formaPagamento ?? 'Pix'}</span></p>
            <p><strong>Status</strong><br><span id="order-status" class="badge">${dados.statusPedido}</span></p>
        `;
    }

    // ===================== CLIENTE =====================
    const cardCliente = document.getElementById('info-cliente');
    if (cardCliente) {
        cardCliente.innerHTML = `
            <div class="section-title">Informações do Cliente</div>
            <p><strong id="client-name">${dados.usuarioOutputDTO.nome ?? ""}</strong></p>
            <p class="small" id="client-email">${dados.usuarioOutputDTO.email ?? ""}</p>
            <p class="small" id="client-phone">${dados.usuarioOutputDTO.telefone ?? ""}</p>
        `;
    }

    // ===================== ITENS =====================
    const tbody = document.getElementById('items-body');
    if (tbody) {
        tbody.innerHTML = '';
        (dados.itemPedidoOutputDTOs || []).forEach(itemPedido => {
            const subtotal = (itemPedido.produtoOutputDTO.preco ?? 0) * (itemPedido.quantidade ?? 0);
            valorTotalProduto += subtotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="display:flex;align-items:center;gap:10px;">
                    ${itemPedido.produtoOutputDTO.foto
                ? `<img src="${itemPedido.produtoOutputDTO.foto}" alt="${itemPedido.produtoOutputDTO.nome}" style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;" />`
                : `<div style="width:56px;height:56px;border-radius:8px;background:#f3f4f6;display:inline-block;"></div>`}
                    <div>
                        <div style="font-weight:600">${itemPedido.produtoOutputDTO.nome}</div>
                        <div class="muted" style="margin-top:6px;">SKU: ${itemPedido.produtoOutputDTO.codigo}</div>
                    </div>
                </td>
                <td>${toBRL(itemPedido.produtoOutputDTO.preco)}</td>
                <td>${itemPedido.quantidade}</td>
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
            <p id="delivery-name"><strong>Nome:</strong> ${dados.usuarioOutputDTO.nome}</p>
            <p id="delivery-street"><strong>Rua:</strong> ${dados.usuarioOutputDTO.enderecoOutputDTO.logradouro}</p>
            <p id="delivery-city"><strong>Cidade:</strong> ${dados.usuarioOutputDTO.enderecoOutputDTO.cidade} - ${dados.usuarioOutputDTO.enderecoOutputDTO.estado}</p>
            <p id="delivery-zip"><strong>CEP:</strong> ${dados.usuarioOutputDTO.enderecoOutputDTO.cep}</p>
            <p id="delivery-phone"><strong>Tel:</strong> ${dados.usuarioOutputDTO.telefone}</p>
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
        btnUpdateStatus.addEventListener('click', () => {
            modalEditar.style.display = 'flex';
            // Preencher campos do modal
            document.getElementById('modal-status').value = dados.statusPedido ?? '';
            document.getElementById('modal-pagamento').value = dados.formaPagamento ?? 'Pix';
            document.getElementById('modal-nome').value = dados.usuarioOutputDTO.nome ?? '';
            document.getElementById('modal-rua').value = dados.usuarioOutputDTO.enderecoOutputDTO.logradouro ?? '';
            document.getElementById('modal-cidade').value = dados.usuarioOutputDTO.enderecoOutputDTO.cidade ?? '';
            document.getElementById('modal-estado').value = dados.usuarioOutputDTO.enderecoOutputDTO.estado ?? '';
            document.getElementById('modal-cep').value = dados.usuarioOutputDTO.enderecoOutputDTO.cep ?? '';
            document.getElementById('modal-telefone').value = dados.usuarioOutputDTO.telefone ?? '';
        });
    }

    if (modalCancelar && modalEditar) {
        modalCancelar.addEventListener('click', () => modalEditar.style.display = 'none');
    }

    if (modalSalvar && modalEditar) {
        modalSalvar.addEventListener('click', async () => {
            const novoStatus = document.getElementById('modal-status').value;
            const novoPagamento = document.getElementById('modal-pagamento').value;

            // Atualiza visualmente
            const orderStatus = document.getElementById('order-status');
            const orderPayment = document.getElementById('order-payment');
            if (orderStatus) orderStatus.textContent = novoStatus;
            if (orderPayment) orderPayment.textContent = novoPagamento;

            // Chamar API para salvar
            try {
                const payload = {
                    id: dados.id,
                    statusPedido: novoStatus,
                    formaPagamento: novoPagamento
                };
                await consumirAPIAutenticada(`/Pedido/${dados.id}`, 'PUT', payload);
                mostrarToast('✅ Pedido atualizado com sucesso', 'sucesso');
            } catch (err) {
                console.error(err);
                mostrarToast('❌ Erro ao salvar pedido', 'erro');
            }

            modalEditar.style.display = 'none';
        });
    }

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
