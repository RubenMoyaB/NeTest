const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 723,
    resizable: true,
    frame: true,  // Desactiva el marco de la ventana
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'), // Añade un archivo de preload
    },
  });

  win.loadFile('index.html');

  // Escuchar mensajes para los botones
  ipcMain.on('window-minimize', () => {
    win.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    win.close();
  });

  ipcMain.on('window-drag', () => {
    win.startDrag();
  });
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
