
document.addEventListener("DOMContentLoaded", async () => {

    if (!verificarAcesso(['administrador'])) return;

    await carregarAgendamentos();

    async function carregarAgendamentos() {
        try {

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
                    <td>${agendamento.animal.nomeUsuario}</td>
                    <td>${nomeAnimal}</td>
                    <td>${nomeServico}</td>
                    <td>${dataConfirmacao}</td>
                    <td><span class="badge ${status === 'Confirmado' ? 'bg-success' : 'bg-warning'}">${status}</span></td>
                    <td><a href="/pages/admin/agendamento-detalhes.html?id=${agendamento.id}" class="btn btn-sm btn-primary">Ver Detalhes</a></td>
                `;

                tabela.appendChild(linha);
            });
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
        }
    }
});


//função header
const menuItem = document.querySelectorAll('.item-menu');

function selectLink() {
    menuItem.forEach((item) => item.classList.remove('ativo'));
    this.classList.add('ativo');
}

menuItem.forEach((item) => item.addEventListener('click', selectLink));

const btnExpandir = document.querySelector('#btn-exp');
const nav = document.querySelector('.menu-lateral');
const header = document.querySelector('header');

// Abrir/fechar menu
btnExpandir.addEventListener('click', (e) => {
    e.stopPropagation()
    nav.classList.toggle('expandir');
    header.classList.toggle('expandir');
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('expandir')) {
        nav.classList.remove('expandir');
        header.classList.remove('expandir');
    }
});
