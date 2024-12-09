
Claro! Aqui está o código completo modificado para o seu site de cadastro de produtos, incluindo a funcionalidade de persistência com localStorage. Você pode copiar e colar este código:
javascript
let itens = [];
let editandoItemIndex = -1;
let editandoPecaIndex = -1;
let pecasSelecionadas = {}; // Objeto para armazenar o estado de seleção das peças
// Função para carregar os dados do Local Storage
function carregarDados() {
const dadosSalvos = localStorage.getItem('itens');
if (dadosSalvos) {
itens = JSON.parse(dadosSalvos);
}
atualizarListaItens();
atualizarSelectItens();
}
// Função para salvar os dados no Local Storage
function salvarDados() {
localStorage.setItem('itens', JSON.stringify(itens));
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
salvarDados(); // Chame a função para salvar os dados
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
salvarDados(); // Atualiza o localStorage
}
// Atualiza a lista de itens na tabela
function atualizarListaItens() {
const itensBody = document.getElementById("itensBody");
itensBody.innerHTML = "";
itens.forEach((item, index) => {
const tr = document.createElement("tr");
tr.innerHTML =              <td><input type="checkbox" onchange="selecionarItem(${index}, this)" ${pecasSelecionadas[index] ? 'checked' : ''}><td>${item.nome} (${item.pecas.length} peças)                 <button onclick="editarItem(${index})">Editar<button onclick="excluirItem(${index})">Excluir<button onclick="verPecas(${index})">Ver Peças;
itensBody.appendChild(tr);
});
}
// Atualiza o select de itens para adicionar peças
function atualizarSelectItens() {
const itemSelect = document.getElementById("itemSelect");
itemSelect.innerHTML = <option value="">Selecione um item;
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
<button onclick="editarPeca(${itemIndex}, ${index})">Editar<button onclick="excluirPeca(${itemIndex}, ${index})">Excluir
