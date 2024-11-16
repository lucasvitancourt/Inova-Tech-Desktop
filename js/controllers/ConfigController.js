import { BaseController } from './BaseController.js';

export class ConfigController extends BaseController {
  async mostrarConfigModal() {
    const modalHTML = `
      <div class="modal-overlay"></div>
      <div class="config-modal">
        <h2><i class="fas fa-cog"></i> Configurações do Banco de Dados</h2>
        <form id="config-form" class="config-form">
          <div class="form-group">
            <label for="db-host">Host</label>
            <input type="text" id="db-host" name="host" required>
          </div>
          <div class="form-group">
            <label for="db-port">Porta</label>
            <input type="number" id="db-port" name="port" required>
          </div>
          <div class="form-group">
            <label for="db-user">Usuário</label>
            <input type="text" id="db-user" name="user" required>
          </div>
          <div class="form-group">
            <label for="db-password">Senha</label>
            <input type="password" id="db-password" name="password">
          </div>
          <div class="form-group">
            <label for="db-name">Nome do Banco</label>
            <input type="text" id="db-name" name="database" required>
          </div>
          <div class="config-actions">
            <button type="button" class="test-connection-btn">
              <i class="fas fa-plug"></i> Testar Conexão
            </button>
            <button type="submit">
              <i class="fas fa-save"></i> Salvar
            </button>
            <button type="button" class="cancel-btn">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
        <div class="current-config">
          <h3>Configuração Atual:</h3>
          <pre id="current-config-display"></pre>
        </div>
      </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    await this.carregarConfiguracoesAtuais();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = document.getElementById('config-form');
    const testBtn = form.querySelector('.test-connection-btn');
    const cancelBtn = form.querySelector('.cancel-btn');

    form.addEventListener('submit', (e) => this.salvarConfiguracoes(e));
    testBtn.addEventListener('click', () => this.testarConexao());
    cancelBtn.addEventListener('click', () => this.fecharConfigModal());
  }

  async carregarConfiguracoesAtuais() {
    try {
      const config = await window.electron.ipcRenderer.invoke('get-db-config');
      if (config) {
        this.preencherFormulario(config);
        const configDisplay = document.getElementById('current-config-display');
        if (configDisplay) {
          const displayConfig = {
            ...config,
            password: '********'
          };
          configDisplay.textContent = JSON.stringify(displayConfig, null, 2);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.mostrarNotificacao('Erro ao carregar configurações', 'error');
    }
  }

  preencherFormulario(config) {
    const campos = ['host', 'port', 'user', 'password', 'database'];
    campos.forEach(campo => {
      const input = document.getElementById(`db-${campo}`);
      if (input) input.value = config[campo] || '';
    });
  }

  async salvarConfiguracoes(event) {
    event.preventDefault();
    const config = this.coletarDadosFormulario();

    try {
      await window.electron.ipcRenderer.invoke('save-db-config', config);
      this.mostrarNotificacao('Configurações salvas com sucesso!', 'success');
      this.fecharConfigModal();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      this.mostrarNotificacao('Erro ao salvar configurações', 'error');
    }
  }

  coletarDadosFormulario() {
    return {
      host: document.getElementById('db-host').value,
      port: document.getElementById('db-port').value,
      user: document.getElementById('db-user').value,
      password: document.getElementById('db-password').value,
      database: document.getElementById('db-name').value
    };
  }

  async testarConexao() {
    const config = this.coletarDadosFormulario();

    try {
      await window.electron.ipcRenderer.invoke('test-db-connection', config);
      this.mostrarNotificacao('Conexão estabelecida com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      this.mostrarNotificacao('Erro ao conectar com o banco de dados', 'error');
    }
  }

  fecharConfigModal() {
    const modal = document.querySelector('.modal-overlay')?.parentElement;
    if (modal) modal.remove();
  }

  mostrarNotificacao(mensagem, tipo) {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensagem;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
} 