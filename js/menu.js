async function carregarMenu() {
  const logado = localStorage.getItem('authToken');
  console.log(logado)
  const arquivo = logado ? "menu-logado.html" : "menu-deslogado.html";
  const menuContainer = document.getElementById("menu-container");

  const response = await fetch(arquivo);
  const html = await response.text();
  menuContainer.innerHTML = html;
}

// Executa quando a página carregar
document.addEventListener("DOMContentLoaded", carregarMenu);
