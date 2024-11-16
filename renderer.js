document.addEventListener('DOMContentLoaded', async () => {
    const { AppController } = await import('./js/controllers/AppController.js');
    const { DashboardController } = await import('./js/controllers/DashboardController.js');
    const { MetricasController } = await import('./js/controllers/MetricasController.js');
    const { FormController } = await import('./js/controllers/FormController.js');
    const { ConfigController } = await import('./js/controllers/ConfigController.js');
    const { TableController } = await import('./js/controllers/TableController.js');

    window.app = new AppController();
});

