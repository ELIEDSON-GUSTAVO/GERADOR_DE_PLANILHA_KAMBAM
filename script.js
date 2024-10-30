let itens = JSON.parse(localStorage.getItem('itens')) || {};

function adicionarItem() {
    const itemNome = document.getElementById('itemNome').value.trim();
    if (itemNome) {
        itens[itemNome] = [];
        atualizarLista();
        document.getElementById('itemNome').value = '';
        atualizarSelect();
        salvarItens();
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
        salvarItens();
        atualizarLista(); // Atualiza a lista após adicionar a peça
    } else {
        alert('Preencha todos os campos da peça.');
    }
}

function atualizarLista() {
    const tbody = document.getElementById('itensBody');
    tbody.innerHTML = '';
    for (const item in itens) {
        const tr = document.createElement('tr');
        const pecas = itens[item].map(p => `${p.codigo} (${p.quantidade} ${p.unidade}): ${p.descricao}`).join('<br>');
        tr.innerHTML = `<td>${item}</td><td>${pecas}</td>
                        <td>
                            <button onclick="verPecas('${item}')">Ver Peças</button>
                            <button onclick="editarItem('${item}')">Editar</button>
                        </td>`;
        tbody.appendChild(tr);
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
    alert(JSON.stringify(itens[item], null, 2));
}

function editarItem(item) {
    const novoNome = prompt('Digite o novo nome para o item:', item);
    if (novoNome && novoNome !== item) {
        itens[novoNome] = itens[item];
        delete itens[item];
        atualizarLista();
        atualizarSelect();
        salvarItens();
    }
}

function pesquisarItem() {
    const pesquisa = document.getElementById('pesquisaInput').value.toLowerCase();
    const tbody = document.getElementById('itensBody');
    tbody.innerHTML = '';
    for (const item in itens) {
        if (item.toLowerCase().includes(pesquisa)) {
            const tr = document.createElement('tr');
            const pecas = itens[item].map(p => `${p.codigo} (${p.quantidade} ${p.unidade}): ${p.descricao}`).join('<br>');
            tr.innerHTML = `<td>${item}</td><td>${pecas}</td>
                            <td>
                                <button onclick="verPecas('${item}')">Ver Peças</button>
                                <button onclick="editarItem('${item}')">Editar</button>
                            </td>`;
            tbody.appendChild(tr);
        }
    }
}

function gerarExcel() {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [["Item", "Código", "Quantidade", "Unidade", "Descrição"]];

    for (const item in itens) {
        itens[item].forEach(peca => {
            worksheetData.push([item, peca.codigo, peca.quantidade, peca.unidade, peca.descricao]);
        });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Itens e Peças");

    XLSX.writeFile(workbook, 'itens_pecas.xlsx');
}

function salvarItens() {
    localStorage.setItem('itens', JSON.stringify(itens));
}

function importarExcel() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Selecione um arquivo Excel.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const totalRows = rows.length - 1; // Total de linhas para importar
        let importedRows = 0; // Contador de linhas importadas

        // Exibe os itens sendo importados
        rows.forEach((row, index) => {
            if (index > 0) { // Ignora o cabeçalho
                const [item, codigo, quantidade, unidade, descricao] = row;

                // Validar a estrutura dos dados
                if (!item || !codigo || !quantidade || !unidade || !descricao) {
                    console.error(`Dados inválidos na linha ${index + 1}: ${row.join(', ')}`);
                    alert(`Dados inválidos na linha ${index + 1}: ${row.join(', ')}`);
                    return;
                }

                console.log(`Importando: ${item}, ${codigo}, ${quantidade}, ${unidade}, ${descricao}`);

                if (!itens[item]) {
                    itens[item] = [];
                }
                itens[item].push({
                    codigo: codigo,
                    quantidade: quantidade,
                    unidade: unidade,
                    descricao: descricao,
                });

                // Atualiza a barra de progresso
                importedRows++;
                atualizarProgresso(importedRows, totalRows);
            }
        });

        salvarItens();
        atualizarLista();
        atualizarSelect();
        alert("Importação concluída com sucesso!");
    };

    reader.readAsArrayBuffer(file);
}

function atualizarProgresso(importedRows, totalRows) {
    const progressoDiv = document.getElementById('progresso');
    const progress = (importedRows / totalRows) * 100;
    progressoDiv.innerHTML = `
        <div class="progress-bar">
            <div class="progress" style="width: ${progress}%;"></div>
        </div>
        <span>${importedRows} de ${totalRows} itens importados</span>
    `;
}

// Inicializa a lista ao carregar a página
atualizarLista();
atualizarSelect();
