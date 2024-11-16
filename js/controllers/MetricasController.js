import { BaseController } from './BaseController.js';

export class MetricasController extends BaseController {
  constructor() {
    super();
    this.charts = {
      vendasPorMes: null,
      topProdutos: null, 
      clientesPorEstado: null,
      evolucaoVendas: null
    };
  }

  async mostrarMetricas() {
    this.esconderTodosContainers();
    document.getElementById('metricas-container').style.display = 'block';

    try {
      const metricasData = await window.electron.ipcRenderer.invoke('get-metricas-data');
      if (!metricasData) throw new Error('Dados de métricas não recebidos');
      
      this.destroyExistingCharts();
      this.createNewCharts(metricasData);
    } catch (error) {
      console.error('Erro ao carregar dados das métricas:', error);
      this.showMetricasError(error);
    }
  }

  destroyExistingCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
  }

  createNewCharts(metricasData) {
    const chartConfigs = {
      vendasPorMes: {
        data: metricasData.vendasPorMes,
        elementId: 'vendas-por-mes-chart',
        errorMessage: 'Sem dados de vendas por mês',
        creator: this.criarGraficoVendasPorMes.bind(this)
      },
      topProdutos: {
        data: metricasData.topProdutos,
        elementId: 'top-produtos-chart',
        errorMessage: 'Sem dados de top produtos',
        creator: this.criarGraficoTopProdutos.bind(this)
      },
      clientesPorEstado: {
        data: metricasData.clientesPorEstado,
        elementId: 'clientes-por-estado-chart',
        errorMessage: 'Sem dados de clientes por estado',
        creator: this.criarGraficoClientesPorEstado.bind(this)
      },
      evolucaoVendas: {
        data: metricasData.evolucaoVendas,
        elementId: 'evolucao-vendas-chart',
        errorMessage: 'Sem dados de evolução de vendas',
        creator: this.criarGraficoEvolucaoVendas.bind(this)
      }
    };

    Object.entries(chartConfigs).forEach(([key, config]) => {
      if (config.data && config.data.length > 0) {
        this.charts[key] = config.creator(config.data);
      } else {
        document.getElementById(config.elementId).innerHTML = config.errorMessage;
      }
    });
  }

  criarGraficoVendasPorMes(dados) {
    const ctx = document.getElementById('vendas-por-mes-chart').getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dados.map(d => d.mes),
        datasets: [{
          label: 'Vendas',
          data: dados.map(d => d.total),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  criarGraficoTopProdutos(dados) {
    const ctx = document.getElementById('top-produtos-chart').getContext('2d');
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels: dados.map(d => d.nome),
        datasets: [{
          data: dados.map(d => d.quantidade),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ]
        }]
      },
      options: { responsive: true }
    });
  }

  criarGraficoClientesPorEstado(dados) {
    const ctx = document.getElementById('clientes-por-estado-chart').getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dados.map(d => d.estado),
        datasets: [{
          label: 'Clientes',
          data: dados.map(d => d.total),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  criarGraficoEvolucaoVendas(dados) {
    const ctx = document.getElementById('evolucao-vendas-chart').getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: dados.map(d => d.data),
        datasets: [{
          label: 'Vendas',
          data: dados.map(d => d.total),
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  showMetricasError(error) {
    document.getElementById('metricas-container').innerHTML = `
      <h2>Erro ao carregar métricas</h2>
      <p>Ocorreu um erro ao carregar os dados das métricas. Por favor, tente novamente mais tarde.</p>
      <p>Detalhes do erro: ${error.message}</p>
    `;
  }
} 