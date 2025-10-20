document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const idPedido = params.get("id");
  const div = document.getElementById("detalhesAgendamento");

  if (!idPedido) {
    div.innerHTML = `<div class="alert alert-danger">Agendamento não encontrado.</div>`;
    return;
  }

  try {
    const token = getToken();
    const res = await fetch(`/api/Agendamento/${idPedido}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao buscar agendamento");

    const agendamento = await res.json();
    const dataFormatada = new Date(agendamento.dataAgendamento).toLocaleString("pt-BR");
    const dataConfirmacao = new Date(agendamento.dataConfirmacao).toLocaleString("pt-BR");

    div.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${agendamento.servico.nome}</h5>
          <p><strong>Animal:</strong> ${agendamento.animal.nome} (${agendamento.animal.especie} - ${agendamento.animal.tamanho})</p>
          <p><strong>Data e hora:</strong> ${dataFormatada}</p>
          <p><strong>Forma de pagamento:</strong> ${agendamento.tipoPagamento}</p>
          <p><strong>Status:</strong> ${agendamento.status}</p>
          <p><strong>Confirmado em:</strong> ${dataConfirmacao}</p>
          <hr>
          <h5 class="text-success text-end">Total: R$ ${Number(agendamento.servico.preco).toFixed(2)}</h5>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    div.innerHTML = `<div class="alert alert-danger">Erro ao carregar detalhes do agendamento.</div>`;
  }
});
