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




/* RESPONSIVE CAROUSEL HELPER
   - Adds prev/next buttons to horizontal scrollers if not present
   - Enables mouse-drag and touch-drag
   - Lightweight, vanilla JS
*/

(function () {
  const SCROLL_AMOUNT = 320; // how much to scroll on button click (px)

  function makeDraggable(el) {
    let isDown = false;
    let startX;
    let scrollLeft;

    el.addEventListener('mousedown', (e) => {
      isDown = true;
      el.classList.add('dragging');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      e.preventDefault();
    });

    el.addEventListener('mouseleave', () => { isDown = false; el.classList.remove('dragging'); });
    el.addEventListener('mouseup', () => { isDown = false; el.classList.remove('dragging'); });
    el.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.1; // scroll-fast
      el.scrollLeft = scrollLeft - walk;
    });

    // touch events
    let touchStartX = 0, touchScrollLeft = 0;
    el.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = el.scrollLeft;
    }, {passive: true});
    el.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX;
      const walk = (x - touchStartX) * 1.1;
      el.scrollLeft = touchScrollLeft - walk;
    }, {passive: true});
  }

  function addControlsIfNeeded(track) {
    // only add controls for wide screens or if user wants them; we add but hide in CSS for tiny screens
    const wrapper = track.parentElement;
    if (!wrapper) return;

    // Avoid duplicate controls
    if (wrapper.querySelector('.carousel-prev')) return;

    const prev = document.createElement('button');
    prev.className = 'carousel-btn prev';
    prev.setAttribute('aria-label', 'Previous');
    prev.innerHTML = '‹'; 

    const next = document.createElement('button');
    next.className = 'carousel-btn next'; 
    next.setAttribute('aria-label', 'Next');
    next.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>';

    prev.addEventListener('click', () => {
      track.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
      track.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    });

    // append to parent, so absolute positioning works (parent should be positioned or body)
    wrapper.style.position = wrapper.style.position || 'relative';
    wrapper.appendChild(prev);
    wrapper.appendChild(next);
  }

  function initCarousel(selector) {
    const tracks = document.querySelectorAll(selector);
    tracks.forEach(track => {
      // only proceed if there are children
      if (!track.children || track.children.length === 0) return;

      // add draggable behavior
      makeDraggable(track);

      // add prev/next controls
      addControlsIfNeeded(track);

      // keyboard accessibility: left/right to scroll when focused
      track.tabIndex = track.tabIndex || 0;
      track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') track.scrollBy({ left: 260, behavior: 'smooth' });
        if (e.key === 'ArrowLeft') track.scrollBy({ left: -260, behavior: 'smooth' });
      });
    });
  }

  // Initialize for the existing selectors used by CSS
  document.addEventListener('DOMContentLoaded', function () {
    // INFORMATION: your .card-information is the scroller
    initCarousel('#information .card-information');

    // // SERVICE: two containers
    // initCarousel('.service-card-container-one');
    // initCarousel('.service-card-container-two');
  });
})();


