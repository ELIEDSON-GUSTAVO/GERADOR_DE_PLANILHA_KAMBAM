let itens = [];
let pecas = {};

// Função para inicializar a aplicação
function init() {
    carregarDados();
    atualizarListaItens();
}

// Função para adicionar um item
function adicionarItem() {
    const itemNome = document.getElementById('itemNome').value;
    if (itemNome) {
        itens.push(itemNome);
        pecas[itemNome] = []; // Inicializa as peças para o novo item
        salvarDados();
        atualizarListaItens();
        document.getElementById('itemNome').value = '';
    }
}

// Função para adicionar uma peça a um item existente
function adicionarPeca() {
    const itemNome = document.getElementById('itemSelect').value;
    const codigo = document.getElementById('pecaCodigo').value;
    const quantidade = document.getElementById('pecaQuantidade').value;
    const unidade = document.getElementById('pecaUnidade').value;
    const descricao = document.getElementById('pecaDescricao').value;

    if (itemNome && codigo) {
        pecas[itemNome].push({ codigo, quantidade, unidade, descricao });
        salvarDados();
        atualizarListaPecas(itemNome);
        document.getElementById('pecaCodigo').value = '';
        document.getElementById('pecaQuantidade').value = '';
        document.getElementById('pecaUnidade').value = '';
        document.getElementById('pecaDescricao').value = '';
    }
}

// Função para atualizar a lista de itens na tabela
function atualizarListaItens() {
    const itensBody = document.getElementById('itensBody');
    itensBody.innerHTML = '';
    itens.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="item-checkbox" data-index="${index}"></td>
            <td>
                <span class="item-nome" id="itemNome-${index}">${item}</span>
                <input type="text" class="edit-item" id="editItem-${index}" style="display: none;" placeholder="Novo Nome">
                <button onclick="toggleEditItem(${index})">Editar</button>
            </td>
            <td><button onclick="verPecas('${item}')">Ver Peças</button></td>
            <td><button onclick="removerItem(${index})">Remover</button></td>
        `;
        itensBody.appendChild(tr);
    });
    atualizarSelectItem();
}

// Função para atualizar o select de itens
function atualizarSelectItem() {
    const select = document.getElementById('itemSelect');
    select.innerHTML = '';
    itens.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

// Função para remover um item e suas peças
function removerItem(index) {
    const itemNome = itens[index];
    delete pecas[itemNome]; // Remove as peças associadas
    itens.splice(index, 1);
    salvarDados();
    atualizarListaItens();
}

// Função para atualizar a lista de peças de um item
function atualizarListaPecas(itemNome) {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';
    if (pecas[itemNome]) {
        pecas[itemNome].forEach((peca, pIndex) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span id="peca-${itemNome}-${pIndex}">${peca.codigo} - ${peca.quantidade} ${peca.unidade} - ${peca.descricao}</span>
                <input type="text" class="edit-peca" id="editPeca-${itemNome}-${pIndex}" style="display: none;" placeholder="Novo Código">
                <button onclick="toggleEditPeca('${itemNome}', ${pIndex})">Editar</button>
                <button onclick="removerPeca('${itemNome}', ${pIndex})">Remover</button>
            `;
            itemList.appendChild(li);
        });
    }
}

// Função para pesquisar itens
function pesquisarItem() {
    const pesquisa = document.getElementById('pesquisaInput').value.toLowerCase();
    const itensBody = document.getElementById('itensBody');
    itensBody.innerHTML = '';
    itens.forEach((item, index) => {
        if (item.toLowerCase().includes(pesquisa)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" class="item-checkbox" data-index="${index}"></td>
                <td>
                    <span class="item-nome" id="itemNome-${index}">${item}</span>
                    <input type="text" class="edit-item" id="editItem-${index}" style="display: none;" placeholder="Novo Nome">
                    <button onclick="toggleEditItem(${index})">Editar</button>
                </td>
                <td><button onclick="verPecas('${item}')">Ver Peças</button></td>
                <td><button onclick="removerItem(${index})">Remover</button></td>
            `;
            itensBody.appendChild(tr);
        }
    });
}

// Função para gerar um arquivo Excel
function gerarExcel() {
    const selectedItems = [];
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    checkboxes.forEach(checkbox => {
        const index = checkbox.getAttribute('data-index');
        selectedItems.push(itens[index]);
        // Adicionar também as peças
        if (pecas[itens[index]]) {
            pecas[itens[index]].forEach(p => {
                selectedItems.push(`${itens[index]} - ${p.codigo}`);
            });
        }
    });

    const ws = XLSX.utils.json_to_sheet(selectedItems.map(item => ({ Item: item })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Itens');
    XLSX.writeFile(wb, 'itens_selecionados.xlsx');
}

// Função para importar itens de um arquivo Excel
function importarExcel() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Resetar itens e peças
        itens = [];
        pecas = {};

        // Processar dados importados
        importedData.forEach(row => {
            const itemNome = row[0];
            const codigo = row[1];
            const quantidade = row[2];
            const unidade = row[3];
            const descricao = row[4];

            if (itemNome) {
                if (!itens.includes(itemNome)) {
                    itens.push(itemNome);
                    pecas[itemNome] = []; // Inicializa as peças para o novo item
                }

                if (codigo) {
                    pecas[itemNome].push({ codigo, quantidade, unidade, descricao });
                }
            }
        });

        salvarDados(); // Salvar após a importação
        atualizarListaItens();
        document.getElementById('importStatus').textContent = 'Importação concluída.';
    };
    reader.readAsArrayBuffer(file);
}

// Função para ver as peças de um item
function verPecas(itemNome) {
    atualizarListaPecas(itemNome);
}

// Função para remover uma peça
function removerPeca(itemNome, pIndex) {
    pecas[itemNome].splice(pIndex, 1); // Remove a peça selecionada
    salvarDados(); // Salva as alterações
    atualizarListaPecas(itemNome); // Atualiza a lista de peças exibida
}

// Função para editar o nome do item
function toggleEditItem(index) {
    const itemNome = document.getElementById(`itemNome-${index}`);
    const editInput = document.getElementById(`editItem-${index}`);

    if (editInput.style.display === "none") {
        editInput.style.display = "inline";
        editInput.value = itemNome.innerText;
        itemNome.style.display = "none";
    } else {
        if (editInput.value) {
            itens[index] = editInput.value;
            salvarDados();
            atualizarListaItens();
        }
        editInput.style.display = "none";
        itemNome.style.display = "inline";
    }
}

// Função para editar uma peça
function toggleEditPeca(itemNome, pIndex) {
    const pecaSpan = document.getElementById(`peca-${itemNome}-${pIndex}`);
    const editInput = document.getElementById(`editPeca-${itemNome}-${pIndex}`);

    if (editInput.style.display === "none") {
        editInput.style.display = "inline";
        editInput.value = pecas[itemNome][pIndex].codigo; // Pega o código atual da peça
        pecaSpan.style.display = "none";
    } else {
        if (editInput.value) {
            // Atualiza as informações da peça
            pecas[itemNome][pIndex].codigo = editInput.value; // Aqui você pode adicionar mais campos se necessário
            salvarDados();
            atualizarListaPecas(itemNome);
        }
        editInput.style.display = "none";
        pecaSpan.style.display = "inline";
    }
}

// Função para salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('itens', JSON.stringify(itens));
    localStorage.setItem('pecas', JSON.stringify(pecas));
}

// Função para carregar dados do localStorage
function carregarDados() {
    const itensSalvos = JSON.parse(localStorage.getItem('itens'));
    const pecasSalvas = JSON.parse(localStorage.getItem('pecas'));

    if (itensSalvos) {
        itens = itensSalvos;
    }
    if (pecasSalvas) {
        pecas = pecasSalvas;
    }
}

// Inicializa a aplicação ao carregar
init();
