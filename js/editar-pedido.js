if (!verificarAcesso(['administrador'])) return;

const el = id => document.getElementById(id);

window.addEventListener('message', e => {
    if (!e.data) return;
    if (e.data.type === 'editor:load') fillForm(e.data.payload);
});

function getFormData() {
    return {
        id: el('orderId').textContent.replace('#', '').trim(),
        status: el('status').value,
        paymentMethod: el('payment').value,
        receiver: el('receiver').value,
        phone: el('phone').value,
        street: el('street').value,
        city: el('city').value,
        zip: el('zip').value,
        adminNote: el('note').value
    };
}

function fillForm(order) {
    if (!order) return;
    el('orderId').textContent = '#' + (order.id ?? '');
    el('status').value = order.status ?? 'Pendente';
    el('payment').value = order.paymentMethod ?? 'Pix';
    el('receiver').value = order.delivery?.name ?? order.client?.name ?? '';
    el('phone').value = order.delivery?.phone ?? '';
    el('street').value = order.delivery?.street ?? '';
    el('city').value = order.delivery?.city ?? '';
    el('zip').value = order.delivery?.zip ?? '';
    el('note').value = order.adminNote ?? '';
}

function post(type, payload) { parent.postMessage({ type, payload }, '*'); }

el('btnCancel').addEventListener('click', () => post('editor:cancel'));
el('btnApply').addEventListener('click', () => post('editor:apply', getFormData()));
el('btnSave').addEventListener('click', () => post('editor:save', getFormData()));

post('editor:ready');