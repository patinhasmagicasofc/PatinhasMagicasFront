document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById('btn-print')?.addEventListener('click', () => window.print());

    const params = new URLSearchParams(document.location.search);
    const idPedido = params.get("idPedido");

    console.log(idPedido)

    const toBRL = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    let valorTotalProduto = 0;

    const dados = await consultarPedido(idPedido);

    console.log(dados)

    if (!dados) {
        console.error("❌ Sem resposta da API.");
        return;
    }

    // ===================== DADOS DO PEDIDO =====================
    const tabelaPedidos = $('.order-meta');
    tabelaPedidos.empty();

    const linha = `
        <p><strong>ID</strong><br><span id="order-id">#${dados.id}</span></p>
        <p><strong>Data</strong><br><span id="order-date">${dados.dataPedido}</span></p>
        <p><strong>Pagamento</strong><br><span id="order-payment" class="small">Pix</span></p>
        <p><strong>Status</strong><br><span id="order-status" class="badge ${dados.statusPagamento}">${dados.statusPagamento}</span></p>
    `;
    tabelaPedidos.append(linha);

    // ===================== CLIENTE =====================
    const cardCliente = $('#info-cliente');
    cardCliente.empty();

    const card = `
        <div class="section-title">Informações do Cliente</div>
        <p><strong id="client-name">${dados.usuarioOutputDTO.nome ?? ""}</strong></p>
        <p class="small" id="client-email">${dados.usuarioOutputDTO.email ?? ""}</p>
        <p class="small" id="client-phone">${dados.usuarioOutputDTO.telefone ?? ""}</p>
    `;
    cardCliente.append(card);

    // ===================== ITENS =====================
    const tbody = $('#items-body');
    tbody.empty();

    dados.itemPedidoOutputDTOs.forEach(itemPedido => {
        const subtotal = itemPedido.produtoOutputDTO.preco * itemPedido.quantidade;
        valorTotalProduto += subtotal;

        const item = `
            <tr>
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
            </tr>`;
        tbody.append(item);
    });

    // ===================== ENDEREÇO =====================
    const delivery = $("#endereco-delivery");
    delivery.empty();

    const endereco = `
        <h4>Endereço de Entrega</h4>
        <p id="delivery-name"><strong>Nome:</strong> ${dados.usuarioOutputDTO.nome}</p>
        <p id="delivery-street"><strong>Rua:</strong> ${dados.usuarioOutputDTO.enderecoOutputDTO.logradouro}</p>
        <p id="delivery-city"><strong>Cidade:</strong> ${dados.usuarioOutputDTO.enderecoOutputDTO.cidade} - ${dados.usuarioOutputDTO.enderecoOutputDTO.estado}</p>
        <p id="delivery-zip"><strong>CEP:</strong> ${dados.usuarioOutputDTO.enderecoOutputDTO.cep}</p>
        <p id="delivery-phone"><strong>Tel:</strong> ${dados.usuarioOutputDTO.telefone}</p>
    `;
    delivery.append(endereco);

    // ===================== TOTAIS =====================
    const boxSubTotal = $("#box-subtotal");
    const boxTotal = $("#box-total");
    boxSubTotal.empty().append(`<b>${toBRL(valorTotalProduto)}</b>`);
    boxTotal.empty().append(`<b>${toBRL(valorTotalProduto)}</b>`);

    console.log('✅ Pedido carregado com sucesso:', dados);
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
