document.addEventListener("DOMContentLoaded", async () => {
    // if (!verificarAcesso('administrador')) {
    //     window.location.href = 'login.html';
    //     return;
    // }

   await carregarTiposServico();

    const ADD_ENDPOINT = '/Servico';
    const form = document.getElementById("formServico");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Monta o objeto servico com os campos do formulário
        // const servico = {
        //     nome: document.getElementById("nome").value,
        //     descricao: document.getElementById("descricao").value),
        //     descricaoDetalhada: document.getElementById("descricaoDetalhada").value,
        //     tempoEstimadoMinutos: document.getElementById("tempoEstimadoMinutos").value,
        //     tipoServicoId: parseInt(document.getElementById("tipoServicoId").value)
        // };

        const servico = {
            nome: "Nome do Serviço",
            descricao: "Descrição curta do serviço",
            descricaoDetalhada: "Descrição detalhada do serviço, explicando todos os detalhes importantes.",
            tempoEstimadoMinutos: 60,
            tipoServicoId: 1
        };

        console.log("Servico a ser cadastrado:", servico);
        await cadastrarServico(servico);
    });

    async function cadastrarServico(servico) {
        try {
            if (!validarLogin()) return;

            const data = await consumirAPIAutenticada(ADD_ENDPOINT, 'POST', servico);

            if (!data) {
                console.error('Erro ao cadastrar servico: tente novamente.');
                console.error('❌ Erro ao cadastrar servico', error);
                return;
            }

            mostrarToast("✅ Servico cadastrado com sucesso!", "sucesso");

            console.log('✅ Servico cadastrado com sucesso:', data);
        } catch (error) {
            console.error('❌ Erro ao cadastrar servico', error);
            mostrarToast("❌ Erro ao cadastrar servico.", "erro");
        }
    }
});


async function carregarTiposServico() {
    try {
        if (!validarLogin()) return;

        const data = await consumirAPIAutenticada('/TipoServico', 'GET');
        const selectTipoServico = document.getElementById('tipos-servicos');
        if (!selectTipoServico || !data) return;

        console.log('Tipos de servicos carregados:', data); 

        data.forEach(tipoServico => {
            const option = document.createElement('option');
            option.value = tipoServico.nome;
            option.textContent = tipoServico.nome;
            selectTipoServico.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar tipos de servicos:', error);
        mostrarToast("❌ Erro ao cadastrar tipos de servico.", "erro");
    }
}

//função header
const menuItem = document.querySelectorAll('.item-menu');

function selectLink() {
    menuItem.forEach((item) => item.classList.remove('ativo'));
    this.classList.add('ativo');
}

menuItem.forEach((item) => item.addEventListener('click', selectLink));

const btnExpandir = document.querySelector('#btn-exp');
const nav = document.querySelector('.menu-lateral');
const header = document.querySelector('header');

// Abrir/fechar menu
btnExpandir.addEventListener('click', (e) => {
    e.stopPropagation()
    nav.classList.toggle('expandir');
    header.classList.toggle('expandir');
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('expandir')) {
        nav.classList.remove('expandir');
        header.classList.remove('expandir');
    }
});

function mostrarToast(mensagem, tipo = "sucesso") {
    const toast = document.getElementById("toast");
    toast.textContent = mensagem;

    if (tipo === "erro") {
        toast.style.backgroundColor = "#d9534f"; // vermelho
    } else if (tipo === "aviso") {
        toast.style.backgroundColor = "#f0ad4e"; // amarelo
    } else {
        toast.style.backgroundColor = "#5cb85c"; // verde sucesso
    }

    toast.className = "toast show";
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}
