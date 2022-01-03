import { app, BrowserWindow, ipcMain, shell, desktopCapturer, Tray, Menu, nativeImage } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import trayIconUrl from '../assets/icon-64.png';
import './security-restrictions';
const Store = require('electron-store');
Store.initRenderer();
const store = new Store();

const isSingleInstance = app.requestSingleInstanceLock();
const isDevelopment = import.meta.env.MODE === 'development';

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    frame: false, // Remove window frame
    webPreferences: {
      nativeWindowOpen: false,
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      nodeIntegration: true,
      backgroundThrottling: false,
    },
  });

  // Create/Update config
  const config = store.get('config') as StoredConfig;
  if (config) {
    if (!('blur' in config && 'refreshrate' in config && 'disabledColor' in config && 'closeToTray' in config && 'startWithWindows' in config && 'startInTray' in config)) {
      initConfig();
    }
  } else {
    initConfig();
  }

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', () => {
    if (!store.get('config.startInTray')) {
      mainWindow?.show();
    }

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

  // Handle settings change trough ipcMain
  ipcMain.on('set-start-with-windows', (_, args) => {
    app.setLoginItemSettings({
      openAtLogin: args,
    });
  });

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
  // Events handled in renderer process
  mainWindow.on('maximize', () => { mainWindow?.webContents.send('maximized'); });
  mainWindow.on('unmaximize', () => { mainWindow?.webContents.send('unmaximized'); });

  // Handle openinig links trough BrowserWindow
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // System tray behaviour
  const tray = createTray();

  mainWindow.on('close', (event) => {
    if (!isQuitting && store.get('config').closeToTray) {
      console.log('minimize to tray');
      event.preventDefault();
      mainWindow?.hide();
    } else {
      console.log('close');
      tray.destroy();
    }
  });

  await mainWindow.loadURL(pageUrl);
};

function initConfig() {
  store.set('config', {
    refreshrate: 30,
    blur: 0,
    disabledColor: {
      r: 0,
      g: 0,
      b: 0,
    },
    closeToTray: true,
    startWithWindows: true,
    startInTray: false,
  });

  app.setLoginItemSettings({
    openAtLogin: store.get('config.startWithWindows'),
  });
}

function createTray() {
  const img = nativeImage.createFromDataURL(trayIconUrl);
  const tray = new Tray(img);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'icue-ambilight',
      type: 'normal',
      enabled: false,
      // icon: nativeImage.createThumbnailFromPath(iconPath, { width: 10, height: 10 }),
    },
    {
      type: 'separator',
    },
    {
      label: 'Show', click: function () {
        mainWindow?.show();
      },
    },
    {
      label: 'Support', click: function () {
        shell.openExternal('https://github.com/augustinbegue/icue-ambilight/');
      },
    },
    {
      label: 'Reload', click: function () {
        mainWindow?.webContents.reload();
      },
    },
    {
      label: 'Quit', click: function () {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  tray.setContextMenu(contextMenu);
  tray.setToolTip('icue-ambilight');

  return tray;
}

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    mainWindow.show();
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  isQuitting = true;
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
