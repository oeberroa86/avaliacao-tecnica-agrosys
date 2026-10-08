/**
 * @file db.js
 * @description Gerenciamento do banco de dados local com AlaSQL e LocalStorage
 * @author Octavio Berroa Arias
 * @date 2026
 */

// Inicialização do Banco de Dados local AlaSQL
function initDB() {
    alasql('CREATE LOCALSTORAGE DATABASE IF NOT EXISTS agrosys_db');
    alasql('ATTACH LOCALSTORAGE DATABASE agrosys_db');
    alasql('USE agrosys_db');

    alasql(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario STRING UNIQUE,
            senha STRING
        );
    `);

    alasql(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome STRING,
            cpf STRING UNIQUE,
            data_nascimento DATE,
            telefone STRING,
            celular STRING
        );
    `);

    alasql(`
        CREATE TABLE IF NOT EXISTS enderecos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cliente_id INT,
            cep STRING,
            rua STRING,
            bairro STRING,
            cidade STRING,
            estado STRING,
            pais STRING,
            is_principal BOOLEAN
        );
    `);
}

// Exportar todo o banco para JSON
function exportarDB() {
    initDB();
    const data = {
        usuarios: alasql('SELECT * FROM usuarios'),
        clientes: alasql('SELECT * FROM clientes'),
        enderecos: alasql('SELECT * FROM enderecos')
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agrosys_database.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Importar banco de dados a partir de um JSON
function importarDB() {
    const fileInput = document.getElementById('json-file-input');
    if (!fileInput.files.length) {
        alert('Por favor, selecione um arquivo JSON.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            alasql('DROP LOCALSTORAGE DATABASE IF EXISTS agrosys_db');
            initDB();

            // 1. Importar Usuarios
            if (data.usuarios && Array.isArray(data.usuarios)) {
                alasql('DELETE FROM usuarios');
                data.usuarios.forEach(u => {
                    alasql('INSERT INTO usuarios (id, usuario, senha) VALUES (?, ?, ?)', 
                        [u.id, u.usuario, u.senha]);
                });
            }

            // 2. Importar Clientes
            if (data.clientes && Array.isArray(data.clientes)) {
                alasql('DELETE FROM clientes');
                data.clientes.forEach(c => {
                    alasql('INSERT INTO clientes (id, nome, cpf, data_nascimento, telefone, celular) VALUES (?, ?, ?, ?, ?, ?)', 
                        [c.id, c.nome, c.cpf, c.data_nascimento, c.telefone, c.celular]);
                });
            }

            // 3. Importar Endereços
            if (data.enderecos && Array.isArray(data.enderecos)) {
                alasql('DELETE FROM enderecos');
                data.enderecos.forEach(end => {
                    alasql('INSERT INTO enderecos (id, cliente_id, cep, rua, bairro, cidade, estado, pais, is_principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        [
                            end.id, 
                            end.cliente_id, 
                            end.cep, 
                            end.rua, 
                            end.bairro, 
                            end.cidade, 
                            end.estado, 
                            end.pais, 
                            Boolean(end.is_principal)
                        ]
                    );
                });
            }

            alert('Banco de dados importado com sucesso!');
            
            const modalEl = document.getElementById('modalConfig');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            // Recargar vista o dados
            if (typeof currentUser !== 'undefined' && currentUser) {
                carregarClientes();
                carregarEnderecos();
            } else {
                location.reload();
            }

        } catch (err) {
            alert('Erro ao importar JSON: Formato inválido.');
            console.error('Detalles del error al importar:', err);
        }
    };

    reader.readAsText(file);
}