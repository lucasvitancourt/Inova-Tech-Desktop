const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, data) => {
      const validChannels = [
        'get-dashboard-data',
        'get-metricas-data',
        'listar-itens',
        'adicionar-item',
        'atualizar-item',
        'excluir-item',
        'adicionar-pedido',
        'atualizar-pedido',
        'gerar-pdf-nota-fiscal',
        'get-db-config',
        'save-db-config',
        'test-db-connection'
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      return Promise.reject(new Error('Canal IPC não permitido'));
    },
    send: (channel, data) => {
      const validChannels = ['minimize-window', 'maximize-window', 'close-window', 'abrir-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel, func) => {
      const validChannels = ['update-dashboard', 'update-metricas'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
}); 