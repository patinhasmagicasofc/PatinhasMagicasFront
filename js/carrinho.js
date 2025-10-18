function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}
function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function removeFromCart(id) {
    let cart = getCart().filter(item => item.id !== id);
    setCart(cart);
}

function updateQuantity(id, quantidade) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantidade = quantidade > 0 ? quantidade : 1;
        setCart(cart);
    }
}

function calcularTotal(cart) {
    let total = 0;
    for (const item of cart) {
        const produto = produtos.find(p => p.id === item.id);
        total += produto.preco * item.quantidade;
    }
    return total;
}

document.getElementById('btnCheckout').addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) return;
    window.location.href = "checkout.html";
});

document.addEventListener('DOMContentLoaded', renderCart);
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

