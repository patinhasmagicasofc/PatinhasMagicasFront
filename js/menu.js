async function carregarMenu() {
  const logado = localStorage.getItem('authToken') === "true";
  const arquivo = logado ? "/menu-logado.html" : "/menu-deslogado.html";
  const menuContainer = document.getElementById("menu-container");

  try {
    const response = await fetch(arquivo);
    const html = await response.text();
    menuContainer.innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar o menu:", err);
  }
}

document.addEventListener("DOMContentLoaded", carregarMenu);