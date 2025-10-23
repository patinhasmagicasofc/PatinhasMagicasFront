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

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  menu.classList.toggle("active");
});

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



// === CARROSSEL DE PRODUTOS ===
const productCarousel = document.querySelector(".product-carousel");
const nextBtn = document.querySelector(".carousel-btn.next");
const prevBtn = document.querySelector(".carousel-btn.prev");

if (productCarousel && nextBtn && prevBtn) {
  const scrollAmount = 300; // distância do scroll por clique

  nextBtn.addEventListener("click", () => {
    productCarousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    productCarousel.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
}

