import { app, BrowserWindow, ipcMain, shell, desktopCapturer } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import './security-restrictions';
const Store = require('electron-store');
Store.initRenderer();

const isSingleInstance = app.requestSingleInstanceLock();
const isDevelopment = import.meta.env.MODE === 'development';

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    frame: false, // Remove window frame
    webPreferences: {
      nativeWindowOpen: true,
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      nodeIntegration: true,
      backgroundThrottling: false,
    },
  });

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();

    if (isDevelopment) {
      mainWindow?.webContents.openDevTools();
    }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl = isDevelopment && import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  // Handle Desktop Capture trough ipcMain
  ipcMain.handle(
    'dekstop-capture-get-sources',
    async (event, opts) => {
      const sources = await desktopCapturer.getSources(opts);

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        source.thumbnail = source.thumbnail.toDataURL() as any;
      }

      return sources;
    });

  // Handle window events trough ipcMain
  ipcMain.on('win-minimize', () => { mainWindow?.minimize(); });
  ipcMain.on('win-maximize', () => { mainWindow?.maximize(); });
  ipcMain.on('win-unmaximize', () => { mainWindow?.unmaximize(); });
  ipcMain.on('win-close', () => { mainWindow?.close(); });

  // Handle window events trough BrowserWindow
  mainWindow.on('maximize', () => { mainWindow?.webContents.send('maximized'); });
  mainWindow.on('unmaximize', () => { mainWindow?.webContents.send('unmaximized'); });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  await mainWindow.loadURL(pageUrl);
};

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady()
  .then(createWindow)
  .catch((e) => console.error('Failed create window:', e));

// Auto-updates
if (import.meta.env.PROD) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e));
}

