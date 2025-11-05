document.addEventListener("DOMContentLoaded", async () => {

    const usuarioId = getUserIdFromToken();
    if (verificarAcesso(['administrador', 'cliente']) && usuarioId) {
        //document.body.style.display = 'block';
        await carregarServicosByUsuarioId(usuarioId);
    }
});

let agendamentos = [];

async function carregarServicosByUsuarioId(usuarioId) {
    try {

        const data = await consumirAPIAutenticada(`/Agendamento/Usuario/${usuarioId}`, 'GET');
        agendamentos = data;
        console.log(data)

        renderizarAgendamentos(agendamentos);
    } catch (error) {
        console.error('Erro ao carregar servicos:', error);
    }
}

function renderizarAgendamentos(agendamentos) {
    const statusClass = {
        'Pendente': 'status-pendente',
        'Aprovado': 'status-aprovado',
        'Cancelado': 'status-cancelado',
        'Concluído': 'status-concluido'
    };

    const container = document.getElementById('pedidos-container');
    container.innerHTML = '';

    if (!agendamentos?.length) {
        container.innerHTML = `<p class="sem-agendamentos">Nenhum agendamento encontrado.</p>`;
        return;
    }

    agendamentos.forEach(agendamento => {
        const { id, dataAgendamento, status, valorTotal, servicos, animal } = agendamento;

        const nomeAnimal = animal?.nome || 'Não informado';
        const especie = animal?.nomeEspecie || 'Desconhecida';
        const raca = animal?.raca ? ` (${animal.raca})` : '';
        const servicosList = servicos?.map(s => s.nome).join(', ') || '—';
        const dataFormatada = new Date(dataAgendamento).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const valor = agendamento.valorTotal?.toFixed(2) || '0,00';

        const div = document.createElement('div');
        div.className = 'pedido';
        div.innerHTML = `
            <div class="pedido-header">
                <span class="pedido-id">Agendamento #${id}</span>
                <span class="pedido-status ${statusClass[status] || ''}">
                    ${status}
                </span>
            </div>
            <div class="pedido-body">
                <p><strong>Animal:</strong> ${nomeAnimal}</p>
                <p><strong>Espécie/Raça:</strong> ${especie}${raca}</p>
                <p><strong>Serviço(s):</strong> ${servicosList}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Total:</strong> R$ ${valor}</p>
            </div>
            <button class="btn-detalhes" onclick="verDetalhes(${id})">Ver detalhes</button>
        `;
        container.appendChild(div);
    });
}


function verDetalhes(id) {
    const agendamento = agendamentos.find(a => a.id === id);
    if (!agendamento) return;

    const container = document.getElementById('detalhesContainer');

    // 🐾 Serviços
    const servicosHTML = agendamento.servicos?.length
        ? agendamento.servicos.map(s => `
            <li>
                <strong>${s.nome}</strong> — R$ ${s.preco?.toFixed(2) ?? '0,00'}
            </li>
        `).join('')
        : '<li>Nenhum serviço informado</li>';

    // 🐶 Animal
    const animal = agendamento.animal;
    const especie = animal?.nomeEspecie || 'Não informado';
    const raca = animal?.raca || '-';
    const tamanho = animal?.nomeTamanhoAnimal || '-';
    const nomeAnimal = animal?.nome || 'Sem nome';

    // 🧾 Detalhes gerais
    const dataAgendamento = new Date(agendamento.dataAgendamento).toLocaleString('pt-BR');
    const dataConfirmacao = agendamento.dataConfirmacao
        ? new Date(agendamento.dataConfirmacao).toLocaleString('pt-BR')
        : 'Ainda não confirmado';
    const status = agendamento.status || 'Não informado';
    const tipoPagamento = agendamento.tipoPagamento || 'Não informado';
    const valorTotal = agendamento.valorTotal?.toFixed(2) || '0.00';

    // 🧱 Monta o HTML
    container.innerHTML = `
        <p><strong>ID:</strong> ${agendamento.id}</p>
        <p><strong>Data do Agendamento:</strong> ${dataAgendamento}</p>
        <p><strong>Data de Confirmação:</strong> ${dataConfirmacao}</p>
        <p><strong>Status:</strong> ${status}</p>
        <hr>
        <h4>🐾 Animal</h4>
        <p><strong>Nome:</strong> ${nomeAnimal}</p>
        <p><strong>Espécie:</strong> ${especie}</p>
        <p><strong>Raça:</strong> ${raca}</p>
        <p><strong>Tamanho:</strong> ${tamanho}</p>
        <hr>
        <h4>💈 Serviços</h4>
        <ul class="item-lista">${servicosHTML}</ul>
        <hr>
        <h4>💳 Pagamento</h4>
        <p><strong>Tipo:</strong> ${tipoPagamento}</p>
        <p><strong>Valor Total:</strong> R$ ${valorTotal}</p>
    `;

    // Exibe o modal
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
