import { processor } from './capture/processor';
import { refreshDeviceInfo, refreshSources } from './capture/sources';
import { cue } from './cue/cue';
import { initLayout } from './cue/layout';
import { Panels } from './gui/Panels';

function initConfig() {
    window.store.set('config', {
        refreshrate: 30,
        blur: 0,
        disabledColor: {
            r: 0,
            g: 0,
            b: 0,
        },
    });
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

const config = window.store.get('config') as StoredConfig;

if (config) {
    if (!config.disabledColor || !config.refreshrate) {
        initConfig();
    }
} else {
    initConfig();
}

// When document has loaded, initialise the app
document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        // Window controls
        handleWindowControls();

        // Layout panels
        new Panels();

        // Amibilight initialisation
        cue.init();
        refreshSources();
        refreshDeviceInfo();
        processor.doLoad().then(() => {
            initLayout();
        });
    }
};
