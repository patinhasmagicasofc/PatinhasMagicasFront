document.addEventListener("DOMContentLoaded", async () => {
    const selectTamanho = document.getElementById("tamanhoAnimal");
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

    await carregarTamanhos();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const especie = document.getElementById("especie").value.trim();
        const raca = document.getElementById("raca").value.trim();
        const idade = document.getElementById("idade").value;
        const tamanhoAnimalId = selectTamanho.value;

        if (!nome || !especie || !tamanhoAnimalId) {
            alert("Por favor, preencha todos os campos obrigatórios!");
            return;
        }

        const usuarioId = getUserIdFromToken(); 
        console.log(usuarioId)

        const animal = {
            nome,
            especie,
            raca: raca || null,
            idade: idade ? parseInt(idade) : null,
            tamanhoAnimalId: parseInt(tamanhoAnimalId),
            usuarioId
        };

        try {
            await consumirAPIAutenticada('/Animal', 'POST', animal);
            alert("Animal cadastrado com sucesso!");
            window.location.href = "agendamento-servico.html";
        } catch (err) {
            console.error(err);
            alert("Erro ao cadastrar animal. Tente novamente.");
        }
    });
});