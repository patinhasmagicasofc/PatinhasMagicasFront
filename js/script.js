


// ======== REVEAL ANIMATION ========
const elements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    } else {
      entry.target.classList.remove('active');
    }
  });
}, { threshold: 0.1 });

elements.forEach(el => observer.observe(el));

// ======== TOAST ========
function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;

  switch (tipo) {
    case "erro":
      toast.style.backgroundColor = "#d9534f";
      break;
    case "aviso":
      toast.style.backgroundColor = "#f0ad4e";
      break;
    default:
      toast.style.backgroundColor = "#5cb85c";
  }

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}





 
//botãoHome
const pawBtn = document.getElementById("pawTopBtn");
window.onscroll = function() {
  pawBtn.style.display = (document.documentElement.scrollTop > 300) ? "block" : "none";
};

// Função de rolagem suave + animação de patinhas
pawBtn.onclick = function() {
  const pawTrail = document.createElement("div");
  pawTrail.classList.add("paw-trail");
  document.body.appendChild(pawTrail);
  setTimeout(() => pawTrail.remove(), 2000);
  window.scrollTo({ top: 0, behavior: "smooth" });
};