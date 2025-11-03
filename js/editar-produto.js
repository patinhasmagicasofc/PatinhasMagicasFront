document.addEventListener("DOMContentLoaded", async () => {
    if (!verificarAcesso(['administrador'])) return;

    const params = new URLSearchParams(document.location.search);
    const idProduto = params.get("idProduto");

    const GETBYPID_ENDPOINT = `/Produto/${idProduto}`;
    const UPDATE_ENDPOINT = `/Produto/${idProduto}`;

    const loadingContainer = document.getElementById("loading-container");
    const form = document.getElementById("formProduto");
    const campos = form.querySelectorAll("input, select, textarea");
    const btnSalvar = form.querySelector(".btn-save");
    const btnCancelar = form.querySelector(".btn-cancel");

    // Criar botão Editar dinamicamente
    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.textContent = "Editar";
    btnEditar.classList.add("btn-edit");
    form.querySelector(".actions").prepend(btnEditar);

    // Inicialmente campos desabilitados e apenas Editar habilitado
    campos.forEach(c => c.disabled = true);
    btnSalvar.disabled = true;
    btnCancelar.disabled = true;
    btnEditar.disabled = false;

    // Guardar valores originais para Cancelar
    let valoresOriginais = [];

    try {
        mostrarLoading(true);

        // Primeiro carregamos categorias e espécies
        await carregarCategoria();
        await carregarEspecies();

        // Depois buscamos o produto
        const produto = await consultarProduto();
        console.log("Produto a ser atualizado:", produto);

        if (produto) {
            preencherProduto(produto);
            // Armazena valores originais após preencher
            valoresOriginais = Array.from(campos).map(c => c.value);
        }

    } finally {
        mostrarLoading(false);
    }

    // --- Botão Editar ---
    btnEditar.addEventListener("click", () => {
        campos.forEach(c => c.disabled = false);
        btnSalvar.disabled = false;
        btnCancelar.disabled = false;
        btnEditar.disabled = true;
    });

    // --- Botão Cancelar ---
    btnCancelar.addEventListener("click", () => {
        campos.forEach((c, i) => {
            c.value = valoresOriginais[i];
            c.disabled = true;
        });
        btnSalvar.disabled = true;
        btnCancelar.disabled = true;
        btnEditar.disabled = false;
    });

    // --- Submissão / Salvar ---
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const validadeInput = document.getElementById("validade").value;
        const produto = {
            nome: document.getElementById("nome").value,
            preco: parseFloat(document.getElementById("preco").value.replace(/\./g, '').replace(',', '.')),
            especieId: parseInt(document.getElementById("especie").value),
            marca: document.getElementById("marca").value,
            urlImagem: document.getElementById("urlImagem").value,
            codigo: document.getElementById("codigo").value,
            descricao: document.getElementById("descricao").value,
            descricaoDetalhada: document.getElementById("descricaoDetalhada").value,
            validade: validadeInput ? validadeInput : null,
            categoriaId: parseInt(document.getElementById("categoria").value),
        };

        try {
            mostrarLoading(true);
            const data = await consumirAPIAutenticada(UPDATE_ENDPOINT, 'PUT', produto);

            if (!data) {
                console.error('Erro ao atualizar produto: tente novamente.');
                return;
            }

            mostrarToast("✅ Produto atualizado com sucesso!", "sucesso");
            console.log('✅ Produto atualizado com sucesso:', data);

            // Atualiza valores originais após salvar
            valoresOriginais = Array.from(campos).map(c => c.value);
            campos.forEach(c => c.disabled = true);
            btnSalvar.disabled = true;
            btnCancelar.disabled = true;
            btnEditar.disabled = false;

        } catch (error) {
            console.error('❌ Erro ao atualizar produto', error);
            mostrarToast("❌ Erro ao atualizar produto.", "erro");
        } finally {
            mostrarLoading(false);
        }
    });

    // --- Funções auxiliares ---
    function mostrarLoading(exibir) {
        if (loadingContainer) {
            loadingContainer.style.display = exibir ? "flex" : "none";
        }
    }

    function preencherProduto(produto) {
        document.getElementById('nome').value = produto.nome || '';
        document.getElementById('preco').value = produto.preco || '';
        document.getElementById('descricao').value = produto.descricao || '';
        document.getElementById('marca').value = produto.marca || '';
        document.getElementById('urlImagem').value = produto.urlImagem || '';
        document.getElementById('codigo').value = produto.codigo || '';
        document.getElementById('descricaoDetalhada').value = produto.descricaoDetalhada || '';
        document.getElementById('validade').value = produto.validade?.split('T')[0] || '';

        const categoriaSelect = document.getElementById('categoria');
        categoriaSelect.value = produto.categoriaId || '';

        const especieSelect = document.getElementById('especie');
        especieSelect.value = produto.especieId || '';
    }

    async function consultarProduto() {
        try {
            const data = await consumirAPIAutenticada(GETBYPID_ENDPOINT, 'GET');
            if (!data) {
                mostrarToast("❌ Erro ao consultar produto.", "erro");
                return null;
            }
            return data;
        } catch (error) {
            mostrarToast("❌ Erro ao consultar produto.", "erro");
            return null;
        }
    }

    async function carregarCategoria() {
        try {
            const data = await consumirAPIAutenticada('/Categoria', 'GET');
            const selectCategoria = document.getElementById('categoria');
            if (!selectCategoria || !data) return;

            selectCategoria.innerHTML = '';
            data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                selectCategoria.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    async function carregarEspecies() {
        try {
            const data = await consumirAPIAutenticada('/Especie', 'GET');
            const selectEspecie = document.getElementById('especie');
            if (!selectEspecie || !data) return;

            selectEspecie.innerHTML = '';
            data.forEach(especie => {
                const option = document.createElement('option');
                option.value = especie.id;
                option.textContent = especie.nome;
                selectEspecie.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar espécies:', error);
        }
    }
});
