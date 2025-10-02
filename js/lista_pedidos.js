//urlBase da API
const urlBase = "http://localhost:5112/api"

$.ajax({
    url: urlBase + "/Pedido", //Endpoint
    type: "GET",
    contentType: "application/json",
    //se der sucesso (200) cai aqui nesse bloco
    success: function (dados) {

        //selecionar a div dos generos
        const listaPedidos = $('.order-table');
        listaPedidos.empty();

        dados.forEach(pedido => {

            const item = `<tr><th class="dropdown-item" href="produtos.html">${pedido.id}</th></tr>`;

            listaPedidos.append(item);
        });

    },
    error: function (erro) {
        console.log('Deu erro!');
    }
});