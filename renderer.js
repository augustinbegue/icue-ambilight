const { remote, shell } = require('electron');
const mainProcess = remote.require('./main.js');

const { processor } = require("./src/capture/processor");
const { cue } = require("./src/cue/cue");
const { Panels } = require("./src/gui/Panels");
const { refreshSources, refreshDeviceInfo } = require("./src/capture/sources");
const { initLayout } = require("./src/cue/layout");

const win = remote.getCurrentWindow(); /* Note this is different to the html global `window` variable */

let config = localStorage.getItem('config');

if (!config || !config.disabledColor || !config.refreshrate) {
  localStorage.setItem('config', `${JSON.stringify({
    refreshrate: 30,
    disabledColor: {
      r: 0,
      g: 0,
      b: 0
    }
  })}`);
}

/**
 * Displays the error modal on the screen
 * @param {string} message Error message to display on the screen
 */
function displayError(message) {
  const errorContainer = document.getElementById("error-container");
  const errorField = document.getElementById("error-field");

  errorContainer.style.display = 'flex';
  errorField.innerHTML = message;

  document.getElementById("error-close").addEventListener("click", _event => {
    const errorContainer = document.getElementById("error-container");
    errorContainer.style.display = 'none';
  });
}

function handleWindowControls() {
  // Make minimise/maximise/restore/close buttons work when they are clicked
  document.getElementById('min-button').addEventListener("click", _event => {
    win.minimize();
  });

  document.getElementById('max-button').addEventListener("click", _event => {
    win.maximize();
  });

  document.getElementById('restore-button').addEventListener("click", _event => {
    win.unmaximize();
  });

  document.getElementById('close-button').addEventListener("click", _event => {
    win.close();
  });

  // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
  toggleMaxRestoreButtons();
  win.on('maximize', toggleMaxRestoreButtons);
  win.on('unmaximize', toggleMaxRestoreButtons);

  function toggleMaxRestoreButtons() {
    if (win.isMaximized()) {
      document.body.classList.add('maximized');
    } else {
      document.body.classList.remove('maximized');
    }
  }
}
exports.handleWindowControls = handleWindowControls;
exports.displayError = displayError;

// When document has loaded, initialise
document.onreadystatechange = (_event) => {
  if (document.readyState == "complete") {
    handleWindowControls();
  }
};

window.onbeforeunload = (_event) => {
  /* If window is reloaded, remove win event listeners
  (DOM element listeners get auto garbage collected but not
  Electron win listeners as the win is not dereferenced unless closed) */
  win.removeAllListeners();
};

new Panels();
cue.init();
refreshSources();
refreshDeviceInfo();
processor.doLoad().then(() => {
  initLayout();
});




