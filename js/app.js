/**
 * @file app.js
 * @description Módulo principal de controle da interface, eventos do DOM e lógica de negócios.
 *              Gerencia o fluxo de autenticação de usuários, operações CRUD de Clientes 
 *              e Endereços, validações de CPF/CEP e navegação entre telas.
 * @author Octavio Berroa Arias
 * @date 2026
 */

let currentUser = null;
let modalClienteBs, modalEnderecoBs, modalConfigBs;

$(document).ready(function() {
    initDB();
    modalClienteBs = new bootstrap.Modal(document.getElementById('modalCliente'));
    modalEnderecoBs = new bootstrap.Modal(document.getElementById('modalEndereco'));
    modalConfigBs = new bootstrap.Modal(document.getElementById('modalConfig'));
});

// Navegação entre Telas
function showSection(section) {
    $('#view-clientes, #view-enderecos').addClass('d-none');
    $('#nav-clientes, #nav-enderecos').removeClass('active');

    if (section === 'clientes') {
        $('#view-clientes').removeClass('d-none');
        $('#nav-clientes').addClass('active');
        carregarClientes();
    } else if (section === 'enderecos') {
        $('#view-enderecos').removeClass('d-none');
        $('#nav-enderecos').addClass('active');
        carregarEnderecos();
    }
}

// Auth Logic
function handleLogin(e) {
    e.preventDefault();
    const u = $('#login-user').val().trim();
    const p = $('#login-pass').val().trim();

    const res = alasql('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?', [u, p]);
    if (res.length > 0) {
        currentUser = res[0];
        $('#view-auth').addClass('d-none');
        $('#main-nav').removeClass('d-none');
        showSection('clientes');
    } else {
        alert('Usuário ou senha inválidos!');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const u = $('#reg-user').val().trim();
    const p = $('#reg-pass').val().trim();

    const exists = alasql('SELECT * FROM usuarios WHERE usuario = ?', [u]);
    if (exists.length > 0) {
        alert('Este nome de usuário já está cadastrado!');
        return;
    }

    alasql('INSERT INTO usuarios (usuario, senha) VALUES (?, ?)', [u, p]);
    alert('Usuário cadastrado com sucesso! Faça login.');
    $('#tab-login').click();
}

function logout() {
    currentUser = null;
    $('#main-nav').addClass('d-none');
    $('#view-clientes, #view-enderecos').addClass('d-none');
    $('#view-auth').removeClass('d-none');
}

function abrirConfiguracoes() {
    modalConfigBs.show();
}

// CLIENTES CRUD
function carregarClientes() {
    const list = alasql('SELECT * FROM clientes');
    let html = '';

    list.forEach(c => {
        html += `
            <tr>
                <td>${c.id}</td>
                <td class="fw-bold">${c.nome}</td>
                <td>${c.cpf}</td>
                <td>${c.data_nascimento || '-'}</td>
                <td>${c.telefone || '-'} / ${c.celular || '-'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarCliente(${c.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletarCliente(${c.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    $('#tb-clientes').html(html || '<tr><td colspan="6" class="text-center text-muted p-3">Nenhum cliente cadastrado.</td></tr>');
}

function abrirModalCliente() {
    $('#form-cliente')[0].reset();
    $('#cliente-id').val('');
    $('#lblModalCliente').text('Novo Cliente');
    modalClienteBs.show();
}

function editarCliente(id) {
    const res = alasql('SELECT * FROM clientes WHERE id = ?', [id]);
    if (res.length) {
        const c = res[0];
        $('#cliente-id').val(c.id);
        $('#cli-nome').val(c.nome);
        $('#cli-cpf').val(c.cpf);
        $('#cli-nasc').val(c.data_nascimento);
        $('#cli-tel').val(c.telefone);
        $('#cli-cel').val(c.celular);
        $('#lblModalCliente').text('Editar Cliente');
        modalClienteBs.show();
    }
}

function salvarCliente(e) {
    e.preventDefault();
    const id = $('#cliente-id').val();
    const nome = $('#cli-nome').val().trim();
    const cpf = $('#cli-cpf').val().trim();
    const nasc = $('#cli-nasc').val();
    const tel = $('#cli-tel').val().trim();
    const cel = $('#cli-cel').val().trim();

    // Validar CPF único
    const checkCpf = alasql('SELECT * FROM clientes WHERE cpf = ? AND id != ?', [cpf, id ? parseInt(id) : 0]);
    if (checkCpf.length > 0) {
        alert('Já existe um cliente cadastrado com este CPF!');
        return;
    }

    if (id) {
        alasql('UPDATE clientes SET nome = ?, cpf = ?, data_nascimento = ?, telefone = ?, celular = ? WHERE id = ?',
            [nome, cpf, nasc, tel, cel, parseInt(id)]);
    } else {
        alasql('INSERT INTO clientes (nome, cpf, data_nascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)',
            [nome, cpf, nasc, tel, cel]);
    }

    modalClienteBs.hide();
    carregarClientes();
}

function deletarCliente(id) {
    if (confirm('Deseja excluir este cliente e seus endereços?')) {
        alasql('DELETE FROM clientes WHERE id = ?', [id]);
        alasql('DELETE FROM enderecos WHERE cliente_id = ?', [id]);
        carregarClientes();
    }
}

// ENDEREÇOS CRUD
function carregarEnderecos() {
    const query = `
        SELECT e.*, c.nome as cliente_nome 
        FROM enderecos e 
        JOIN clientes c ON e.cliente_id = c.id
    `;
    const list = alasql(query);
    let html = '';

    list.forEach(e => {
        html += `
            <tr>
                <td class="fw-bold">${e.cliente_nome}</td>
                <td>${e.cep}</td>
                <td>${e.rua}</td>
                <td>${e.bairro}</td>
                <td>${e.cidade}/${e.estado}</td>
                <td>
                    ${e.is_principal 
                        ? '<span class="badge bg-success badge-principal"><i class="fa-solid fa-check me-1"></i>Principal</span>' 
                        : '<span class="badge bg-light text-dark border">Secundário</span>'}
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarEndereco(${e.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletarEndereco(${e.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    $('#tb-enderecos').html(html || '<tr><td colspan="7" class="text-center text-muted p-3">Nenhum endereço cadastrado.</td></tr>');
}

function popularSelectClientes(selectedId = null) {
    const clientes = alasql('SELECT id, nome FROM clientes');
    let options = '<option value="">Selecione um cliente...</option>';
    clientes.forEach(c => {
        options += `<option value="${c.id}" ${selectedId == c.id ? 'selected' : ''}>${c.nome}</option>`;
    });
    $('#end-cliente-id').html(options);
}

function abrirModalEndereco() {
    const clientes = alasql('SELECT * FROM clientes');
    if (!clientes.length) {
        alert('Cadastre ao menos um cliente antes de adicionar um endereço.');
        return;
    }
    $('#form-endereco')[0].reset();
    $('#end-id').val('');
    popularSelectClientes();
    $('#lblModalEndereco').text('Novo Endereço');
    modalEnderecoBs.show();
}

function editarEndereco(id) {
    const res = alasql('SELECT * FROM enderecos WHERE id = ?', [id]);
    if (res.length) {
        const e = res[0];
        popularSelectClientes(e.cliente_id);
        $('#end-id').val(e.id);
        $('#end-cep').val(e.cep);
        $('#end-rua').val(e.rua);
        $('#end-bairro').val(e.bairro);
        $('#end-cidade').val(e.cidade);
        $('#end-estado').val(e.estado);
        $('#end-pais').val(e.pais);
        $('#end-principal').prop('checked', e.is_principal);
        $('#lblModalEndereco').text('Editar Endereço');
        modalEnderecoBs.show();
    }
}

function salvarEndereco(e) {
    e.preventDefault();
    const id = $('#end-id').val();
    const clienteId = parseInt($('#end-cliente-id').val());
    const cep = $('#end-cep').val().trim();
    const rua = $('#end-rua').val().trim();
    const bairro = $('#end-bairro').val().trim();
    const cidade = $('#end-cidade').val().trim();
    const estado = $('#end-estado').val().trim().toUpperCase();
    const pais = $('#end-pais').val().trim();
    let isPrincipal = $('#end-principal').is(':checked');

    // Verificar se já existe algum endereço para esse cliente
    const enderecosExistentes = alasql('SELECT * FROM enderecos WHERE cliente_id = ? AND id != ?', [clienteId, id ? parseInt(id) : 0]);
    
    // Se for o primeiro endereço do cliente, forçar como principal
    if (enderecosExistentes.length === 0) {
        isPrincipal = true;
    }

    // Se este foi marcado como principal, desmarcar todos os otros do mesmo cliente
    if (isPrincipal) {
        alasql('UPDATE enderecos SET is_principal = false WHERE cliente_id = ?', [clienteId]);
    }

    if (id) {
        alasql('UPDATE enderecos SET cliente_id = ?, cep = ?, rua = ?, bairro = ?, cidade = ?, estado = ?, pais = ?, is_principal = ? WHERE id = ?',
            [clienteId, cep, rua, bairro, cidade, estado, pais, isPrincipal, parseInt(id)]);
    } else {
        alasql('INSERT INTO enderecos (cliente_id, cep, rua, bairro, cidade, estado, pais, is_principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [clienteId, cep, rua, bairro, cidade, estado, pais, isPrincipal]);
    }

    modalEnderecoBs.hide();
    carregarEnderecos();
}

function deletarEndereco(id) {
    if (confirm('Deseja excluir este endereço?')) {
        alasql('DELETE FROM enderecos WHERE id = ?', [id]);
        carregarEnderecos();
    }
}

// Integração com API ViaCEP
function buscarViaCEP() {
    const cep = $('#end-cep').val().replace(/\D/g, '');
    if (cep.length === 8) {
        $.getJSON(`https://viacep.com.br/ws/${cep}/json/`, function(data) {
            if (!data.erro) {
                $('#end-rua').val(data.logradouro);
                $('#end-bairro').val(data.bairro);
                $('#end-cidade').val(data.localidade);
                $('#end-estado').val(data.uf);
            } else {
                alert('CEP não encontrado.');
            }
        });
    } else {
        alert('Informe um CEP válido com 8 dígitos.');
    }
}