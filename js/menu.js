// ===================== MENU DINÂMICO =====================
async function carregarMenu() {
  const logado = localStorage.getItem("authToken") !== null;
  const arquivo = logado ? "/menu-logado.html" : "/menu-deslogado.html";
  const menuContainer = document.getElementById("menu-container");

  try {
    const response = await fetch(arquivo);
    const html = await response.text();
    menuContainer.innerHTML = html;

    protegerLinks();
    initDropdowns();
    initDropdownPerfil();
    initHamburgerMenu();

    const user = getUserFromToken();
    if (user) {
      const nomeElemento = document.getElementById("nomeUsuario");
      if (nomeElemento) nomeElemento.textContent = user.unique_name;

      const perfil = user.role?.toLowerCase();
      const menuAdmin = document.getElementById("menuAdmin");

      if (perfil === "administrador" && menuAdmin) menuAdmin.style.display = "block";
      else if (menuAdmin) menuAdmin.style.display = "none";
    }

    atualizarContagemCarrinho();
  } catch (err) {
    console.error("Erro ao carregar o menu:", err);
  }
}

document.addEventListener("DOMContentLoaded", carregarMenu);
function atualizarMenu() { carregarMenu(); }

// ===================== PROTEÇÃO DE LINKS =====================
function protegerLinks() {
  const links = document.querySelectorAll(".exige-login");
  links.forEach(link => {
    link.addEventListener("click", function (e) {
      const logado = localStorage.getItem("authToken") !== null;
      if (!logado) {
        e.preventDefault();
        localStorage.setItem("paginaAnterior", this.getAttribute("href"));
        window.location.href = "/pages/public/login.html";
      }
    });
  });
}

// ===================== DROPDOWNS =====================
function initDropdowns() {
  const dropdowns = document.querySelectorAll(".shopping-cart-order-service .dropdown");
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector("a");
    if (!link.classList.contains("cart-link") && !link.classList.contains("order-title")) {
      link.addEventListener("click", e => {
        e.preventDefault();
        dropdowns.forEach(item => {
          if (item !== dropdown) item.classList.remove("ativo");
        });
        dropdown.classList.toggle("ativo");
      });
    }
  });

  document.addEventListener("click", e => {
    if (![...dropdowns].some(dropdown => dropdown.contains(e.target))) {
      dropdowns.forEach(dropdown => dropdown.classList.remove("ativo"));
    }
  });
}

// ===================== DROPDOWN PERFIL =====================
function initDropdownPerfil() {
  const dropdownsPerfil = document.querySelectorAll(".dropdown-perfil");
  dropdownsPerfil.forEach(item => {
    item.addEventListener("click", e => {
      if (e.target.closest(".perfil-img")) {
        e.preventDefault();
        item.classList.toggle("ativo");
      }
    });
  });

  document.addEventListener("click", e => {
    if (![...dropdownsPerfil].some(item => item.contains(e.target))) {
      dropdownsPerfil.forEach(item => item.classList.remove("ativo"));
    }
  });
}

// ===================== MENU LATERAL (HAMBÚRGUER) =====================
function initHamburgerMenu() {
  const hamburger = document.getElementById("hamburger");
  const sideMenu = document.getElementById("sideMenu");
  const closeBtn = document.getElementById("closeMenu");

  if (!hamburger || !sideMenu) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    sideMenu.classList.toggle("active");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      hamburger.classList.remove("active");
      sideMenu.classList.remove("active");
    });
  }

  document.addEventListener("click", e => {
    if (
      sideMenu.classList.contains("active") &&
      !sideMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      hamburger.classList.remove("active");
      sideMenu.classList.remove("active");
    }
  });
}

// ===================== LOGOUT / CARRINHO =====================
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userProfile");
  if (typeof atualizarMenu === "function") atualizarMenu();
  window.location.href = "/pages/public/login.html";
}

function atualizarContagemCarrinho() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const totalItens = cart.reduce((sum, item) => sum + item.quantidade, 0);
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) cartCountEl.textContent = totalItens;
}
