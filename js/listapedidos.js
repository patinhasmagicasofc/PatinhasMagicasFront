let currentPage = 1;
let pageSize = 5;

$(document).ready(async function () {

    if (!verificarAcesso('administrador')) {
        window.location.href = 'login.html';
        return;
    }

    await carregarStatusPedidos();
    await loadPage(currentPage, pageSize);

    // Eventos
    $('#btnPrev').on('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadPage(currentPage, pageSize);
        }
    });

    $('#btnNext').on('click', () => {
        currentPage++;
        loadPage(currentPage, pageSize);
    });

    $('#btnFiltrar').on('click', () => {
        currentPage = 1;
        loadPage(currentPage, pageSize);
    });

    loadPage(currentPage, pageSize);

    $.ajax({
        url: urlBase + "/StatusPedido",
        type: "GET",
        contentType: "application/json",
        success: function (dados) {
            const statusPedido = $('#status-pedidos');
            dados.forEach(status => {
                const option = `<option value="${status.nome}">${status.nome}</option>`;
                statusPedido.append(option);
            });
        },
        error: function (erro) {
            console.log('Deu erro!', erro);
        }
    });


    // Captura o clique no botão de filtro
    $('#btnFiltrar').on('click', function (event) {
        event.preventDefault(); // evita reload da página
        loadPage(); // carrega os pedidos com os filtros
    });
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


//função filters
const btnFilters = document.querySelector('#btn-filters-expandir');
const sidebar = document.querySelector('.filters-exp');
const main = document.querySelector('main');

btnFilters.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.toggle('open');
  main.classList.toggle('shifted'); 
});


// Fechar painel ao clicar fora
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !btnFilters.contains(e.target)) {
      sidebar.classList.remove('open');
      main.classList.remove('shifted');
    }
  });




//menu-options
document.addEventListener("click", (e) => {
    const menus = document.querySelectorAll(".menu-container");
  
    menus.forEach(menu => {
      if (!menu.contains(e.target)) {
        menu.classList.remove("open");
      }
    });
  

    if (e.target.closest(".menu-btn")) {
      const btn = e.target.closest(".menu-container");
      btn.classList.toggle("open");
    }
  });
  


