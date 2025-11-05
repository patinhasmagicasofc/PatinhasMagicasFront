
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

    // --- Inicializa menus ---
    inicializarMenuLateral();
    inicializarPainelFiltros();
    inicializarMenuOptions();
});


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
