import { BaseController } from './BaseController.js';

export class FormController extends BaseController {
  constructor() {
    super();
    this.itensPedido = [];
  }

  editarItem(tabela, id) {
    this.mostrarFormulario(tabela, parseInt(id));
  }

  mostrarFormulario(tabela, id = null) {
    const formContainer = document.getElementById('form-container');
    formContainer.innerHTML = this.criarFormularioHTML(tabela, id);
    
    this.setupFormularioEventListeners(tabela);
    
    if (id) {
      this.preencherFormulario(tabela, id);
    }

    if (tabela === 'pedidos') {
      this.itensPedido = [];
      this.atualizarListaItensPedido();
    }

    document.getElementById('list-container').style.display = 'none';
    formContainer.style.display = 'block';
  }

  criarFormularioHTML(tabela, id) {
    return `
      <div class="form-box">
        <h2 class="form-title">${id ? 'Editar' : 'Adicionar'} ${tabela.charAt(0).toUpperCase() + tabela.slice(1)}</h2>
        <form id="${tabela}-form" class="form-responsive ${tabela}-form">
          ${this.getFormFields(tabela)}
          ${tabela === 'pedidos' ? this.getItensPedidoFields() : ''}
          <div class="form-actions">
            <button type="button" class="cancel-btn">Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    `;
  }

  setupFormularioEventListeners(tabela) {
    const form = document.getElementById(`${tabela}-form`);
    
    form.addEventListener('submit', (event) => {
      if (tabela === 'fornecedores') {
        const cnpjInput = form.querySelector('#cnpj');
        if (cnpjInput && !this.validarCNPJ(cnpjInput.value)) {
          event.preventDefault();
          alert('Por favor, insira um CNPJ válido.');
          return;
        }
      }
      this.salvarItem(event, tabela);
    });
    
    form.querySelector('.cancel-btn').addEventListener('click', () => this.cancelarEdicao());
    
    form.querySelectorAll('.btn-select').forEach(btn => {
      btn.addEventListener('click', () => this.abrirJanelaSelecao(btn.dataset.campo, tabela));
    });
  }

  getFormFields(tabela) {
    const campos = {
      cargos: ['nome', 'descricao'],
      paises: ['nome', 'codigo_iso'],
      funcionarios: ['nome', 'email', 'senha', 'cargo_id', 'telefone', 'ativo'],
      clientes: ['nome', 'sobrenome', 'email', 'telefone', 'cpf_cnpj', 'cep', 'estado', 'cidade', 'pais_id', 'senha'],
      categorias: ['nome', 'descricao'],
      produtos: ['nome', 'descricao', 'preco', 'quantidade_estoque', 'unidade_medida', 'categoria_id'],
      pedidos: ['data_pedido', 'cliente_id', 'funcionario_id'],
      fornecedores: ['nome', 'cnpj', 'telefone', 'email', 'endereco', 'cidade', 'estado', 'pais_id', 'site'],
      notas_fiscais: ['numero', 'data_emissao', 'valor_total', 'pedido_id']
    };

    const chavesEstrangeiras = {
      funcionarios: ['cargo_id'],
      clientes: ['pais_id'],
      produtos: ['categoria_id'],
      pedidos: ['funcionario_id', 'cliente_id'],
      itens_pedido: ['pedido_id', 'produto_id'],
      fornecedores: ['pais_id'],
      notas_fiscais: ['pedido_id']
    };

    return campos[tabela].map(campo => 
      this.criarCampoFormulario(campo, tabela, chavesEstrangeiras)
    ).join('');
  }

  criarCampoFormulario(campo, tabela, chavesEstrangeiras) {
    const type = this.determinarTipoCampo(campo);
    const isChaveEstrangeira = chavesEstrangeiras[tabela]?.includes(campo);

    return `
      <div class="form-group">
        <label for="${campo}">${this.formatarLabelCampo(campo)}:</label>
        ${this.criarInputCampo(campo, type, isChaveEstrangeira)}
      </div>
    `;
  }

  determinarTipoCampo(campo) {
    if (campo.includes('email')) return 'email';
    if (campo.includes('senha')) return 'password';
    if (campo.includes('preco') || campo.includes('valor') || campo.includes('quantidade')) return 'number';
    if (campo.includes('data')) return 'date';
    if (campo === 'ativo') return 'checkbox';
    return 'text';
  }

  formatarLabelCampo(campo) {
    return campo.charAt(0).toUpperCase() + campo.slice(1).replace('_', ' ');
  }

  criarInputCampo(campo, type, isChaveEstrangeira) {
    if (campo === 'id') {
      return `<input type="text" id="${campo}" name="${campo}" readonly>`;
    }
    
    if (isChaveEstrangeira) {
      return `
        <div class="input-group">
          <input type="text" id="${campo}" name="${campo}" required readonly>
          <button type="button" class="btn-select" data-campo="${campo}">Selecionar</button>
        </div>
      `;
    }
    
    if (type === 'checkbox') {
      return `<input type="${type}" id="${campo}" name="${campo}">`;
    }
    
    return `<input type="${type}" id="${campo}" name="${campo}" required>`;
  }

  getItensPedidoFields() {
    return `
      <div class="itens-pedido-container">
        <h3>Itens do Pedido</h3>
        <button type="button" class="add-item-btn" onclick="app.abrirJanelaSelecaoProduto()">
          <i class="fas fa-plus"></i> Adicionar Produto
        </button>
        <div class="itens-pedido-lista">
          <div class="itens-pedido-header">
            <span>Produto</span>
            <span>Quantidade</span>
            <span>Preço Unitário</span>
            <span>Total</span>
            <span>Ações</span>
          </div>
          <div id="itens-pedido-rows"></div>
        </div>
        <div id="total-pedido" class="total-pedido">Total do Pedido: R$ 0,00</div>
      </div>
    `;
  }

  async preencherFormulario(tabela, id) {
    try {
      const itens = await window.electron.ipcRenderer.invoke('listar-itens', tabela);
      const item = itens.find(i => i.id === parseInt(id));
      if (item) {
        const form = document.getElementById(`${tabela}-form`);
        Object.entries(item).forEach(([key, value]) => {
          const input = form.querySelector(`#${key}`);
          if (input) input.value = value;
        });
      }
    } catch (error) {
      console.error('Erro ao preencher formulário:', error);
      alert('Erro ao carregar dados do item');
    }
  }

  async salvarItem(event, tabela) {
    event.preventDefault();
    const form = event.target;
    const item = this.coletarDadosFormulario(form);

    try {
      const id = form.querySelector('#id')?.value;
      await this.salvarDadosNoBanco(tabela, item, id);
      this.carregarItens(tabela);
    } catch (error) {
      console.error(`Erro ao salvar item na tabela ${tabela}:`, error);
      this.mostrarErroSalvamento(error);
    }
  }

  coletarDadosFormulario(form) {
    const item = {};
    form.querySelectorAll('input, select').forEach(input => {
      if (input.id !== 'id' && input.id !== 'produto_id' && 
          input.id !== 'quantidade' && input.id !== 'preco_unitario') {
        item[input.id] = input.type === 'checkbox' ? input.checked : input.value;
      }
    });
    return item;
  }

  async salvarDadosNoBanco(tabela, item, id) {
    if (tabela === 'pedidos') {
      if (id) {
        await window.electron.ipcRenderer.invoke('atualizar-pedido', { pedido: item, itens: this.itensPedido, id });
      } else {
        await window.electron.ipcRenderer.invoke('adicionar-pedido', { pedido: item, itens: this.itensPedido });
      }
    } else {
      if (id) {
        await window.electron.ipcRenderer.invoke('atualizar-item', { tabela, item, id });
      } else {
        await window.electron.ipcRenderer.invoke('adicionar-item', { tabela, item });
      }
    }
  }

  mostrarErroSalvamento(error) {
    if (error.message.includes('Duplicate entry') && error.message.includes('cnpj')) {
      alert('Erro: O CNPJ informado já está cadastrado para outro fornecedor. Por favor, verifique e tente novamente.');
    } else if (error.message.includes('Duplicate entry')) {
      alert('Erro: Um dos campos únicos já existe no banco de dados. Por favor, verifique e tente novamente.');
    } else {
      alert(`Ocorreu um erro ao salvar o item. Por favor, tente novamente.`);
    }
  }

  cancelarEdicao() {
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('list-container').style.display = 'block';
  }

  async abrirJanelaSelecao(campo, tabelaOrigem) {
    try {
      const tabelaAlvo = campo.replace('_id', '');
      const itens = await window.electron.ipcRenderer.invoke('listar-itens', tabelaAlvo + 's');
      const janelaSelecao = this.criarJanelaSelecao(tabelaAlvo, itens, tabelaOrigem, campo);
    } catch (error) {
      console.error('Erro ao abrir janela de seleção:', error);
      alert('Erro ao carregar itens para seleção');
    }
  }

  criarJanelaSelecao(tabelaAlvo, itens, tabelaOrigem, campo) {
    const janelaSelecao = window.open('', 'Selecionar ' + tabelaAlvo, 'width=800,height=600');
    janelaSelecao.document.write(this.gerarHTMLJanelaSelecao(tabelaAlvo, itens, tabelaOrigem, campo));
    return janelaSelecao;
  }

  gerarHTMLJanelaSelecao(tabelaAlvo, itens, tabelaOrigem, campo) {
    return `
      <html>
        <head>
          <title>Selecionar ${tabelaAlvo}</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
          ${this.getJanelaSelecaoStyles()}
        </head>
        <body>
          <h2>Selecionar ${tabelaAlvo}</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              ${this.gerarLinhasJanelaSelecao(itens, tabelaOrigem, campo)}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  gerarLinhasJanelaSelecao(itens, tabelaOrigem, campo) {
    return itens.map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${item.nome || item.numero || item.data_pedido || ''}</td>
        <td>
          <button onclick="window.opener.app.selecionarItem('${tabelaOrigem}', '${campo}', ${item.id}, '${item.nome || item.numero || item.data_pedido || ''}'); window.close();">
            Selecionar
          </button>
        </td>
      </tr>
    `).join('');
  }

  getJanelaSelecaoStyles() {
    return `
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 20px;
        }
        h2 {
          color: #2c3e50;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background-color: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          color: #333;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #2980b9;
        }
      </style>
    `;
  }

  validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g,'');
    
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
  }

  selecionarItem(tabela, campo, id, nome) {
    document.getElementById(campo).value = id;
    document.getElementById(campo).setAttribute('data-nome', nome);
  }

  async carregarItens(tabela) {
    try {
      await window.electron.ipcRenderer.invoke('listar-itens', tabela);
      document.getElementById('form-container').style.display = 'none';
      document.getElementById('list-container').style.display = 'block';
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      alert('Erro ao atualizar lista de itens');
    }
  }
} 