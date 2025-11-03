document.addEventListener("DOMContentLoaded", async () => {

  if (!verificarAcesso(['administrador', 'Cliente'])) return;

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "index.html";
    });
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const div = document.getElementById("detalhesAgendamento");

  if (!id) {
    div.innerHTML = `<div class="alert alert-danger">Agendamento não encontrado.</div>`;
    return;
  }

  try {
    // 🔹 Chamada da API
    const agendamento = await consumirAPIAutenticada(`/Agendamento/${id}`, 'GET');

    if (!agendamento) throw new Error("Erro ao buscar agendamento");

    // 🔹 Formatando datas
    const dataFormatada = new Date(agendamento.dataAgendamento).toLocaleString("pt-BR");
    const dataCadastro = new Date(agendamento.dataConfirmacao).toLocaleString("pt-BR");

    console.log(agendamento)
    // 🔹 Montando HTML
    div.innerHTML = `
      <div>
        <div class="container-informations">
          <div class="title-nome">
            <ul>
                <li>
                    <p class="card-title">${agendamento.servico?.nome ?? "Serviço"}</p>
                </li>
              </ul>
          </div>
          <p><strong>Animal:</strong> ${agendamento.animal?.nome ?? "—"} (${agendamento.animal?.nomeEspecie ?? "—"} - ${agendamento.animal?.nomeTamanhoAnimal ?? "—"})</p>
          <p><strong>Data e hora:</strong> ${dataFormatada}</p>
          <p><strong>Forma de pagamento:</strong> ${agendamento.tipoPagamento ?? "—"}</p>
          <p><strong>Status:</strong> ${agendamento.status ?? "Agendado"}</p>
          <p><strong>Cadastrado em:</strong> ${dataCadastro}</p>
          <hr>
          <div class="valor-total">
              <ul>
                <li>
                  <p class="text-success">Total: R$ ${Number(agendamento.valorTotal ?? 0).toFixed(2)}</p>
                </li>
            </ul>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    div.innerHTML = `<div class="alert alert-danger">Erro ao carregar detalhes do agendamento.</div>`;
  }
});
