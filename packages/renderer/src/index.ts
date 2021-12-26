import { Panels } from './gui/Panels';

function initConfig() {
    localStorage.setItem('config', `${JSON.stringify({
        refreshrate: 30,
        disabledColor: {
            r: 0,
            g: 0,
            b: 0,
        },
    })}`);
}

function handleWindowControls() {
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button')?.addEventListener('click', () => {
        console.log('minimise');
        window.electron.ipcRenderer.send('win-minimize');
    });

    document.getElementById('max-button')?.addEventListener('click', () => {
        console.log('maximise');
        window.electron.ipcRenderer.send('win-maximize');
    });

    document.getElementById('restore-button')?.addEventListener('click', () => {
        console.log('restore');
        window.electron.ipcRenderer.send('win-unmaximize');
    });

    document.getElementById('close-button')?.addEventListener('click', () => {
        console.log('close');
        window.electron.ipcRenderer.send('win-close');
    });

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    window.electron.ipcRenderer.on('maximized', () => {
        toggleMaxRestoreButtons(true);
    });

    window.electron.ipcRenderer.on('unmaximized', () => {
        toggleMaxRestoreButtons(false);
    });

    function toggleMaxRestoreButtons(isMaximized: boolean) {
        if (isMaximized) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}

const configstr = localStorage.getItem('config');

if (configstr) {
    const config = JSON.parse(configstr);

    if (!config.disabledColor || !config.refreshrate) {
        initConfig();
    }
} else {
    initConfig();
}

handleWindowControls();
new Panels();