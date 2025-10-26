document.addEventListener("DOMContentLoaded", async () => {
    const usuarioId = getUserIdFromToken();
    await carregarPedidosByUsuarioId(usuarioId);
});

let pedidos = [];

async function carregarPedidosByUsuarioId(usuarioId) {
    try {
        if (!validarLogin()) return;

        const data = await consumirAPIAutenticada(`/Pedido/Usuario/${usuarioId}`, 'GET');
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
        'Cancelado': 'status-cancelado'
    };

    const container = document.getElementById('pedidos-container');
    container.innerHTML = '';

    pedidos.forEach(pedido => {
        console.log(pedido)
        const div = document.createElement('div');
        div.className = 'pedido';
        div.innerHTML = `
            <div class="pedido-header">
                <span class="pedido-id">Pedido ${pedido.id}</span>
                <span class="pedido-status ${statusClass[pedido.statusPedido] || ''}">
                    ${pedido.statusPedido}
                </span>
            </div>
            <div class="pedido-body">
                <span>Data: ${new Date(pedido.dataPedido).toLocaleDateString()}</span>
                <span>Total: R$ ${pedido.valorPedido?.toFixed(2) || '0,00'}</span>
            </div>
            <button class="btn-detalhes" onclick="verDetalhes(${pedido.id})">Ver detalhes</button>
        `;
        container.appendChild(div);
    });
}

function verDetalhes(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;

    const container = document.getElementById('detalhesContainer');

    const itensHTML = pedido.itemPedidoOutputDTOs?.map(i => `
        <li>
        <img src=${i.produtoOutputDTO.urlImagem} width=50px></img>
            <span>${i.produto}</span>
            <span>Qtd: ${i.quantidade}</span>
            <span>R$ ${i.precoUnitario.toFixed(2)}</span>
            <span>Subtotal: R$ ${(i.quantidade * i.precoUnitario).toFixed(2)}</span>
        </li>
    `).join('') || '<li>Nenhum item encontrado</li>';

    container.innerHTML = `
        <p><strong>ID:</strong> ${pedido.id}</p>
        <p><strong>Data:</strong> ${new Date(pedido.dataPedido).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${pedido.statusPedido}</p>
        <p><strong>Total:</strong> R$ ${pedido.valorPedido?.toFixed(2) || '0,00'}</p>
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
