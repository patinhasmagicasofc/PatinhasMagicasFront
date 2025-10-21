//carrosel
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
const carousel = document.querySelector('.product-carousel');

const scrollAmount = 250; // quanto cada clique vai deslizar

nextBtn.addEventListener('click', () => {
  carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

prevBtn.addEventListener('click', () => {
  carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});


//menu itens
const dropdowns = document.querySelectorAll('.shopping-cart-order-service .dropdown');

dropdowns.forEach(dropdown => {
  const link = dropdown.querySelector('a');

  link.addEventListener('click', function(e) {
    e.preventDefault();

    dropdowns.forEach(item => {
      if (item !== dropdown) {
        item.classList.remove('ativo');
      }
    });

    dropdown.classList.toggle('ativo');
  });
});

document.addEventListener('click', e => {
  if (![...dropdowns].some(dropdown => dropdown.contains(e.target))) {
    dropdowns.forEach(dropdown => dropdown.classList.remove('ativo'));
  }
});



//perfil itens
const dropdownsPerfil = document.querySelectorAll('.dropdown-perfil');

function toggleDropdown(e) {
  e.preventDefault();

  if (this.classList.contains('ativo')) {
    this.classList.remove('ativo');
  } else {
    dropdownsPerfil.forEach((item) => item.classList.remove('ativo'));
    this.classList.add('ativo');
  }
}

dropdownsPerfil.forEach((item) => item.addEventListener('click', toggleDropdown));

document.addEventListener('click', (e) => {
  if (![...dropdownsPerfil].some((item) => item.contains(e.target))) {
    dropdownsPerfil.forEach((item) => item.classList.remove('ativo'));
  }
});
