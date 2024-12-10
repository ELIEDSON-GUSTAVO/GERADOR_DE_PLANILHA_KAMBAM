let itens = [];
let editandoItemIndex = -1;
let editandoPecaIndex = -1;

function adicionarOuEditarItem() {
    const itemNome = document.getElementById("itemNome").value.trim();
    if (!itemNome) return alert("Digite o nome do item.");

    if (editandoItemIndex > -1) {
        itens[editandoItemIndex].nome = itemNome;
        editandoItemIndex = -1;
    } else {
        itens.push({ nome: itemNome, pecas: [] });
    }
    atualizarListaItens();
    atualizarSelectItens();
    document.getElementById("itemNome").value = "";
}

function adicionarOuEditarPeca() {
    const itemIndex = document.getElementById("itemSelect").value;
    const codigo = document.getElementById("pecaCodigo").value.trim();
    const quantidade = parseInt(document.getElementById("pecaQuantidade").value);
    const unidade = document.getElementById("pecaUnidade").value.trim();
    const descricao = document.getElementById("pecaDescricao").value.trim();

    if (itemIndex === "" || !codigo || isNaN(quantidade) || !unidade || !descricao) {
        return alert("Preencha todos os campos da peça.");
    }

    const peca = { codigo, quantidade, unidade, descricao };

    if (editandoPecaIndex > -1) {
        itens[itemIndex].pecas[editandoPecaIndex] = peca;
        editandoPecaIndex = -1;
    } else {
        itens[itemIndex].pecas.push(peca);
    }

    atualizarListaPecas(itemIndex);
    document.getElementById("pecaCodigo").value = "";
    document.getElementById("pecaQuantidade").value = "";
    document.getElementById("pecaUnidade").value = "";
    document.getElementById("pecaDescricao").value = "";
}

function atualizarListaItens() {
    const itensBody = document.getElementById("itensBody");
    itensBody.innerHTML = "";
    itens.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="radio" name="selectItem" onclick="atualizarListaPecas(${index})"></td>
            <td>${item.nome}</td>
            <td><button onclick="editarItem(${index})">Editar</button></td>
        `;
        itensBody.appendChild(row);
    });
}

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

function atualizarListaPecas(itemIndex) {
    const pecasList = document.getElementById("pecasList");
    pecasList.innerHTML = "";
    itens[itemIndex].pecas.forEach((peca, index) => {
        const li = document.createElement("li");
        li.textContent = `Código: ${peca.codigo}, Quantidade: ${peca.quantidade}, Unidade: ${peca.unidade}, Descrição: ${peca.descricao}`;
        pecasList.appendChild(li);
    });
}

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

function importarJson(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            itens = JSON.parse(e.target.result);
            atualizarListaItens();
            atualizarSelectItens();
        };
        reader.readAsText(file);
    }
}

function gerarExcel() {
    const planilha = itens.map(item => ({
        "Item": item.nome,
        "Código das Peças": item.pecas.map(p => p.codigo).join(", "),
        "Quantidades": item.pecas.map(p => p.quantidade).join(", "),
        "Unidades": item.pecas.map(p => p.unidade).join(", "),
        "Descrições": item.pecas.map(p => p.descricao).join(", ")
    }));
    const ws = XLSX.utils.json_to_sheet(planilha);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Itens e Peças");
    XLSX.writeFile(wb, "itens_e_pecas.xlsx");
}

function importarExcel() {
    const fileInput = document.getElementById("importExcelFile");
    const file = fileInput.files[0];
    if (!file) return alert("Selecione um arquivo Excel.");
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(sheet);
        itens = importedData.map(row => ({
            nome: row["Item"],
            pecas: (row["Código das Peças"] || "").split(", ").map((codigo, i) => ({
                codigo,
                quantidade: parseInt((row["Quantidades"] || "").split(", ")[i]) || 0,
                unidade: (row["Unidades"] || "").split(", ")[i],
                descricao: (row["Descrições"] || "").split(", ")[i]
            }))
        }));
        atualizarListaItens();
        atualizarSelectItens();
    };
    reader.readAsArrayBuffer(file);
}
