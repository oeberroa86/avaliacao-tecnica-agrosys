# 🌾 Avaliação Técnica - Agrosys (CRUD Web)

Sistema web para gerenciamento de clientes, endereços e usuários, desenvolvido como parte do processo de avaliação técnica da Agrosys.

---

## 📌 Visão Geral do Projeto

A aplicação é uma SPA (Single Page Application) que opera diretamente no navegador, utilizando o motor **AlaSQL.js** sincronizado com o **LocalStorage** para simular um banco de dados relacional (SQLite-like) com persistência local sem a necessidade de um servidor backend.

---

## 🚀 Tecnologias Utilizadas

* **HTML5 & CSS3:** Estruturação semântica e estilização customizada.
* **Bootstrap 5:** Framework para layout responsivo e componentes visuais (modais, tabelas, formulários).
* **JavaScript (Vanilla JS):** Lógica de negócios, manipulação do DOM e integração de APIs.
* **AlaSQL.js:** Engine SQL em JavaScript para persistência no LocalStorage.
* **jQuery:** Auxílio em chamadas AJAX e manipulação simplificada do DOM.
* **FontAwesome:** Ícones da interface.
* **API ViaCEP:** Integração REST para busca automática de endereços a partir do CEP.

---

## ✨ Funcionalidades Principais

* **Módulo de Autenticação:**
  * Login e registro de novos usuários.
  * Validação de nomes de usuário únicos.
* **Gestão de Clientes:**
  * Operações de CRUD completo (Criar, Ler, Atualizar e Deletar).
  * Validação estrita de unicidade de CPF.
  * Exclusão em cascata (ao remover um cliente, seus endereços vinculados são removidos).
* **Gestão de Endereços (Relacionamento 1:N):**
  * Cadastro de múltiplos endereços por cliente.
  * Autocompletado de logradouro via consulta de CEP (ViaCEP).
  * Regra de negócio de Endereço Principal: garantia de que cada cliente possui ao menos um endereço marcado como principal.
* **Portabilidade de Dados (Importação/Exportação JSON):**
  * Exportação de todo o banco de dados em tempo real para um arquivo JSON.
  * Importação e restauração completa de um banco pré-populado via arquivo JSON.

---

## 🔑 Credenciais de Teste

Para facilitar a navegação inicial, você pode utilizar o usuário pré-cadastrado ou registrar um novo:

* **Usuário:** admin
* **Senha:** 123

---

## 🛠️ Como Executar o Projeto

1. Clone este repositório para a sua máquina local executando o comando git clone https://github.com/oeberroa86/avaliacao-tecnica-agrosys.git no seu terminal.
2. Acesse a pasta do projeto e abra o arquivo index.html em qualquer navegador web moderno (Chrome, Edge, Firefox).
3. Para carregar dados de teste:
   * Acesse a opção Configurações.
   * Selecione o arquivo sample_db.json localizado na raiz do projeto.
   * Clique em Importar DB.

---

## 👨‍💻 Autor

**Octavio Berroa Arias**  
*Desenvolvedor / Analista de Sistemas*