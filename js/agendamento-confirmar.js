document.addEventListener("DOMContentLoaded", async () => {
  const menuLogado = document.getElementById("menuLogado");
  const menuDeslogado = document.getElementById("menuDeslogado");

  if (validarLogin()) {
    menuLogado.classList.remove("d-none");
    menuDeslogado.classList.add("d-none");
  } else {
    menuDeslogado.classList.remove("d-none");
    menuLogado.classList.add("d-none");
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "index.html";
    });
  }

  const agendamentoTemp = JSON.parse(localStorage.getItem("agendamentoTemp"));
  const divResumo = document.getElementById("resumoAgendamento");
  const form = document.getElementById("formFinalizar");

  if (!agendamentoTemp) {
    divResumo.innerHTML = `<div class="alert alert-danger">Nenhum agendamento encontrado.</div>`;
    if (form) form.style.display = "none";
    return;
  }

  const dataFormatada = new Date(agendamentoTemp.data).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });

  divResumo.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title">${agendamentoTemp.nomeServico}</h5>
        <p><strong>Animal:</strong> ${agendamentoTemp.nomeAnimal} (${agendamentoTemp.nomeEspecie} - ${agendamentoTemp.tamanhoAnimal})</p>
        <p><strong>Data e hora:</strong> ${dataFormatada}</p>
        <p><strong>Duração estimada:</strong> ${agendamentoTemp.duracaoServico} min</p>
        <p><strong>Preço:</strong> R$ ${Number(agendamentoTemp.precoServico).toFixed(2)}</p>
      </div>
    </div>
  `;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const tipoPagamento = document.getElementById("tipoPagamento").value;
    if (!tipoPagamento) {
      alert("Selecione uma forma de pagamento!");
      return;
    }

    const agendamentoParaAPI = {
      servicoId: agendamentoTemp.idServico,
      dataAgendamento: agendamentoTemp.data,
      dataCadastro: new Date().toISOString(),
      TipoPagamentoId: tipoPagamento,
      usuarioId: getUserIdFromToken(),
      animalId: agendamentoTemp.idAnimal
    };

    try {
      const resultado = await consumirAPIAutenticada('/Agendamento', 'POST', agendamentoParaAPI);
      console.log(resultado);

      if (resultado.agendamento && resultado.agendamento.id) {
        localStorage.removeItem("agendamentoTemp");
        window.location.href = `agendamento-sucesso.html?id=${resultado.agendamento.id}`;
      } else {
        alert("Erro ao confirmar o agendamento.");
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível confirmar o agendamento.");
    }
  });

  await carregarPagamento();
});

async function carregarPagamento() {
  try {
    if (!validarLogin()) return;

    const data = await consumirAPIAutenticada('/TipoPagamento', 'GET');
    const selectTipoPagamento = document.getElementById('tipoPagamento');
    if (!selectTipoPagamento) return;

    selectTipoPagamento.innerHTML = `<option value="">Selecione...</option>`;
    if (!data || data.length === 0) return;

    data.forEach(tp => {
      const option = document.createElement('option');
      option.value = tp.id;
      option.textContent = tp.nome;
      selectTipoPagamento.appendChild(option);
    });
  } catch (err) {
    console.error('Erro ao carregar tipos de pagamento:', err);
  }
}
