// Assim que a página carregar...
document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("footer-container");

    try {
        const resposta = await fetch("/footer.html");
        const html = await resposta.text();
        container.innerHTML = html;
    } catch (erro) {
        console.error("Erro ao carregar o footer:", erro);
    }
});