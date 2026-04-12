


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
  pawBtn.style.display = (document.documentElement.scrollTop > 200) ? "block" : "none";
};

// Função de rolagem suave + animação de patinhas
pawBtn.onclick = function() {
  const pawTrail = document.createElement("div");
  pawTrail.classList.add("paw-trail");
  document.body.appendChild(pawTrail);
  setTimeout(() => pawTrail.remove(), 2000);
  window.scrollTo({ top: 0, behavior: "smooth" });
};


//card
const cards = document.querySelectorAll(
  '.card-banho-tosa, .card-adestramento-comportamento, .card-atendimento-vet, .card-hospedagem-creche, .card-transporte-pet'
);

cards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 🔽 movimento bem leve (como você pediu)
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-3px)
      scale(1.01)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0)
      scale(1)
    `;
  });
});