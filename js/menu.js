// ===================== MENU DINÂMICO =====================
async function carregarMenu() {
  const logado = localStorage.getItem('authToken') !== null;
  const arquivo = logado ? "/menu-logado.html" : "/menu-deslogado.html";
  const menuContainer = document.getElementById("menu-container");

  try {
    const response = await fetch(arquivo);
    const html = await response.text();
    menuContainer.innerHTML = html;

    // Depois que o menu foi carregado, protegemos link e inicializamos dropdowns
    protegerLinks();
    initDropdowns();
    initDropdownPerfil();


    const user = getUserFromToken();

    if (user) {
      console.log(user.unique_name);

      const nomeElemento = document.getElementById('nomeUsuario');
      if (nomeElemento) {
        nomeElemento.textContent = user.unique_name;
      }

      // 👇 Controle de exibição do menu admin (dentro do IF)
      const perfil = user.role?.toLowerCase(); // garante que não quebre
      const menuAdmin = document.getElementById("menuAdmin");

      console.log("Perfil do usuário:", perfil);

      if (perfil === "administrador" && menuAdmin) {
        menuAdmin.style.display = "block"; // mostra o item
      } else if (menuAdmin) {
        menuAdmin.style.display = "none"; // mantém oculto
      }
    }

    // Atualiza a contagem do carrinho
    atualizarContagemCarrinho();

  } catch (err) {
    console.error("Erro ao carregar o menu:", err);
  }
}

// Inicializa menu no carregamento da página
document.addEventListener("DOMContentLoaded", carregarMenu);

// Função pública para atualizar menu dinamicamente
function atualizarMenu() {
  carregarMenu();
}

// ===================== PROTEÇÃO DE LINKS =====================
function protegerLinks() {
  const links = document.querySelectorAll('.exige-login');

  links.forEach(link => {
    link.addEventListener('click', function (e) {
      const logado = localStorage.getItem('authToken') !== null;
      if (!logado) {
        e.preventDefault(); // impede ir direto para a página
        // salva a página de destino
        localStorage.setItem('paginaAnterior', this.getAttribute('href'));
        // redireciona para login
        window.location.href = '/pages/public/login.html';
      }
    });
  });
}

// ===================== DROPDOWN MENU =====================
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.shopping-cart-order-service .dropdown');

  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');

    if (!link.classList.contains('cart-link') && !link.classList.contains('order-title')) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        dropdowns.forEach(item => {
          if (item !== dropdown) item.classList.remove('ativo');
        });
        dropdown.classList.toggle('ativo');
      });
    }
  });

  document.addEventListener('click', e => {
    if (![...dropdowns].some(dropdown => dropdown.contains(e.target))) {
      dropdowns.forEach(dropdown => dropdown.classList.remove('ativo'));
    }
  });
}

// ===================== DROPDOWN PERFIL =====================
function initDropdownPerfil() {
  const dropdownsPerfil = document.querySelectorAll('.dropdown-perfil');

  function toggleDropdown(e) {
    if (e.target.closest('.perfil-img')) {
      e.preventDefault();
      if (this.classList.contains('ativo')) {
        this.classList.remove('ativo');
      } else {
        dropdownsPerfil.forEach(item => item.classList.remove('ativo'));
        this.classList.add('ativo');
      }
    }
  }

  dropdownsPerfil.forEach(item => item.addEventListener('click', toggleDropdown));

  document.addEventListener('click', (e) => {
    if (![...dropdownsPerfil].some(item => item.contains(e.target))) {
      dropdownsPerfil.forEach(item => item.classList.remove('ativo'));
    }
  });
}


function logout() {
  // 1️⃣ Remove dados de autenticação
  localStorage.removeItem('authToken');
  localStorage.removeItem('userProfile');

  // 2️⃣ Atualiza o menu para versão deslogada
  if (typeof atualizarMenu === "function") {
    atualizarMenu();
  }

  // 3️⃣ Redireciona para página pública
  window.location.href = '/pages/public/login.html';
}

function atualizarContagemCarrinho() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItens = cart.reduce((sum, item) => sum + item.quantidade, 0);
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = totalItens;
  }
}

