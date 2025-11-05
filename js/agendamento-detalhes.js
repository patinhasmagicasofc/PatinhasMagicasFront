document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

    const agendamento = agendamentos.find(a => a.id === id);
    const detalhesDiv = document.getElementById("detalhes");

    if (!agendamento) {
        detalhesDiv.innerHTML = `<div class="alert alert-danger">Agendamento não encontrado.</div>`;
        return;
    }

    // Protege contra dados inválidos
    const dataFormatada = agendamento.data 
        ? new Date(agendamento.data).toLocaleString("pt-BR") 
        : "Data não informada";

    detalhesDiv.innerHTML = `
        <p><strong>ID:</strong> ${agendamento.id}</p>
        <p><strong>Cliente:</strong> ${agendamento.idUsuario ?? "Não informado"}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Pagamento:</strong> ${agendamento.tipoPagamento ?? "Não informado"}</p>
        <p><strong>Status atual:</strong> ${agendamento.status ?? "Indefinido"}</p>
    `;

    const selectStatus = document.getElementById("status");
    if (selectStatus) selectStatus.value = agendamento.status ?? "";

    // --- Atualização do status ---
    const formStatus = document.getElementById("formStatus");
    if (formStatus) {
        formStatus.addEventListener("submit", (e) => {
            e.preventDefault();

            const novoStatus = selectStatus?.value;
            if (!novoStatus) {
                alert("Selecione um status válido antes de salvar.");
                return;
            }

            if (agendamento.status !== novoStatus) {
                agendamento.status = novoStatus;
                localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
            }

            window.location.href = `admin-agendamento-sucesso.html?id=${agendamento.id}`;
        });
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
