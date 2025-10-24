document.addEventListener("DOMContentLoaded", async () => {
    if (!verificarAcesso('administrador')) {
        window.location.href = 'login.html';
        return;
    }

    await carregarAgendamentos();

    async function carregarAgendamentos() {
        try {
            if (!validarLogin()) return;

            const data = await consumirAPIAutenticada('/Agendamento', 'GET');
            const tabela = document.getElementById("tabelaAgendamentos");
            if (!tabela || !data) return;

            tabela.innerHTML = ""; // limpa antes de inserir novas linhas

            console.log(data)

            data.forEach(agendamento => {
                const linha = document.createElement('tr');

                // Garante que os campos existam antes de acessar
                const nomeAnimal = agendamento.animal?.nome ?? "—";
                const nomeServico = agendamento.servicos?.length > 0
                    ? agendamento.servicos.map(s => s.nome).join(", ")
                    : "—";
                const dataConfirmacao = agendamento.dataConfirmacao
                    ? new Date(agendamento.dataConfirmacao).toLocaleString("pt-BR")
                    : "—";
                const status = agendamento.status ?? "Pendente";

                linha.innerHTML = `
                    <td>${agendamento.id}</td>
                    <td>Cliente ${agendamento.animal.nomeUsuario}</td>
                    <td>${nomeAnimal}</td>
                    <td>${nomeServico}</td>
                    <td>${dataConfirmacao}</td>
                    <td><span class="badge ${status === 'Confirmado' ? 'bg-success' : 'bg-warning'}">${status}</span></td>
                    <td><a href="admin-agendamento-detalhes.html?id=${agendamento.id}" class="btn btn-sm btn-primary">Ver Detalhes</a></td>
                `;

                tabela.appendChild(linha);
            });
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        }
    }
});
