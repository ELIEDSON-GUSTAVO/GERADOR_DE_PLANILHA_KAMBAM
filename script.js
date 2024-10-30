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
    } else {
        alert('Preencha todos os campos da peça.');
    }
}

function atualizarLista() {
    const tbody = document.getElementById('itensBody');
    tbody.innerHTML = '';
    for (const item in itens) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item}</td>
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
    }
}

function pesquisarItem() {
    const pesquisa = document.getElementById('pesquisaInput').value.toLowerCase();
    const tbody = document.getElementById('itensBody');
    tbody.innerHTML = '';
    for (const item in itens) {
        if (item.toLowerCase().includes(pesquisa)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item}</td>
                            <td>
                                <button onclick="verPecas('${item}')">Ver Peças</button>
                                <button onclick="editarItem('${item}')">Editar</button>
                            </td>`;
            tbody.appendChild(tr);
        }
    }
}

function gerarExcel() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "CÓDIGO;QUANTIDADE;UN. MEDIDA;DESCRIÇÃO;LOCAL\n"; // Cabeçalho

    for (const item in itens) {
        itens[item].forEach(peca => {
            const row = `${peca.codigo};${peca.quantidade};${peca.unidade};"${peca.descricao}";${item}\n`;
            csvContent += row;
        });
        csvContent += "\n"; // Linha em branco entre itens
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `itens_pecas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
