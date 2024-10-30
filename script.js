let itens = {};

function adicionarItem() {
    const itemNome = document.getElementById('itemNome').value.trim();
    if (itemNome) {
        itens[itemNome] = [];
        atualizarLista();
        document.getElementById('itemNome').value = '';
        atualizarSelect();
    } else {
        alert('Informe o nome do item.');
    }
}

function adicionarPeca() {
    const itemNome = document.getElementById('itemSelect').value;
    const pecaCodigo = document.getElementById('pecaCodigo').value.trim();
    const pecaQuantidade = document.getElementById('pecaQuantidade').value;
    const pecaUnidade = document.getElementById('pecaUnidade').value.trim();
    const pecaDescricao = document.getElementById('pecaDescricao').value.trim();

    if (itemNome && pecaCodigo && pecaQuantidade && pecaUnidade && pecaDescricao) {
        itens[itemNome].push({
            codigo: pecaCodigo,
            quantidade: pecaQuantidade,
            unidade: pecaUnidade,
            descricao: pecaDescricao,
        });
        document.getElementById('pecaCodigo').value = '';
        document.getElementById('pecaQuantidade').value = '';
        document.getElementById('pecaUnidade').value = '';
        document.getElementById('pecaDescricao').value = '';
        atualizarLista();
    } else {
        alert('Preencha todos os campos da peça.');
    }
}

function atualizarLista() {
    const itemList = document.getElementById('itensBody');
    itemList.innerHTML = ''; // Limpa a lista

    for (const item in itens) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item}</td>
            <td>
                <button onclick="verPecas('${item}')">Ver Peças</button>
                <button onclick="editarItem('${item}')">Editar Item</button>
                <button onclick="excluirItem('${item}')">Excluir Item</button>
            </td>`;
        itemList.appendChild(tr);
    }
}

function atualizarSelect() {
    const select = document.getElementById('itemSelect');
    select.innerHTML = '';
    for (const item in itens) {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    }
}

function verPecas(item) {
    const pecaList = document.getElementById('itemList');
    pecaList.innerHTML = ''; // Limpa a lista de peças

    for (const peca of itens[item]) {
        const li = document.createElement('li');
        li.innerHTML = `
            <label>
                <input type="checkbox" class="peca-checkbox" data-item="${item}" data-codigo="${peca.codigo}">
                ${peca.codigo}: ${peca.quantidade} ${peca.unidade} - ${peca.descricao}
                <button onclick="editarPeca('${item}', '${peca.codigo}')">Editar</button>
                <button onclick="excluirPeca('${item}', '${peca.codigo}')">Excluir</button>
            </label>`;
        pecaList.appendChild(li);
    }
}

function editarItem(item) {
    const novoNome = prompt('Digite o novo nome para o item:', item);
    if (novoNome && novoNome !== item) {
        itens[novoNome] = itens[item];
        delete itens[item];
        atualizarLista();
        atualizarSelect();
    }
}

function excluirItem(item) {
    if (confirm(`Tem certeza que deseja excluir o item "${item}"?`)) {
        delete itens[item];
        atualizarLista();
        atualizarSelect();
    }
}

function editarPeca(item, codigo) {
    const peca = itens[item].find(peca => peca.codigo === codigo);
    if (peca) {
        const novoCodigo = prompt('Digite o novo código:', peca.codigo);
        const novaQuantidade = prompt('Digite a nova quantidade:', peca.quantidade);
        const novaUnidade = prompt('Digite a nova unidade:', peca.unidade);
        const novaDescricao = prompt('Digite a nova descrição:', peca.descricao);

        if (novoCodigo && novaQuantidade && novaUnidade && novaDescricao) {
            peca.codigo = novoCodigo;
            peca.quantidade = novaQuantidade;
            peca.unidade = novaUnidade;
            peca.descricao = novaDescricao;
            atualizarLista();
        } else {
            alert('Todos os campos devem ser preenchidos.');
        }
    }
}

function excluirPeca(item, codigo) {
    if (confirm(`Tem certeza que deseja excluir a peça "${codigo}" do item "${item}"?`)) {
        itens[item] = itens[item].filter(peca => peca.codigo !== codigo);
        atualizarLista();
    }
}

function pesquisarItem() {
    const pesquisa = document.getElementById('pesquisaInput').value.toLowerCase();
    const itemList = document.getElementById('itensBody');
    itemList.innerHTML = '';
    for (const item in itens) {
        if (item.toLowerCase().includes(pesquisa)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item}</td>
                <td>
                    <button onclick="verPecas('${item}')">Ver Peças</button>
                    <button onclick="editarItem('${item}')">Editar Item</button>
                    <button onclick="excluirItem('${item}')">Excluir Item</button>
                </td>`;
            itemList.appendChild(tr);
        }
    }
}

function gerarExcel() {
    let workbook = XLSX.utils.book_new();
    let data = [];

    // Coletando peças selecionadas
    const selectedPieces = document.querySelectorAll('.peca-checkbox:checked');
    selectedPieces.forEach(checkbox => {
        const item = checkbox.getAttribute('data-item');
        const codigo = checkbox.getAttribute('data-codigo');
        const peca = itens[item].find(p => p.codigo === codigo);

        if (peca) {
            data.push({
                "CÓDIGO": peca.codigo,
                "QUANTIDADE": peca.quantidade,
                "UNIDADE": peca.unidade,
                "DESCRIÇÃO": peca.descricao,
                "ITEM": item,
            });
        }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Peças Selecionadas');

    // Gerar o arquivo Excel
    XLSX.writeFile(workbook, 'peças_selecionadas.xlsx');
}

function importarExcel() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('Selecione um arquivo para importar.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const totalRows = json.length - 1; // Para ignorar o cabeçalho
        let processedRows = 0;

        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            const itemNome = row[0];
            const peca = {
                codigo: row[1],
                quantidade: row[2],
                unidade: row[3],
                descricao: row[4]
            };

            if (!itens[itemNome]) {
                itens[itemNome] = [];
            }

            itens[itemNome].push(peca);
            processedRows++;

            // Atualizando o status de importação
            document.getElementById('importStatus').innerText = `Importando: ${processedRows} de ${totalRows} linhas...`;
        }

        document.getElementById('importStatus').innerText = 'Importação concluída.';
        atualizarLista();
        atualizarSelect();
    };
    reader.readAsArrayBuffer(file);
}
