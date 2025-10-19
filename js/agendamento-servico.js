document.addEventListener("DOMContentLoaded", async () => {
    const selectAnimal = document.getElementById("animal");
    const selectServico = document.getElementById("servico");
    const formAgendamento = document.getElementById("formAgendamento");
    const semAnimaisDiv = document.getElementById("semAnimais");

    selectServico.disabled = true;

    const usuarioId = getUserIdFromToken(); 
    const animais = await carregarAnimaisUsuario(usuarioId);

    // ----------------------------
    // Evento de mudança no selectAnimal
    // ----------------------------
    selectAnimal.addEventListener("change", async () => {
        const idAnimal = selectAnimal.value;
        if (!idAnimal) {
            selectServico.innerHTML = '<option value="">Selecione um animal primeiro</option>';
            selectServico.disabled = true;
            return;
        }

        selectServico.disabled = false;
        await carregarServicosPorAnimal(idAnimal);
    });

    formAgendamento.addEventListener("submit", e => {
        e.preventDefault();

        const idAnimal = selectAnimal.value;
        const idServico = selectServico.value;
        const data = document.getElementById("dataAgendamento").value;

        if (!idAnimal || !idServico || !data) {
            alert("Por favor, preencha todos os campos!");
            return;
        }

        const agendamentoTemp = {
            id: Date.now(),
            idAnimal,
            idServico,
            data,
            status: "Pendente"
        };

        localStorage.setItem("agendamentoTemp", JSON.stringify(agendamentoTemp));
        window.location.href = "agendamento-confirmar.html";
    });

    async function carregarAnimaisUsuario(usuarioId) {
        try {
            if (!validarLogin()) return [];

            const animais = await consumirAPIAutenticada(`/Animal/usuario/${usuarioId}`, 'GET');

            if (!animais || animais.length === 0) {
                selectAnimal.style.display = 'none';
                semAnimaisDiv.style.display = 'block';
                selectServico.disabled = true;
                return [];
            }

            semAnimaisDiv.style.display = 'none';
            selectAnimal.style.display = 'block';
            selectAnimal.innerHTML = '<option value="">Selecione um animal</option>';

            animais.forEach(a => {
                const option = document.createElement('option');
                option.value = a.id;
                option.textContent = `${a.nome} (${a.especie} - ${a.nomeTamanhoAnimal})`;
                selectAnimal.appendChild(option);
            });

            return animais;
        } catch (err) {
            console.error("Erro ao carregar animais do usuário:", err);
            return [];
        }
    }

    async function carregarServicosPorAnimal(idAnimal) {
        try {
            const servicos = await consumirAPIAutenticada(`/Servico/por-animal/${idAnimal}`, 'GET');

            if (!servicos || servicos.length === 0) {
                selectServico.innerHTML = '<option value="">Nenhum serviço disponível para este animal</option>';
                return;
            }

            selectServico.innerHTML = '<option value="">Selecione um serviço</option>';


            console.log(servicos)
            servicos.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id; // certifique-se que o DTO retorna "id"
                option.textContent = `${s.nome} - R$ ${Number(s.preco).toFixed(2)}`;
                selectServico.appendChild(option);
            });

        } catch (err) {
            console.error("Erro ao carregar serviços do animal:", err);
            selectServico.innerHTML = '<option value="">Erro ao carregar serviços</option>';
        }
    }
});
