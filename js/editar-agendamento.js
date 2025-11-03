document.addEventListener("DOMContentLoaded", async () => {
    if (!verificarAcesso(['administrador'])) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const div = document.getElementById("detalhesAgendamento");
    inicializarMenuLateral();
    if (!id) {
        div.innerHTML = `<div class="alert alert-danger">Agendamento não encontrado.</div>`;
        return;
    }

    try {
        // Buscar agendamento
        const agendamento = await consumirAPIAutenticada(`/Agendamento/${id}`, 'GET');
        if (!agendamento) throw new Error("Erro ao buscar agendamento");

        console.log("Agendamento carregado:", agendamento);

        const dataISO = new Date(agendamento.dataAgendamento).toISOString().slice(0, 16);
        const dataCadastro = new Date(agendamento.dataConfirmacao).toLocaleString("pt-BR");

        const originalStatusNome =
            agendamento.statusAgendamento?.nome ||
            agendamento.statusAgendamentoNome ||
            agendamento.nomeStatusAgendamento ||
            agendamento.status ||
            "";

        console.log("Status atual detectado:", originalStatusNome);

        // Montar formulário
        div.innerHTML = `
        <form id="formEditarAgendamento">
            <div class="container-informations">
                <div class="title-nome">
                    <ul><li><p class="card-title">${agendamento.servico?.nome ?? "Serviço"}</p></li></ul>
                </div>
                <p><strong>Animal:</strong> ${agendamento.animal?.nome ?? "—"} (${agendamento.animal?.nomeEspecie ?? "—"} - ${agendamento.animal?.nomeTamanhoAnimal ?? "—"})</p>

                <div class="mb-3">
                    <label for="dataAgendamento" class="form-label"><strong>Data e Hora Agendamento:</strong></label>
                    <input type="datetime-local" id="dataAgendamento" class="form-control" value="${dataISO}" disabled>
                </div>

                <div class="mb-3">
                    <label for="statusAgendamento" class="form-label"><strong>Status:</strong></label>
                    <select id="statusAgendamento" class="form-select" disabled>
                        <option value="">Carregando status...</option>
                    </select>
                </div>

                <p><strong>Forma de pagamento:</strong> ${agendamento.tipoPagamento ?? "—"}</p>
                <p><strong>Cadastrado em:</strong> ${dataCadastro}</p>

                <hr>
                <div class="valor-total">
                    <ul><li><p class="text-success">Total: R$ ${Number(agendamento.valorTotal ?? 0).toFixed(2)}</p></li></ul>
                </div>

                <div class="text-center mt-3" id="botoesAgendamento">
                    <button type="button" class="btn btn-primary" id="btnEditar">Editar</button>
                </div>
            </div>
        </form>
        `;

        const form = document.getElementById("formEditarAgendamento");
        const inputData = document.getElementById("dataAgendamento");
        const selectStatus = document.getElementById("statusAgendamento");
        const botoesDiv = document.getElementById("botoesAgendamento");

        const originalData = inputData.value;

        const habilitarCampos = (habilitar) => {
            inputData.disabled = !habilitar;
            selectStatus.disabled = !habilitar;
        };

        const btnSalvar = document.createElement("button");
        btnSalvar.type = "submit";
        btnSalvar.className = "btn btn-success me-2";
        btnSalvar.textContent = "Salvar";
        btnSalvar.style.display = "none";

        const btnCancelar = document.createElement("button");
        btnCancelar.type = "button";
        btnCancelar.className = "btn btn-outline-secondary";
        btnCancelar.textContent = "Cancelar";
        btnCancelar.style.display = "none";

        botoesDiv.appendChild(btnSalvar);
        botoesDiv.appendChild(btnCancelar);

        const btnEditar = document.getElementById("btnEditar");

        btnEditar.addEventListener("click", () => {
            habilitarCampos(true);
            btnSalvar.style.display = "inline-block";
            btnCancelar.style.display = "inline-block";
            btnEditar.style.display = "none";
        });

        btnCancelar.addEventListener("click", () => {
            inputData.value = originalData;
            Array.from(selectStatus.options).forEach(opt => {
                opt.selected =
                    opt.text.trim().toLowerCase() === originalStatusNome.trim().toLowerCase();
            });
            habilitarCampos(false);
            btnSalvar.style.display = "none";
            btnCancelar.style.display = "none";
            btnEditar.style.display = "inline-block";
        });

        // Submissão do formulário
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!inputData.value || !selectStatus.value) {
                mostrarToast("⚠️ Preencha todos os campos antes de salvar.");
                return;
            }

            const payload = {
                dataAgendamento: inputData.value, // mantém data/hora local
                pedidoId: parseInt(agendamento.pedidoId),
                statusAgendamentoId: parseInt(selectStatus.value)
            };

            console.log("Payload para atualização:", payload);

            try {
                const response = await consumirAPIAutenticada(`/Agendamento/${id}`, "PUT", payload);

                // Atualiza status no front-end sem reload
                const novoStatus = selectStatus.options[selectStatus.selectedIndex].text;
                mostrarToast(`✅ Agendamento atualizado para "${novoStatus}"!`);

                habilitarCampos(false);
                btnSalvar.style.display = "none";
                btnCancelar.style.display = "none";
                btnEditar.style.display = "inline-block";

                // Atualiza o valor original
                agendamento.dataAgendamento = inputData.value;
                agendamento.statusAgendamentoNome = novoStatus;

            } catch (err) {
                console.error("Erro ao atualizar agendamento:", err);
                mostrarToast("❌ Erro ao atualizar agendamento.");
            }
        });

        await carregarStatus(originalStatusNome, selectStatus);
    } catch (err) {
        console.error(err);
        div.innerHTML = `<div class="alert alert-danger">Erro ao carregar detalhes do agendamento.</div>`;
    }
});

// 🔧 Carrega lista de status e seleciona o atual
async function carregarStatus(nomeSelecionado = null, selectElement = null) {
    try {
        const data = await consumirAPIAutenticada("/StatusAgendamento", "GET");
        if (!selectElement || !data) return;

        selectElement.innerHTML = "";

        console.log("Status disponíveis:", data);

        data.forEach(status => {
            const option = document.createElement("option");
            option.value = status.id;
            option.textContent = status.nome;

            if (
                nomeSelecionado &&
                status.nome?.trim().toLowerCase() === nomeSelecionado.trim().toLowerCase()
            ) {
                option.selected = true;
            }

            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar status:", error);
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