document.addEventListener("DOMContentLoaded", async () => {

    const usuarioId = getUserIdFromToken();

    usuarioId == null;
    if (verificarAcesso(['administrador', 'cliente']) && usuarioId) {
        await carregarPedidosByUsuarioId(usuarioId);
    }
});


let pedidos = [];

async function carregarPedidosByUsuarioId(usuarioId) {
    try {
        const data = await consumirAPIAutenticada(`/Pedido/Usuario/${usuarioId}`, 'GET');
        console.log(data);
        pedidos = data;

        renderizarPedidos(pedidos);
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

function renderizarPedidos(pedidos) {
    const statusClass = {
        'Pendente': 'status-pendente',
        'Aprovado': 'status-aprovado',
        'Cancelado': 'status-cancelado',
        'Concluído': 'status-concluido'
    };

    const container = document.getElementById('pedidos-container');
    container.innerHTML = '';

    if (!pedidos?.length) {
        container.innerHTML = `<p class="sem-pedidos">Nenhum pedido encontrado.</p>`;
        return;
    }

    pedidos.forEach(pedido => {
        const { id, dataPedido, statusPedido, valorPedido, itemPedidoOutputDTOs } = pedido;

        const dataFormatada = new Date(dataPedido).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const numItens = itemPedidoOutputDTOs?.length || 0;
        const valor = valorPedido?.toFixed(2) || '0,00';

        const div = document.createElement('div');
        div.className = 'pedido';
        div.innerHTML = `
            <div class="pedido-header">
                <span class="pedido-id">Pedido #${id}</span>
                <span class="pedido-status ${statusClass[statusPedido] || ''}">
                    ${statusPedido}
                </span>
            </div>

            <div class="pedido-body">
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Itens:</strong> ${numItens}</p>
                <p><strong>Total:</strong> R$ ${valor}</p>
            </div>

            <div class="pedido-footer">
                <button class="btn-detalhes" onclick="verDetalhes(${id})">Ver detalhes</button>
            </div>
        `;

        container.appendChild(div);
    });
}

function verDetalhes(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;

    const container = document.getElementById('detalhesContainer');

    // Itens do pedido
    const itensHTML = pedido.itemPedidoOutputDTOs?.map(i => `
        <li>
            <img src="${i.produtoOutputDTO.urlImagem}" width="50px">
            <span>${i.produto}</span>
            <span>Qtd: ${i.quantidade}</span>
            <span>R$ ${i.precoUnitario.toFixed(2)}</span>
            <span>Subtotal: R$ ${(i.quantidade * i.precoUnitario).toFixed(2)}</span>
        </li>
    `).join('') || '<li>Nenhum item encontrado</li>';

    // Endereço do usuário
    const endereco = pedido.usuarioOutputDTO?.endereco;
    const enderecoFormatado = endereco
        ? `${endereco.logradouro}, ${endereco.numero}${endereco.complemento ? ' - ' + endereco.complemento : ''}, ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, CEP: ${endereco.cep}`
        : 'Não informado';

    // Forma de pagamento / status
    const formaPagamento = pedido.formaPagamento || 'Não informado';
    const statusPagamento = pedido.statusPagamento || '-';

    // Monta o HTML do modal
    container.innerHTML = `
        <p><strong>ID:</strong> ${pedido.id}</p>
        <p><strong>Data:</strong> ${new Date(pedido.dataPedido).toLocaleString('pt-BR')}</p>
        <p><strong>Status do pedido:</strong> ${pedido.statusPedido}</p>
        <p><strong>Status do pagamento:</strong> ${statusPagamento}</p>
        <p><strong>Forma de pagamento:</strong> ${formaPagamento}</p>
        <p><strong>Total:</strong> R$ ${pedido.valorPedido?.toFixed(2) || '0,00'}</p>
        <p><strong>Endereço:</strong> ${enderecoFormatado}</p>
        <hr>
        <p><strong>Itens:</strong></p>
        <ul class="item-lista">${itensHTML}</ul>
    `;

    document.getElementById('detalhesModal').style.display = 'block';
}



function fecharModal() {
    document.getElementById('detalhesModal').style.display = 'none';
}

// Fecha o modal ao clicar fora
window.onclick = function (event) {
    const modal = document.getElementById('detalhesModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
