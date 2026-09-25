const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().bounds;

  mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: false,
    skipTaskbar: false,
    focusable: true,
    icon: path.join(__dirname, 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  ipcMain.on('set-ignore-mouse', (_, ignore) => {
    if (!mainWindow) return;
    if (ignore) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  });

  ipcMain.on('set-always-on-top', (_, pin) => {
    if (!mainWindow) return;
    mainWindow.setAlwaysOnTop(pin); 
  });

  ipcMain.on('close-app', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.on('minimize-to-taskbar', () => {
    if (mainWindow) mainWindow.minimize();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.commandLine.appendSwitch('enable-transparent-visuals');

app.whenReady().then(() => {
  setTimeout(createWindow, 80);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
