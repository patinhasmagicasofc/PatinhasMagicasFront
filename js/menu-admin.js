// Assim que a página carregar...
document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("menu-container");

    try {
        const resposta = await fetch("/menu-admin.html");
        const html = await resposta.text();
        container.innerHTML = html;

        // Depois de injetar, chama a função que marca o item ativo
        destacarMenuAtivo();
    } catch (erro) {
        console.error("Erro ao carregar o menu:", erro);
    }
});

function destacarMenuAtivo() {
    const caminho = window.location.pathname.split('/').pop(); 
    const links = document.querySelectorAll('.item-menu a');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === caminho) {
            link.parentElement.classList.add('ativo');
        }
    });
}
