let itens = [];
let editandoItemIndex = -1;
let editandoPecaIndex = -1;
let pecasSelecionadas = {}; // Objeto para armazenar o estado de seleção das peças

// Função para importar dados de uma planilha hospedada no GitHub
function importarPlanilhaGitHub() {
    const url = "https://raw.githubusercontent.com/ELIEDSON-GUSTAVO/GERADOR_DE_PLANILHA_KAMBAM/080b4d79e654224e9fe4cdcbe7fcaa73b247343a/DADOS.xlsx";

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
    pecasList.innerHTML = "";

    const item = itens[itemIndex];
    item.pecas.forEach((peca, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" class="pecaCheckbox" data-item-index="${itemIndex}" data-peca-index="${index}" onchange="selecionarPeca(${itemIndex}, ${index}, this)" ${pecasSelecionadas[itemIndex] && pecasSelecionadas[itemIndex][index] ? 'checked' : ''}>
            ${peca.codigo} - ${peca.quantidade} ${peca.unidade} - ${peca.descricao}
            <button onclick="editarPeca(${itemIndex}, ${index})">Editar</button>
            <button onclick="excluirPeca(${itemIndex}, ${index})">Excluir</button>
        `;
        pecasList.appendChild(li);
    });
}

// Selecionar ou desmarcar um item e suas peças
function selecionarItem(itemIndex, checkbox) {
    if (checkbox.checked) {
        pecasSelecionadas[itemIndex] = {}; // Marca todas as peças do item
        itens[itemIndex].pecas.forEach((_, pecaIndex) => {
            pecasSelecionadas[itemIndex][pecaIndex] = true;
        });
    } else {
        delete pecasSelecionadas[itemIndex]; // Remove a seleção do item e peças
    }
}

// Selecionar ou desmarcar uma peça específica
function selecionarPeca(itemIndex, pecaIndex, checkbox) {
    if (!pecasSelecionadas[itemIndex]) {
        pecasSelecionadas[itemIndex] = {};
    }
    if (checkbox.checked) {
        pecasSelecionadas[itemIndex][pecaIndex] = true;
    } else {
        delete pecasSelecionadas[itemIndex][pecaIndex];
        if (Object.keys(pecasSelecionadas[itemIndex]).length === 0) {
            delete pecasSelecionadas[itemIndex]; // Remove o item se todas as peças forem desmarcadas
        }
    }
}

// Exportar apenas os itens e peças selecionados
function gerarExcel() {
    const wb = XLSX.utils.book_new();
    const dados = [];

    Object.keys(pecasSelecionadas).forEach(itemIndex => {
        const item = itens[itemIndex];
        Object.keys(pecasSelecionadas[itemIndex]).forEach(pecaIndex => {
            const peca = item.pecas[pecaIndex];
            dados.push([item.nome, peca.codigo, peca.quantidade, peca.unidade, peca.descricao]);
        });
    });

    if (dados.length === 0) {
        alert("Nenhum item selecionado para exportação.");
        return;
    }

    const ws = XLSX.utils.aoa_to_sheet([["Item", "Código", "Quantidade", "Unidade", "Descrição"], ...dados]);
    XLSX.utils.book_append_sheet(wb, ws, "Itens Selecionados");
    XLSX.writeFile(wb, "itens_selecionados.xlsx");
}

// Função chamada ao carregar a página
window.onload = function() {
    importarPlanilhaGitHub();
};
