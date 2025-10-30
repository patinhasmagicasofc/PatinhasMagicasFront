document.addEventListener("DOMContentLoaded", async () => {
    const selectTamanho = document.getElementById("tamanhoAnimal");
    const selectEspecie = document.getElementById("especie");
    const form = document.getElementById("formCadastroAnimal");

    async function carregarTamanhos() {
        try {
            const tamanhos = await consumirAPIAutenticada('/TamanhoAnimal', 'GET');
            if (!tamanhos || tamanhos.length === 0) return;

            tamanhos.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                option.textContent = t.nome;
                selectTamanho.appendChild(option);
            });
        } catch (err) {
            console.error("Erro ao carregar tamanhos:", err);
        }
    }

    async function carregarEspecies() {
        try {
            const especies = await consumirAPIAutenticada('/Especie', 'GET');
            if (!especies || especies.length === 0) return;

            especies.forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                option.textContent = t.nome;
                selectEspecie.appendChild(option);
            });
        } catch (err) {
            console.error("Erro ao carregar tamanhos:", err);
        }
    }

    await carregarTamanhos();
    await carregarEspecies();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const raca = document.getElementById("raca").value.trim();
        const idade = document.getElementById("idade").value;
        const especieId = selectEspecie.value;
        const tamanhoAnimalId = selectTamanho.value;

        if (!nome || !especieId || !tamanhoAnimalId) {
            mostrarToast("❌ Por favor, preencha todos os campos obrigatórios!", "erro");
            return;
        }

        const usuarioId = getUserIdFromToken();
        console.log(usuarioId)

        const animal = {
            nome,
            especieId: parseInt(especieId),
            raca: raca || null,
            idade: idade ? parseInt(idade) : null,
            tamanhoAnimalId: parseInt(tamanhoAnimalId),
            usuarioId
        };

        try {
            await consumirAPIAutenticada('/Animal', 'POST', animal);
            mostrarToast("✅ Animal cadastrado com sucesso!", "sucesso");

            setTimeout(() => {
                window.location.href = "agendamento-servico.html";
            }, 2500);

        } catch (err) {
            console.error(err);
            mostrarToast("❌ Erro ao cadastrar animal. Tente novamente.", "erro");
        }
    });
});