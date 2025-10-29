document.addEventListener("DOMContentLoaded", async () => {
  const divResumo = document.getElementById("resumoAgendamento");
  const form = document.getElementById("formFinalizar");
  const selectPagamento = document.getElementById("tipoPagamento");

  // 🔹 Adiciona modal no body
  let modal = document.getElementById("modalPagamento");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modalPagamento";
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.7)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = 1000;

    const modalConteudo = document.createElement("div");
    modalConteudo.id = "modalConteudo";
    modalConteudo.style.background = "#1f1f1f";
    modalConteudo.style.padding = "2rem";
    modalConteudo.style.borderRadius = "15px";
    modalConteudo.style.width = "360px";
    modalConteudo.style.maxWidth = "90%";
    modalConteudo.style.position = "relative";

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
        <h2>Pagamento via Pix 💸</h2>
        <div class="qr" style="background:white;padding:20px;border-radius:15px;box-shadow:0 0 20px rgba(0,0,0,0.5); text-align:center;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?data=fakepix123&size=200x200" alt="QR Code Pix">
        </div>
        <p style="color:white;text-align:center;">Escaneie o QR Code para simular o pagamento.</p>
        <button id="btnPixPago" style="margin-top:20px;background:#00e676;border:none;padding:12px 24px;border-radius:8px;color:black;font-weight:bold;cursor:pointer;">Já paguei</button>
        <p class="msg" id="msgPix">Pagamento confirmado ✅</p>
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
