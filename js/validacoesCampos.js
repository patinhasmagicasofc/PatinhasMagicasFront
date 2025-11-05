$(document).ready(function () {
    // --- Máscaras ---
    $('#cpf').mask('000.000.000-00', { reverse: true });
    $('#cep').mask('00000-000');

    // Telefone dinâmico (8 ou 9 dígitos, sem DDD)
    function telefoneMask(val) {
        val = val.replace(/\D/g, '');
        return val.length > 8 ? '00000-0000' : '0000-00000';
    }

    $('#telefone').mask(telefoneMask, {
        onKeyPress: function (val, e, field, options) {
            field.mask(telefoneMask(val), options);
        }
    });

    // --- Validações ---
    $('#formCliente').on('submit', function (e) {
        let valido = true;
        let mensagens = [];

        const cpf = $('#cpf').val().replace(/\D/g, '');
        const cep = $('#cep').val().replace(/\D/g, '');
        const telefone = $('#telefone').val().replace(/\D/g, '');
        const nome = $('#nome').val().trim();

        if (nome.length < 3) {
            valido = false;
            mensagens.push('O nome deve ter pelo menos 3 caracteres.');
        }

        if (!validarCPF(cpf)) {
            valido = false;
            mensagens.push('CPF inválido.');
        }

        if (cep.length !== 8) {
            valido = false;
            mensagens.push('CEP inválido.');
        }

        if (telefone.length < 8 || telefone.length > 9) {
            valido = false;
            mensagens.push('Telefone inválido.');
        }

        if (!valido) {
            e.preventDefault();
            alert('Por favor, corrija os seguintes erros:\n\n' + mensagens.join('\n'));
        }
    });

    // --- Função para validar CPF ---
    function validarCPF(cpf) {
        if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        let resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
        resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        return resto === parseInt(cpf.charAt(10));
    }
});
