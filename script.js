let itens = [];
let editandoItemIndex = -1;
let editandoPecaIndex = -1;
let pecasSelecionadas = {}; // Objeto para armazenar o estado de seleção das peças

// Função para importar dados de uma planilha hospedada no GitHub
function importarPlanilhaGitHub() {
    const url = "https://raw.githubusercontent.com/ELIEDSON-GUSTAVO/GERADOR_DE_PLANILHA_KAMBAM/344663b47aca025853e096d0be61ce8d6cc85f7d/DADOS.xlsx";


    fetch(url)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            processarImportacao(jsonData);
        })
        .catch(error => {
            console.error("Erro ao importar a planilha:", error);
            alert("Não foi possível importar a planilha do GitHub.");
        });
}

// Processa a importação dos dados
function processarImportacao(data) {
    data.forEach((linha, index) => {
        if (index === 0) return; // Ignora o cabeçalho
        const [nomeItem, codigoPeca, quantidade, unidade, descricao] = linha;
        let item = itens.find(i => i.nome === nomeItem);
        if (!item) {
            item = { nome: nomeItem, pecas: [] };
            itens.push(item);
        }
        item.pecas.push({ codigo: codigoPeca, quantidade, unidade, descricao });
    });
    atualizarListaItens();
    atualizarSelectItens();
}

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

    if (!codigoPeca || quantidade <= 0 || !unidade || !descricao) {
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
            <td><input type="checkbox" onchange="selecionarItem(${index}, this)" ${pecasSelecionadas[index] ? 'checked' : ''}></td>
            <td>${item.nome} (${item.pecas.length} peças)</td>
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

// Ver as peças de um item
function verPecas(itemIndex) {
    const pecasList = document.getElementById("pecasList");
    pecasList.innerHTML = ""; // Limpa a lista de peças

    const item = itens[itemIndex];
    item.pecas.forEach((peca, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" class="pecaCheckbox" data-item-index="${itemIndex}" data-peca-index="${index}" ${pecasSelecionadas[itemIndex] && pecasSelecionadas[itemIndex][index] ? 'checked' : ''}>
            ${peca.codigo} - ${peca.quantidade} ${peca.unidade} - ${peca.descricao}
            <button onclick="editarPeca(${itemIndex}, ${index})">Editar</button>
            <button onclick="excluirPeca(${itemIndex}, ${index})">Excluir</button>
        `;
        pecasList.appendChild(li);
    });
}

// Funções para editar e excluir
function editarItem(index) {
    const item = itens[index];
    document.getElementById("itemNome").value = item.nome;
    editandoItemIndex = index;
}

function excluirItem(index) {
    itens.splice(index, 1);
    delete pecasSelecionadas[index]; // Remove as seleções desse item
    atualizarListaItens();
    atualizarSelectItens();
}

function editarPeca(itemIndex, pecaIndex) {
    const peca = itens[itemIndex].pecas[pecaIndex];
    document.getElementById("pecaCodigo").value = peca.codigo;
    document.getElementById("pecaQuantidade").value = peca.quantidade;
    document.getElementById("pecaUnidade").value = peca.unidade;
    document.getElementById("pecaDescricao").value = peca.descricao;
    editandoPecaIndex = pecaIndex;
    document.getElementById("itemSelect").value = itemIndex;
}

function excluirPeca(itemIndex, pecaIndex) {
    itens[itemIndex].pecas.splice(pecaIndex, 1);
    verPecas(itemIndex); // Atualiza a lista de peças após a exclusão
}

// Função para gerar um arquivo Excel
function gerarExcel() {
    const wb = XLSX.utils.book_new();
    const dados = [];

    itens.forEach(item => {
        const pecas = item.pecas.map(peca => [item.nome, peca.codigo, peca.quantidade, peca.unidade, peca.descricao]);
        dados.push(...pecas);
    });

    const ws = XLSX.utils.aoa_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, "Itens e Peças");
    XLSX.writeFile(wb, "itens_e_pecas.xlsx");
}

// Função para selecionar ou desmarcar um item e suas peças
function selecionarItem(itemIndex, checkbox) {
    const todasSelecionadas = checkbox.checked;

    // Selecionar ou desmarcar as peças de acordo com o status do item
    verPecas(itemIndex); // Atualiza a lista de peças para garantir que só mostre as do item selecionado
    const pecasCheckboxes = document.querySelectorAll(`#pecasList input[type='checkbox'][data-item-index='${itemIndex}']`);
    pecasCheckboxes.forEach((pecaCheckbox) => {
        pecaCheckbox.checked = todasSelecionadas; // Marcar ou desmarcar as peças
        // Atualiza o objeto de seleção das peças
        if (!pecasSelecionadas[itemIndex]) {
            pecasSelecionadas[itemIndex] = {};
        }
        pecasSelecionadas[itemIndex][pecaCheckbox.dataset.pecaIndex] = todasSelecionadas;
    });
}

// Função para atualizar a seleção das peças ao visualizar as peças
function atualizarSelecaoPecas(itemIndex) {
    const pecasCheckboxes = document.querySelectorAll(`#pecasList input[type='checkbox'][data-item-index='${itemIndex}']`);
    pecasCheckboxes.forEach((pecaCheckbox, index) => {
        pecaCheckbox.checked = pecasSelecionadas[itemIndex] && pecasSelecionadas[itemIndex][index];
    });
}

// Função que será chamada assim que a página for carregada
window.onload = function() {
    importarPlanilhaGitHub(); // Chama a função para importar os dados
};
