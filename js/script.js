const elements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

elements.forEach(el => observer.observe(el));



const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");

// Abrir/fechar menu ao clicar no hamburger
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  menu.classList.toggle("active");
});

// Fecha o menu ao clicar em um link
document.querySelectorAll(".menu a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    menu.classList.remove("active");
  });
});

// Fecha o menu ao clicar fora dele
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    hamburger.classList.remove("active");
    menu.classList.remove("active");
  }
});


