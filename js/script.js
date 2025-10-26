const elements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

elements.forEach(el => observer.observe(el));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;

  if (tipo === "erro") {
    toast.style.backgroundColor = "#d9534f";
  } else if (tipo === "aviso") {
    toast.style.backgroundColor = "#f0ad4e";
  } else {
    toast.style.backgroundColor = "#5cb85c";
  }

  toast.className = "toast show";
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}