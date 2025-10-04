const urlBase = "http://localhost:5260/api";

$.ajax({
    url: urlBase + "/Pedido",
    type: "GET",
    contentType: "application/json",
    success: function (dados) {
        //console.log(dados); // Confirma que é um array


        const tabelaPedidos = $('.tbPedidos');
        tabelaPedidos.empty();

        dados.forEach(pedido => {

            const data = new Date(pedido.dataPedido);
            console.log(data.toLocaleString("pt-BR")); // → "02/10/2025 02:04"
            const dataFormatada = data.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false // usa formato 24h (sem AM/PM)
            });

            const linha = `
                <tr>
                    <td>${pedido.id}</td>
                    <td>${pedido.nomeCliente}</td>
                    <td>${dataFormatada}</td>
                    <td>${pedido.status}</td>
                    <td>R$ ${pedido.valorTotal}</td>
                    <td>
                        <button title="Ver"><a href="detalhespedidos.html?idPedido=${pedido.id}" title="Ver">👁</a></button>
                        <button title="Editar">✏️</button>
                        <button title="Excluir">🗑</button>
                    </td>
                </tr>
            `;
            tabelaPedidos.append(linha);
        });
    },
    error: function (erro) {
        console.log('Deu erro!', erro);
    }
});