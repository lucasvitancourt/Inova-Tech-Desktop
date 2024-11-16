import { DashboardController } from './DashboardController.js';
import { MetricasController } from './MetricasController.js';
import { FormController } from './FormController.js';
import { ConfigController } from './ConfigController.js';
import { TableController } from './TableController.js';

export class AppController {
  constructor() {
    this.tabelaAtual = 'home';
    this.dashboardController = new DashboardController();
    this.metricasController = new MetricasController();
    this.formController = new FormController();
    this.configController = new ConfigController();
    this.tableController = new TableController();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.setupWindowControls();
    this.setupTabButtons();
    this.setupDocumentClickHandler();
    this.setupConfigButton();
    this.addHoverEffects();
    this.dashboardController.mostrarDashboard();
  }

  setupWindowControls() {
    ['minimize', 'maximize', 'close'].forEach(action => {
      document.getElementById(`${action}-btn`).addEventListener('click', (e) => {
        e.stopPropagation();
        window.electron.ipcRenderer.send(`${action}-window`);
      });
    });
  }

  setupTabButtons() {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        this.handleTabChange(button);
      });
    });
  }

  handleTabChange(button) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    this.tabelaAtual = button.dataset.tabela;
    
    this.showCurrentView();
  }

  showCurrentView() {
    if (this.tabelaAtual === 'home') {
      this.dashboardController.mostrarDashboard();
    } else if (this.tabelaAtual === 'metricas') {
      this.metricasController.mostrarMetricas();
    } else {
      this.esconderTodosContainers();
      this.tableController.carregarItens(this.tabelaAtual);
    }
  }

  setupDocumentClickHandler() {
    document.addEventListener('click', async (event) => {
      if (event.target.matches('.add-button')) {
        this.formController.mostrarFormulario(event.target.dataset.tabela);
      } else if (event.target.matches('.edit-btn')) {
        this.formController.editarItem(event.target.dataset.tabela, event.target.dataset.id);
      } else if (event.target.matches('.delete-btn')) {
        this.tableController.excluirItem(event.target.dataset.tabela, event.target.dataset.id);
      } else if (event.target.closest('.pdf-btn')) {
        await this.handlePdfGeneration(event);
      }
    });
  }

  setupConfigButton() {
    const configBtn = document.getElementById('config-btn');
    if (configBtn) {
      configBtn.addEventListener('click', () => {
        this.configController.mostrarConfigModal();
      });
    }
  }

  addHoverEffects() {
    const buttons = document.querySelectorAll('.edit-btn, .delete-btn, .pdf-btn, .window-controls button');
    buttons.forEach(button => {
      this.setupButtonHoverEffects(button);
    });
  }

  setupButtonHoverEffects(button) {
    button.addEventListener('mouseenter', (e) => {
      if (e.target === button || e.target.closest('button') === button) {
        button.classList.add('hover');
      }
    });

    button.addEventListener('mouseleave', () => {
      button.classList.remove('hover');
    });
  }

  esconderTodosContainers() {
    ['home-container', 'metricas-container', 'list-container', 'form-container'].forEach(id => {
      document.getElementById(id).style.display = 'none';
    });
  }

  async handlePdfGeneration(event) {
    const notaFiscalId = event.target.closest('.pdf-btn').dataset.id;
    try {
      const pdfPath = await window.electron.ipcRenderer.invoke('gerar-pdf-nota-fiscal', notaFiscalId);
      window.electron.ipcRenderer.send('abrir-pdf', pdfPath);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF da nota fiscal. Por favor, tente novamente.');
    }
  }
} 