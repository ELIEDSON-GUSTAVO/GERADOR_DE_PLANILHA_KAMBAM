let itens = [];
let editandoItemIndex = -1;
let editandoPecaIndex = -1;

// Função para adicionar ou editar um item
function adicionarOuEditarItem() {
    const nomeItem = document.getElementById("itemNome").value.trim();
    if (!nomeItem) {
        alert("Por favor, insira um nome para o item.");
        return;
    }

    if (editandoItemIndex === -1) {
        itens.push({ nome: nomeItem, pecas: [] });
    } else {
        itens[editandoItemIndex].nome = nomeItem;
        editandoItemIndex = -1;
    }

    document.getElementById("itemNome").value = "";
    atualizarListaItens();
    atualizarSelectItens();
}

// Função para adicionar ou editar uma peça
function adicionarOuEditarPeca() {
    const codigoPeca = document.getElementById("pecaCodigo").value.trim();
    const quantidade = parseInt(document.getElementById("pecaQuantidade").value.trim());
    const unidade = document.getElementById("pecaUnidade").value.trim();
    const descricao = document.getElementById("pecaDescricao").value.trim();
    const itemSelecionadoIndex = document.getElementById("itemSelect").value;

    if (itemSelecionadoIndex === "") {
        alert("Por favor, selecione um item.");
        return;
    }

    if (!codigoPeca || isNaN(quantidade) || quantidade <= 0 || !unidade || !descricao) {
        alert("Por favor, preencha todos os campos da peça.");
        return;
    }

    const itemIndex = parseInt(itemSelecionadoIndex);
    if (editandoPecaIndex === -1) {
        itens[itemIndex].pecas.push({ codigo: codigoPeca, quantidade, unidade, descricao });
    } else {
        itens[itemIndex].pecas[editandoPecaIndex] = { codigo: codigoPeca, quantidade, unidade, descricao };
        editandoPecaIndex = -1;
    }

    document.getElementById("pecaCodigo").value = "";
    document.getElementById("pecaQuantidade").value = "";
    document.getElementById("pecaUnidade").value = "";
    document.getElementById("pecaDescricao").value = "";
    atualizarListaPecas(itemIndex);
}

// Atualiza a lista de itens na tabela
function atualizarListaItens() {
    const itensBody = document.getElementById("itensBody");
    itensBody.innerHTML = "";
    itens.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.pecas.length} peças</td>
            <td>
                <button onclick="editarItem(${index})">Editar</button>
                <button onclick="excluirItem(${index})">Excluir</button>
                <button onclick="verPecas(${index})">Ver Peças</button>
            </td>
        `;
        itensBody.appendChild(tr);
    });
}

// Atualiza o select de itens para adicionar peças
function atualizarSelectItens() {
    const itemSelect = document.getElementById("itemSelect");
    itemSelect.innerHTML = `<option value="">Selecione um item</option>`;
    itens.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = item.nome;
        itemSelect.appendChild(option);
    });
}

// Atualiza a lista de peças do item selecionado
function atualizarListaPecas(itemIndex) {
    const pecasList = document.getElementById("pecasList");
    pecasList.innerHTML = "";
    itens[itemIndex].pecas.forEach((peca, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            Código: ${peca.codigo}, Quantidade: ${peca.quantidade}, Unidade: ${peca.unidade}, Descrição: ${peca.descricao}
            <button onclick="editarPeca(${itemIndex}, ${index})">Editar</button>
            <button onclick="excluirPeca(${itemIndex}, ${index})">Excluir</button>
        `;
        pecasList.appendChild(li);
    });
}

// Editar item
function editarItem(index) {
    document.getElementById("itemNome").value = itens[index].nome;
    editandoItemIndex = index;
}

// Excluir item
function excluirItem(index) {
    if (confirm("Tem certeza de que deseja excluir este item?")) {
        itens.splice(index, 1);
        atualizarListaItens();
        atualizarSelectItens();
    }
}

// Ver peças do item
function verPecas(index) {
    atualizarListaPecas(index);
}

// Editar peça
function editarPeca(itemIndex, pecaIndex) {
    const peca = itens[itemIndex].pecas[pecaIndex];
    document.getElementById("pecaCodigo").value = peca.codigo;
    document.getElementById("pecaQuantidade").value = peca.quantidade;
    document.getElementById("pecaUnidade").value = peca.unidade;
    document.getElementById("pecaDescricao").value = peca.descricao;
    editandoPecaIndex = pecaIndex;
}

// Excluir peça
function excluirPeca(itemIndex, pecaIndex) {
    if (confirm("Tem certeza de que deseja excluir esta peça?")) {
        itens[itemIndex].pecas.splice(pecaIndex, 1);
        atualizarListaPecas(itemIndex);
    }
}

// Exportar dados para JSON
function salvarComoJson() {
    const blob = new Blob([JSON.stringify(itens, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "itens_e_pecas.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Importar dados de JSON
function importarJson(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const importedData = JSON.parse(e.target.result);
            itens = importedData;
            atualizarListaItens();
            atualizarSelectItens();
        };
        reader.readAsText(file);
    }
}
