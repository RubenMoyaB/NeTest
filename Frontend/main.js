const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1250,
    height: 753,
    resizable: true,
    frame: true,  // Desactiva el marco de la ventana
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'), // Añade un archivo de preload
    },
  });

  win.loadFile('index.html');
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
