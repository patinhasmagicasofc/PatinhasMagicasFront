const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

const agendamento = agendamentos.find(a => a.id == id);
const detalhesDiv = document.getElementById("detalhes");

if (!agendamento) {
    detalhesDiv.innerHTML = `<div class="alert alert-danger">Agendamento não encontrado.</div>`;
} else {
    detalhesDiv.innerHTML = `
        <p><strong>ID:</strong> ${agendamento.id}</p>
        <p><strong>Cliente:</strong> ${agendamento.idUsuario}</p>
        <p><strong>Data:</strong> ${new Date(agendamento.data).toLocaleString("pt-BR")}</p>
        <p><strong>Pagamento:</strong> ${agendamento.tipoPagamento}</p>
        <p><strong>Status atual:</strong> ${agendamento.status}</p>
      `;

    document.getElementById("status").value = agendamento.status;
}

document.getElementById("formStatus").addEventListener("submit", (e) => {
    e.preventDefault();

    const novoStatus = document.getElementById("status").value;
    agendamento.status = novoStatus;

    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

    window.location.href = `admin-agendamento-sucesso.html?id=${agendamento.id}`;
});