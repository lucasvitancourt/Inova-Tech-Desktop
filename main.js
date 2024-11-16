const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mysql = require('mysql2/promise');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const PDFWindow = require('electron-pdf-window');

// Usando import dinâmico para electron-store
let store;
(async () => {
  const { default: Store } = await import('electron-store');
  store = new Store();
})();

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#f4f7f6'
  });

  mainWindow.maximize();
  await mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inova_tech'
};

// Função para criar uma conexão com o banco de dados
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// Exemplo de operação CRUD: Listar usuários
ipcMain.handle('listar-usuarios', async () => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute('SELECT id, nome, email, cargo FROM usuarios');
    return rows;
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Adicionar usuário
ipcMain.handle('adicionar-usuario', async (event, usuario) => {
  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?, ?, ?, ?)',
      [usuario.nome, usuario.email, usuario.senha, usuario.cargo]
    );
    return result.insertId;
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Atualizar usuário
ipcMain.handle('atualizar-usuario', async (event, usuario) => {
  const connection = await getConnection();
  try {
    await connection.execute(
      'UPDATE usuarios SET nome = ?, email = ?, cargo = ? WHERE id = ?',
      [usuario.nome, usuario.email, usuario.cargo, usuario.id]
    );
    return true;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Excluir usuário
ipcMain.handle('excluir-usuario', async (event, id) => {
  const connection = await getConnection();
  try {
    await connection.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Função genérica para listar itens de qualquer tabela
ipcMain.handle('listar-itens', async (event, tabela) => {
  const connection = await getConnection();
  try {
    // Adicione esta verificação para corrigir o nome da tabela
    if (tabela === 'paiss') {
      tabela = 'paises';
    }
    const [rows] = await connection.execute(`SELECT * FROM ${tabela}`);
    return rows;
  } catch (error) {
    console.error(`Erro ao listar itens da tabela ${tabela}:`, error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Função genérica para adicionar item em qualquer tabela
ipcMain.handle('adicionar-item', async (event, { tabela, item }) => {
  const connection = await getConnection();
  try {
    const colunas = Object.keys(item).join(', ');
    const valores = Object.values(item);
    const placeholders = valores.map(() => '?').join(', ');
    const [result] = await connection.execute(
      `INSERT INTO ${tabela} (${colunas}) VALUES (${placeholders})`,
      valores
    );
    return result.insertId;
  } catch (error) {
    console.error(`Erro ao adicionar item na tabela ${tabela}:`, error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Função genérica para atualizar item em qualquer tabela
ipcMain.handle('atualizar-item', async (event, { tabela, item, id }) => {
  const connection = await getConnection();
  try {
    let setClause;
    let valores;

    if (tabela === 'fornecedores') {
      // Para fornecedores, excluímos o CNPJ da atualização se não foi alterado
      const [fornecedorAtual] = await connection.execute('SELECT * FROM fornecedores WHERE id = ?', [id]);
      setClause = Object.entries(item)
        .filter(([coluna, valor]) => coluna !== 'id' && (coluna !== 'cnpj' || valor !== fornecedorAtual[0].cnpj))
        .map(([coluna, valor]) => `${coluna} = ?`)
        .join(', ');
      valores = Object.entries(item)
        .filter(([coluna, valor]) => coluna !== 'id' && (coluna !== 'cnpj' || valor !== fornecedorAtual[0].cnpj))
        .map(([coluna, valor]) => valor);
    } else {
      setClause = Object.entries(item)
        .filter(([coluna, valor]) => coluna !== 'id')
        .map(([coluna, valor]) => `${coluna} = ?`)
        .join(', ');
      valores = Object.values(item).filter((_, index) => Object.keys(item)[index] !== 'id');
    }
    
    valores.push(id);
    
    await connection.execute(
      `UPDATE ${tabela} SET ${setClause} WHERE id = ?`,
      valores
    );
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar item na tabela ${tabela}:`, error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Função genérica para excluir item de qualquer tabela
ipcMain.handle('excluir-item', async (event, { tabela, id }) => {
  const connection = await getConnection();
  try {
    await connection.execute(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
    return true;
  } catch (error) {
    console.error(`Erro ao excluir item da tabela ${tabela}:`, error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Adicione mais operações CRUD aqui para outras tabelas

// Função para obter dados do dashboard
ipcMain.handle('get-dashboard-data', async () => {
  const connection = await getConnection();
  try {
    const [totalFuncionarios] = await connection.execute('SELECT COUNT(*) as total FROM funcionarios');
    const [totalProdutos] = await connection.execute('SELECT COUNT(*) as total FROM produtos');
    const [totalClientes] = await connection.execute('SELECT COUNT(*) as total FROM clientes');
    const [totalPedidos] = await connection.execute('SELECT COUNT(*) as total FROM pedidos');

    return {
      totalFuncionarios: totalFuncionarios[0].total,
      totalProdutos: totalProdutos[0].total,
      totalClientes: totalClientes[0].total,
      totalPedidos: totalPedidos[0].total
    };
  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error);
    return {
      totalFuncionarios: 0,
      totalProdutos: 0,
      totalClientes: 0,
      totalPedidos: 0
    };
  } finally {
    await connection.end();
  }
});

// Adicione estes handlers para controlar a janela
ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});

// Função para gerar PDF da nota fiscal
ipcMain.handle('gerar-pdf-nota-fiscal', async (event, notaFiscalId) => {
  const connection = await getConnection();
  try {
    // Buscar dados da nota fiscal
    const [notaFiscal] = await connection.execute('SELECT * FROM notas_fiscais WHERE id = ?', [notaFiscalId]);
    const [pedido] = await connection.execute('SELECT * FROM pedidos WHERE id = ?', [notaFiscal[0].pedido_id]);
    const [cliente] = await connection.execute('SELECT * FROM clientes WHERE id = ?', [pedido[0].cliente_id]);
    const [itensPedido] = await connection.execute(`
      SELECT ip.*, p.nome as produto_nome 
      FROM itens_pedido ip 
      JOIN produtos p ON ip.produto_id = p.id 
      WHERE ip.pedido_id = ?
    `, [pedido[0].id]);

    // Gerar PDF
    const pdfPath = path.join(app.getPath('temp'), `nota_fiscal_${notaFiscalId}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // Adicionar conteúdo ao PDF
    doc.fontSize(18).text('Nota Fiscal', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Número: ${notaFiscal[0].numero}`);
    doc.text(`Data de Emissão: ${new Date(notaFiscal[0].data_emissao).toLocaleDateString()}`);
    doc.text(`Cliente: ${cliente[0].nome} ${cliente[0].sobrenome}`);
    doc.moveDown();
    doc.text('Itens do Pedido:');
    
    // Tabela de itens
    let yPosition = doc.y + 20;
    doc.fontSize(10);
    doc.text('Produto', 50, yPosition);
    doc.text('Quantidade', 200, yPosition);
    doc.text('Preço Unitário', 300, yPosition);
    doc.text('Total', 400, yPosition);
    yPosition += 20;

    itensPedido.forEach((item) => {
      doc.text(item.produto_nome, 50, yPosition);
      doc.text(item.quantidade.toString(), 200, yPosition);
      doc.text(`R$ ${parseFloat(item.preco_unitario).toFixed(2)}`, 300, yPosition);
      doc.text(`R$ ${(parseFloat(item.quantidade) * parseFloat(item.preco_unitario)).toFixed(2)}`, 400, yPosition);
      yPosition += 20;
    });

    doc.moveDown();
    // Convertemos o valor_total para número antes de chamar toFixed()
    doc.fontSize(12).text(`Valor Total: R$ ${parseFloat(notaFiscal[0].valor_total).toFixed(2)}`, { align: 'right' });

    doc.end();

    // Esperar o PDF ser gerado
    await new Promise((resolve) => stream.on('finish', resolve));

    return pdfPath;
  } catch (error) {
    console.error('Erro ao gerar PDF da nota fiscal:', error);
    throw error;
  } finally {
    await connection.end();
  }
});

// Adicione estes handlers para controlar a janela
ipcMain.on('abrir-pdf', (event, pdfPath) => {
  let pdfWindow = new PDFWindow({
    width: 800,
    height: 600,
    backgroundColor: '#f4f7f6',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  pdfWindow.loadURL(pdfPath);

  pdfWindow.webContents.on('did-finish-load', () => {
    pdfWindow.webContents.insertCSS(`
      body {
        font-family: 'Roboto', sans-serif;
        background-color: #f4f7f6;
        margin: 0;
        padding: 20px;
      }
      #toolbar {
        background-color: #2c3e50 !important;
      }
    `);
  });
});

// ... (código anterior permanece o mesmo)

ipcMain.handle('get-metricas-data', async () => {
  const connection = await getConnection();
  try {
    const [vendasPorMes] = await connection.execute(`
      SELECT DATE_FORMAT(data_pedido, '%Y-%m') as mes, SUM(valor_total) as total
      FROM pedidos
      GROUP BY DATE_FORMAT(data_pedido, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `);

    const [topProdutos] = await connection.execute(`
      SELECT p.nome, SUM(ip.quantidade) as quantidade
      FROM itens_pedido ip
      JOIN produtos p ON ip.produto_id = p.id
      GROUP BY ip.produto_id
      ORDER BY quantidade DESC
      LIMIT 5
    `);

    const [clientesPorEstado] = await connection.execute(`
      SELECT estado, COUNT(*) as total
      FROM clientes
      GROUP BY estado
      ORDER BY total DESC
    `);

    const [evolucaoVendas] = await connection.execute(`
      SELECT DATE(data_pedido) as data, SUM(valor_total) as total
      FROM pedidos
      WHERE data_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(data_pedido)
      ORDER BY data
    `);

    return {
      vendasPorMes,
      topProdutos,
      clientesPorEstado,
      evolucaoVendas
    };
  } catch (error) {
    console.error('Erro ao obter dados das métricas:', error);
    return null;
  } finally {
    await connection.end();
  }
});

// ... (resto do código permanece o mesmo)

ipcMain.handle('adicionar-pedido', async (event, { pedido, itens }) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [resultPedido] = await connection.execute(
      'INSERT INTO pedidos (data_pedido, cliente_id, funcionario_id) VALUES (?, ?, ?)',
      [pedido.data_pedido, pedido.cliente_id, pedido.funcionario_id]
    );

    const pedidoId = resultPedido.insertId;

    for (const item of itens) {
      await connection.execute(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.produto_id, item.quantidade, item.preco_unitario]
      );
    }

    // Atualizar o valor total do pedido
    const [totalResult] = await connection.execute(
      'SELECT SUM(quantidade * preco_unitario) as total FROM itens_pedido WHERE pedido_id = ?',
      [pedidoId]
    );
    
    await connection.execute(
      'UPDATE pedidos SET valor_total = ? WHERE id = ?',
      [totalResult[0].total, pedidoId]
    );

    await connection.commit();
    return pedidoId;
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao adicionar pedido:', error);
    throw error;
  } finally {
    await connection.end();
  }
});

ipcMain.handle('atualizar-pedido', async (event, { pedido, itens, id }) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      'UPDATE pedidos SET data_pedido = ?, cliente_id = ?, funcionario_id = ? WHERE id = ?',
      [pedido.data_pedido, pedido.cliente_id, pedido.funcionario_id, id]
    );

    // Remover itens antigos
    await connection.execute('DELETE FROM itens_pedido WHERE pedido_id = ?', [id]);

    // Adicionar novos itens
    for (const item of itens) {
      await connection.execute(
        'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
        [id, item.produto_id, item.quantidade, item.preco_unitario]
      );
    }

    // Atualizar o valor total do pedido
    const [totalResult] = await connection.execute(
      'SELECT SUM(quantidade * preco_unitario) as total FROM itens_pedido WHERE pedido_id = ?',
      [id]
    );
    
    await connection.execute(
      'UPDATE pedidos SET valor_total = ? WHERE id = ?',
      [totalResult[0].total, id]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar pedido:', error);
    throw error;
  } finally {
    await connection.end();
  }
});

ipcMain.handle('get-db-config', () => {
  return {
    host: dbConfig.host,
    port: dbConfig.port || 3306, // porta padrão do MySQL
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
  };
});

ipcMain.handle('save-db-config', async (event, config) => {
  store.set('dbConfig', config);
  // Atualizar a configuração do banco de dados em tempo real
  dbConfig.host = config.host;
  dbConfig.user = config.user;
  dbConfig.password = config.password;
  dbConfig.database = config.database;
  dbConfig.port = config.port;
  return true;
});

ipcMain.handle('test-db-connection', async (event, config) => {
  try {
    const connection = await mysql.createConnection(config);
    await connection.connect();
    await connection.end();
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    throw error;
  }
});

