// js/dados.js
// Array dinâmico de produtos. Edite, adicione ou carregue mais no futuro.
const produtos = [
  {
    id: 1,
    nome: "Ração Premium Adulto",
    marca: "Golden Pet",
    preco: 129.90,
    imagem: "https://via.placeholder.com/400x300?text=Racao+Premium",
    descricao: "Ração completa para cães adultos.",
    descricaoDetalhada: "Alimentação balanceada com proteínas de alta qualidade.",
    categoria: "Alimentos",
    estoque: 12,
    codigo: 1001,
    validade: "2026-03-20"
  },
  {
    id: 2,
    nome: "Shampoo Antipulgas",
    marca: "PetClean",
    preco: 39.90,
    imagem: "https://via.placeholder.com/400x300?text=Shampoo",
    descricao: "Shampoo antipulgas e carrapatos.",
    descricaoDetalhada: "Ação prolongada e suave para peles sensíveis.",
    categoria: "Higiene",
    estoque: 5,
    codigo: 1002,
    validade: "2027-01-01"
  },
  {
    id: 3,
    nome: "Brinquedo Bola de Corda",
    marca: "FunPet",
    preco: 19.50,
    imagem: "https://via.placeholder.com/400x300?text=Brinquedo",
    descricao: "Brinquedo resistente para roer e puxar.",
    descricaoDetalhada: "Corda trançada com núcleo de borracha.",
    categoria: "Brinquedos",
    estoque: 0,
    codigo: 1003,
    validade: "2099-12-31"
  },
  {
    id: 4,
    nome: "Coleira Nylon P",
    marca: "SecurePet",
    preco: 24.90,
    imagem: "https://via.placeholder.com/400x300?text=Coleira",
    descricao: "Coleira ajustável para cães pequenos.",
    descricaoDetalhada: "Material resistente e fivela segura.",
    categoria: "Acessórios",
    estoque: 18,
    codigo: 1004,
    validade: "2099-12-31"
  },
  // --- adicione mais produtos para testar paginação ---
  {
    id: 5, nome: "Ração Filhote", marca: "Golden Pet", preco: 139.90,
    imagem: "https://via.placeholder.com/400x300?text=Racao+Filhote",
    descricao: "Ração para filhotes com crescimento saudável.",
    descricaoDetalhada: "", categoria: "Alimentos", estoque: 7, codigo: 1005, validade: "2026-11-11"
  },
  {
    id: 6, nome: "Pente Desembaraçador", marca: "Groomer", preco: 29.90,
    imagem: "https://via.placeholder.com/400x300?text=Pente", descricao: "Ideal para pelos médios e longos.",
    descricaoDetalhada: "", categoria: "Higiene", estoque: 10, codigo: 1006, validade: "2099-12-31"
  },
  {
    id: 7, nome: "Comedouro Inox", marca: "StainlessPet", preco: 49.90,
    imagem: "https://via.placeholder.com/400x300?text=Comedouro", descricao: "Comedouro anti-derrapante.",
    descricaoDetalhada: "", categoria: "Acessórios", estoque: 3, codigo: 1007, validade: "2099-12-31"
  },
  {
    id: 8, nome: "Tapete Higiênico 50un", marca: "HigPet", preco: 24.99,
    imagem: "https://via.placeholder.com/400x300?text=Tapete", descricao: "Absorção rápida para filhotes.",
    descricaoDetalhada: "", categoria: "Higiene", estoque: 25, codigo: 1008, validade: "2026-05-05"
  },
  {
    id: 9, nome: "Remédio Vermífugo", marca: "VetCare", preco: 59.90,
    imagem: "https://via.placeholder.com/400x300?text=Vermifugo", descricao: "Dose única para cães até 10kg.",
    descricaoDetalhada: "", categoria: "Saúde", estoque: 6, codigo: 1009, validade: "2026-09-09"
  },
  {
    id: 10, nome: "Ração Sênior", marca: "SeniorPet", preco: 149.90,
    imagem: "https://via.placeholder.com/400x300?text=Racao+Senior", descricao: "Fórmula para cães idosos.",
    descricaoDetalhada: "", categoria: "Alimentos", estoque: 9, codigo: 1010, validade: "2027-07-07"
  }
];
