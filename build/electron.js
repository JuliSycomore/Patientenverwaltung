const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Determine the URL to load. In development, it's the React dev server.
  // In production, it's the built static index.html file.
  const startUrl =
    process.env.ELECTRON_START_URL ||
    'http://localhost:3000'

  // Load the URL into the window.
  mainWindow.loadURL(startUrl);

  // Optional: Open the DevTools for debugging.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished initialization
// and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});