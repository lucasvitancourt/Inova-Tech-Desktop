import { BaseController } from './BaseController.js';

export class TableController extends BaseController {
  async carregarItens(tabela) {
    this.esconderTodosContainers();
    const listContainer = document.getElementById('list-container');
    listContainer.style.display = 'block';

    try {
      const itens = await window.electron.ipcRenderer.invoke('listar-itens', tabela);
      this.renderizarListaItens(tabela, itens, listContainer);
      this.aplicarFiltroEBusca(tabela, itens);
      this.addHoverEffects();
    } catch (error) {
      console.error(`Erro ao carregar itens da tabela ${tabela}:`, error);
      alert(`Ocorreu um erro ao carregar os itens da tabela ${tabela}. Por favor, tente novamente.`);
    }
  }

  renderizarListaItens(tabela, itens, container) {
    container.innerHTML = `
      <h2>${tabela.charAt(0).toUpperCase() + tabela.slice(1)}</h2>
      <button class="add-button" data-tabela="${tabela}">Adicionar Novo</button>
      ${this.criarTabela(tabela, itens)}
    `;
    document.getElementById('form-container').style.display = 'none';
  }

  criarTabela(tabela, itens) {
    if (itens.length === 0) return '<p>Nenhum item encontrado.</p>';

    const colunas = Object.keys(itens[0]);
    return `
      ${this.criarFiltroContainer(tabela, colunas)}
      ${this.criarTabelaConteudo(tabela, itens, colunas)}
    `;
  }

  criarFiltroContainer(tabela, colunas) {
    return `
      <div class="filtro-container">
        <input type="text" id="busca-${tabela}" placeholder="Buscar...">
        <select id="filtro-campo-${tabela}">
          <option value="">Todos os campos</option>
          ${colunas.map(coluna => `<option value="${coluna}">${coluna}</option>`).join('')}
        </select>
        <button id="aplicar-filtro-${tabela}">Filtrar</button>
      </div>
    `;
  }

  criarTabelaConteudo(tabela, itens, colunas) {
    return `
      <div class="table-responsive">
        <table id="${tabela}-table" class="${tabela}-table">
          ${this.criarTabelaHeader(colunas)}
          ${this.criarTabelaBody(tabela, itens, colunas)}
        </table>
      </div>
    `;
  }

  criarTabelaHeader(colunas) {
    return `
      <thead>
        <tr>
          ${colunas.map(coluna => `<th>${coluna === 'id' ? 'ID' : coluna}</th>`).join('')}
          <th>Ações</th>
        </tr>
      </thead>
    `;
  }

  criarTabelaBody(tabela, itens, colunas) {
    return `
      <tbody>
        ${itens.map(item => this.criarLinhaTabela(tabela, item, colunas)).join('')}
      </tbody>
    `;
  }

  criarLinhaTabela(tabela, item, colunas) {
    return `
      <tr>
        ${colunas.map(coluna => `
          <td title="${item[coluna]}">${item[coluna]}</td>
        `).join('')}
        <td class="action-buttons">
          ${this.criarBotoesAcao(tabela, item.id)}
        </td>
      </tr>
    `;
  }

  criarBotoesAcao(tabela, id) {
    return `
      <button class="edit-btn" data-tabela="${tabela}" data-id="${id}" title="Editar">
        <i class="fas fa-edit"></i>
      </button>
      <button class="delete-btn" data-tabela="${tabela}" data-id="${id}" title="Excluir">
        <i class="fas fa-trash"></i>
      </button>
      ${tabela === 'notas_fiscais' ? `
        <button class="pdf-btn" data-id="${id}" title="Gerar PDF">
          <i class="fas fa-file-pdf"></i>
        </button>
      ` : ''}
    `;
  }

  aplicarFiltroEBusca(tabela, itens) {
    const buscaInput = document.getElementById(`busca-${tabela}`);
    const filtroCampo = document.getElementById(`filtro-campo-${tabela}`);
    const aplicarFiltroBtn = document.getElementById(`aplicar-filtro-${tabela}`);

    aplicarFiltroBtn.addEventListener('click', () => {
      const termoBusca = buscaInput.value.toLowerCase();
      const campoFiltro = filtroCampo.value;
      const itensFiltrados = this.filtrarItens(itens, termoBusca, campoFiltro);
      this.atualizarTabelaComFiltro(tabela, itensFiltrados);
    });
  }

  filtrarItens(itens, termoBusca, campoFiltro) {
    return itens.filter(item => {
      if (campoFiltro) {
        return String(item[campoFiltro]).toLowerCase().includes(termoBusca);
      }
      return Object.values(item).some(valor => 
        String(valor).toLowerCase().includes(termoBusca)
      );
    });
  }

  atualizarTabelaComFiltro(tabela, itensFiltrados) {
    const tbody = document.querySelector(`#${tabela}-table tbody`);
    const colunas = Object.keys(itensFiltrados[0] || {});
    tbody.innerHTML = itensFiltrados.map(item => 
      this.criarLinhaTabela(tabela, item, colunas)
    ).join('');
    this.addHoverEffects();
  }

  async excluirItem(tabela, id) {
    if (confirm(`Tem certeza que deseja excluir este item da tabela ${tabela}?`)) {
      try {
        await window.electron.ipcRenderer.invoke('excluir-item', { tabela, id });
        this.carregarItens(tabela);
      } catch (error) {
        console.error(`Erro ao excluir item da tabela ${tabela}:`, error);
        alert(`Ocorreu um erro ao excluir o item da tabela ${tabela}. Por favor, tente novamente.`);
      }
    }
  }

  addHoverEffects() {
    const buttons = document.querySelectorAll('.edit-btn, .delete-btn, .pdf-btn');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        if (e.target === button || e.target.closest('button') === button) {
          button.classList.add('hover');
        }
      });

      button.addEventListener('mouseleave', () => {
        button.classList.remove('hover');
      });
    });
  }
} 