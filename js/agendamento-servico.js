document.addEventListener("DOMContentLoaded", async () => {
  const usuarioId = getUserIdFromToken();
  if (verificarAcesso(['administrador', 'cliente']) && usuarioId) {
  }

  const selectAnimal = document.getElementById("animal");
  const selectServico = document.getElementById("servico");
  const semAnimaisDiv = document.getElementById("semAnimais");
  const form = document.getElementById("formAgendamento");

  selectServico.disabled = true;

  const listaAnimais = await carregarAnimaisUsuario(usuarioId);
  let listaServicos = [];

  // Quando mudar o animal
  selectAnimal.addEventListener("change", async () => {
    const idAnimal = selectAnimal.value;

    if (!idAnimal) {
      selectServico.disabled = true;
      return;
    }

    selectServico.disabled = false;
    listaServicos = await carregarServicosPorAnimal(idAnimal);
  });

  // Evento de submit fora do "change"
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idAnimal = selectAnimal.value;
    const idServico = selectServico.value;
    const data = document.getElementById("dataAgendamento").value;

    if (!idAnimal || !idServico || !data) {
      mostrarToast("❌ Preencha todos os campos.", "erro");
      return;
    }

    const animal = listaAnimais.find(a => a.id == idAnimal);
    const servico = listaServicos.find(s => s.id == idServico);

    const agendamentoTemp = {
      idAnimal: animal.id,
      nomeAnimal: animal.nome,
      nomeEspecie: animal.nomeEspecie,
      tamanhoAnimal: animal.nomeTamanhoAnimal,
      idServico: servico.id,
      nomeServico: servico.nome,
      tipoServico: servico.tipo,
      duracaoServico: servico.duracao,
      precoServico: servico.preco,
      data,
      status: "Pendente"
    };

    console.log(agendamentoTemp);

    mostrarToast("✅ Redirecionando para a página de confirmação!", "sucesso");
    localStorage.setItem("agendamentoTemp", JSON.stringify(agendamentoTemp));

    setTimeout(() => {
      window.location.href = "agendamento-confirmar.html";
    }, 3000);
  });

  async function carregarAnimaisUsuario(usuarioId) {
    try {
      const animais = await consumirAPIAutenticada(`/Animal/usuario/${usuarioId}`, 'GET');

      console.log(animais)

      if (!animais || animais.length === 0) {
        selectAnimal.style.display = 'none';
        semAnimaisDiv.style.display = 'block';
        selectServico.disabled = true;

      }

      //semAnimaisDiv.style.display = 'none';
      selectAnimal.style.display = 'block';
      selectAnimal.innerHTML = '<option value="">Selecione um animal</option>';

      animais.forEach(a => {
        const option = document.createElement('option');
        option.value = a.id;
        option.textContent = `${a.nome} (${a.nomeEspecie} - ${a.nomeTamanhoAnimal})`;
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
        return [];
      }

      selectServico.innerHTML = '<option value="">Selecione um serviço</option>';

      servicos.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.nome} - R$ ${Number(s.preco).toFixed(2)}`;
        selectServico.appendChild(option);
      });

      return servicos;
    } catch (err) {
      console.error("Erro ao carregar serviços do animal:", err);
      selectServico.innerHTML = '<option value="">Erro ao carregar serviços</option>';
      return [];
    }
  }
});


