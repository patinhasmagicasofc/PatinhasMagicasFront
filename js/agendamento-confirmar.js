document.addEventListener("DOMContentLoaded", async () => {
  const divResumo = document.getElementById("resumoAgendamento");
  const form = document.getElementById("formFinalizar");
  const selectPagamento = document.getElementById("tipoPagamento");

  // 🔹 Adiciona modal no body
  let modal = document.getElementById("modalPagamento");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modalPagamento";

    const modalConteudo = document.createElement("div");
    modalConteudo.id = "modalConteudo";
;

    modalConteudo.innerHTML = `
      <span class="fecharModal" id="fecharModal" style="position:absolute;top:10px;right:15px;font-size:1.5rem;color:white;cursor:pointer;">&times;</span>
      <div id="conteudoPagamento"></div>
    `;

    modal.appendChild(modalConteudo);
    document.body.appendChild(modal);
  }

  // 🔹 Carregar agendamento temporário
  const agendamentoTemp = JSON.parse(localStorage.getItem("agendamentoTemp"));
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

  // 🔹 Carregar formas de pagamento da API
  await carregarPagamento();

  // 🔹 Listener para abrir modal ao selecionar pagamento
  selectPagamento.addEventListener("change", () => {
    const tipo = selectPagamento.value;
    const conteudo = document.getElementById("conteudoPagamento");
    conteudo.innerHTML = "";

    if (!tipo) return;

    if (tipo === "1") {
      // Cartão
      conteudo.innerHTML = `
        <h2>Pagamento com Cartão 💳</h2>
        <form id="formPagamento">
          <input type="text" placeholder="0000 0000 0000 0000" maxlength="19">
          <input type="text" placeholder="Nome no cartão">
          <input type="text" placeholder="MM/AA" maxlength="5">
          <input type="text" placeholder="CVV" maxlength="3">
          <button type="submit">Pagar agora</button>
        </form>
        <p class="msg" id="msgPagamento">Pagamento aprovado ✅</p>
      `;
      document.getElementById("formPagamento").addEventListener("submit", e => {
        e.preventDefault();
        const msg = document.getElementById("msgPagamento");
        msg.style.display = "block";
        msg.textContent = "Processando pagamento...";
        setTimeout(() => {
          msg.textContent = "Pagamento aprovado ✅";
          msg.classList.add("ok");
        }, 2000);
      });
    } else if (tipo === "2") {
      // Pix
      conteudo.innerHTML = `
       <div class="pagamento-pix">
        <div class="title-pagamento-pix">
          <ul>
            <li>
              <p>
                Pagamento via Pix 💸
              </p>
            </li>
          </ul>
        </div>
        <div class="qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?data=fakepix123&size=200x200" alt="QR Code Pix">
        </div>
        <p class="simular-pagamento">Escaneie o QR Code para simular o pagamento.</p>
        <button id="btnPixPago">Já paguei</button>
        <p class="msg" id="msgPix">Pagamento confirmado ✅</p>
      </div>
      `;
      document.getElementById("btnPixPago").addEventListener("click", () => {
        document.getElementById("msgPix").style.display = "block";
      });
    }

    modal.style.display = "flex";
  });

  // 🔹 Fechar modal
  document.getElementById("fecharModal").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // 🔹 Enviar agendamento via API
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const tipoPagamentoId = selectPagamento.value;
    if (!tipoPagamentoId) {
      alert("Selecione uma forma de pagamento!");
      return;
    }

    const agendamentoParaAPI = {
      servicoId: agendamentoTemp.idServico,
      dataAgendamento: agendamentoTemp.data,
      dataCadastro: new Date().toISOString(),
      TipoPagamentoId: tipoPagamentoId,
      usuarioId: getUserIdFromToken(),
      animalId: agendamentoTemp.idAnimal
    };

    try {
      const resultado = await consumirAPIAutenticada('/Agendamento', 'POST', agendamentoParaAPI);
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

});

// 🔹 Função para carregar tipos de pagamento da API
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
