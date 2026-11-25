const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// Data is saved here — a normal file on this PC, nothing sent anywhere.
// Windows: C:\Users\<you>\AppData\Roaming\Factory Ledger\ledger-data.json
const dataDir = app.getPath('userData');
const dataFile = path.join(dataDir, 'ledger-data.json');
const backupFile = path.join(dataDir, 'ledger-data.backup.json');
let mainWin = null;

function sendUpdateStatus(status, info) {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('ledger:updateStatus', { status, ...info });
  }
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => sendUpdateStatus('checking'));
  autoUpdater.on('update-available', (info) => sendUpdateStatus('available', { version: info.version }));
  autoUpdater.on('update-not-available', () => sendUpdateStatus('latest'));
  autoUpdater.on('update-downloaded', (info) => sendUpdateStatus('downloaded', { version: info.version }));
  autoUpdater.on('error', () => {
    // Offline or no release yet — stay quiet unless manually triggered
    sendUpdateStatus('offline');
  });

  if (app.isPackaged) {
    // Check silently on startup; never blocks offline use
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 3000);
  }
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 840,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  Menu.setApplicationMenu(null);
  mainWin.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('ledger:getData', async () => {
  try {
    if (fs.existsSync(dataFile)) return fs.readFileSync(dataFile, 'utf-8');
    if (fs.existsSync(backupFile)) return fs.readFileSync(backupFile, 'utf-8');
    return null;
  } catch (e) {
    console.error('Read failed', e);
    try {
      if (fs.existsSync(backupFile)) return fs.readFileSync(backupFile, 'utf-8');
    } catch (_) {}
    return null;
  }
});

ipcMain.handle('ledger:saveData', async (event, json) => {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    // Keep a backup of the previous saved file and write atomically via a temp file
    if (fs.existsSync(dataFile)) {
      fs.copyFileSync(dataFile, backupFile);
    }
    const tmpFile = dataFile + '.tmp';
    fs.writeFileSync(tmpFile, json, 'utf-8');
    fs.renameSync(tmpFile, dataFile);
    return true;
  } catch (e) {
    console.error('Write failed', e);
    return false;
  }
});

// Opens a URL/URI with the OS default handler (e.g. whatsapp:// launches WhatsApp Desktop)
ipcMain.handle('ledger:openExternal', async (event, url) => {
  try {
    await shell.openExternal(url);
    return true;
  } catch (e) {
    console.error('openExternal failed', e);
    return false;
  }
});

ipcMain.handle('ledger:checkUpdates', async () => {
  if (!app.isPackaged) return { ok: false, reason: 'dev' };
  try {
    await autoUpdater.checkForUpdates();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'offline' };
  }
});

ipcMain.handle('ledger:installUpdate', () => {
  autoUpdater.quitAndInstall();
});
