const { app, BrowserWindow, nativeImage, shell, ipcMain } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function init() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: false,
      nodeIntegration: true,
      nativeWindowOpen: true,
    },
    icon: nativeImage.createFromPath('./src/img/icons/icon.png')
  });

  // and load the index.html of the app.
  win.loadFile('index.html');

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  // Handle IPC messages

  // Window events

  ipcMain.on("win-minimize", function () {
    win.minimize();
  });

  ipcMain.on("win-maximize", function () {
    win.maximize();
  });

  ipcMain.on("win-unmaximize", function () {
    win.unmaximize();
  });

  ipcMain.on("win-close", function () {
    win.close();
  });

  win.on('maximize', () => {
    win.webContents.send('maximized');
  });

  win.on('unmaximize', () => {
    win.webContents.send('unmaximized');
  });

  win.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});;