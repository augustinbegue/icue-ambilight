const { _electron: electron } = require('playwright');
const { strict: assert } = require('assert');

// Playwright has EXPERIMENTAL electron support.
(async () => {
  const electronApp = await electron.launch({ args: ['.'] });

  /**
   * App main window state
   * @type {{isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean}}
   */
  const windowState = await electronApp.evaluate(({ BrowserWindow }) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];

    const getState = () => ({
      isVisible: mainWindow.isVisible(),
      isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
      isCrashed: mainWindow.webContents.isCrashed(),
    });

    return new Promise((resolve) => {
      if (mainWindow.isVisible()) {
        resolve(getState());
      } else
        mainWindow.once('ready-to-show', () => setTimeout(() => resolve(getState()), 0));
    });
  });

  // Check main window state
  assert.ok(windowState.isVisible, 'Main window not visible');
  assert.ok(!windowState.isDevToolsOpened, 'DevTools opened');
  assert.ok(!windowState.isCrashed, 'Window crashed');

  /**
   * Rendered Main window web-page
   * @type {Page}
   */
  // const page = await electronApp.firstWindow();

  // TODO: Write tests

  // Close app
  await electronApp.close();
})();
