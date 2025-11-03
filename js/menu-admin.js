// Assim que a página carregar...
document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("menu-container");

    try {
        const resposta = await fetch("/menu-admin.html");
        const html = await resposta.text();       
        container.innerHTML = html; 
    } catch (erro) {
        console.error("Erro ao carregar o menu:", erro);
    }
});