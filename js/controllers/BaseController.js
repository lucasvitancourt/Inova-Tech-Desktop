export class BaseController {
    esconderTodosContainers() {
        ['home-container', 'metricas-container', 'list-container', 'form-container'].forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
    }
} 