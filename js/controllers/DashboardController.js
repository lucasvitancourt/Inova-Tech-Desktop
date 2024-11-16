import { BaseController } from './BaseController.js';

export class DashboardController extends BaseController {
  async mostrarDashboard() {
    this.esconderTodosContainers();
    document.getElementById('home-container').style.display = 'block';

    try {
      const dashboardData = await window.electron.ipcRenderer.invoke('get-dashboard-data');
      this.updateDashboardCounts(dashboardData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      this.showDashboardError();
    }
  }

  updateDashboardCounts(data) {
    ['funcionarios', 'produtos', 'clientes', 'pedidos'].forEach(key => {
      document.getElementById(`total-${key}`).textContent = 
        data[`total${key.charAt(0).toUpperCase() + key.slice(1)}`] || '0';
    });
  }

  showDashboardError() {
    ['funcionarios', 'produtos', 'clientes', 'pedidos'].forEach(key => {
      document.getElementById(`total-${key}`).textContent = 'Erro';
    });
  }
} 