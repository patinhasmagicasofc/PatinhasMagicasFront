document.addEventListener("DOMContentLoaded", async () => {
    // if (!verificarAcesso('administrador')) {
    //     window.location.href = 'login.html';
    //     return;
    // }

    const ADD_ENDPOINT = '/Produto';
    const form = document.getElementById("formProduto");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Monta o objeto produto com os campos do formulário
        // const produto = {
        //     nome: document.getElementById("nome").value,
        //     preco: parseFloat(document.getElementById("preco").value),
        //     especie: document.getElementById("especie").value,
        //     marca: document.getElementById("marca").value,
        //     urlImagem: document.getElementById("urlImagem").value,
        //     codigo: document.getElementById("codigo").value,
        //     descricao: document.getElementById("descricao").value,
        //     descricaoDetalhada: document.getElementById("descricaoDetalhada").value,
        //     validade: document.getElementById("validade").value,
        //     categoriaId: parseInt(document.getElementById("categoriaId").value)
        // };

        const produto = {
            nome: "Ração Premium para Cães Adultos 10kg",
            preco: 149.90,
            especie: "Cachorro",
            marca: "Golden",
            urlImagem: "https://meusite.com/imagens/racao-golden-10kg.jpg",
            codigo: "RAC-CAO-10KG-001",
            descricao: "Ração premium completa e balanceada para cães adultos.",
            descricaoDetalhada: "Ração Golden Fórmula Premium Especial, sabor frango e arroz. Rica em proteínas, vitaminas e minerais. Indicada para cães adultos de médio e grande porte.",
            validade: "2025-12-31T00:00:00",
            categoriaId: 3
        };

        console.log("Produto a ser cadastrado:", produto);
        await cadastrarProduto(produto);
    });

    async function cadastrarProduto(produto) {
        try {
            if (!validarLogin()) return;

            const data = await consumirAPIAutenticada(ADD_ENDPOINT, 'POST', produto);

            if (!data) {
                console.error('Erro ao cadastrar produto: tente novamente.');
                console.error('❌ Erro ao cadastrar produto', error);
                return;
            }

            mostrarToast("✅ Produto cadastrado com sucesso!", "sucesso");

            console.log('✅ Produto cadastrado com sucesso:', data);
        } catch (error) {
            console.error('❌ Erro ao cadastrar produto', error);
            mostrarToast("❌ Erro ao cadastrar produto.", "erro");
        }
    }
});

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


// Máscara de preço
const precoInput = document.getElementById('preco');
precoInput.addEventListener('input', function (e) {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2) + '';
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    e.target.value = valor;
});

const costPrecoInput = document.getElementById('cost-price');
costPrecoInput.addEventListener('input', function (e) {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2) + '';
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    e.target.value = valor;
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