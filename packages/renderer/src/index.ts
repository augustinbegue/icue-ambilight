import { Processor } from './capture/processor';
import { refreshDeviceInfo, refreshSources } from './capture/sources';
import { Cue } from './cue/cue';
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
        closeToTray: true,
        startWithWindows: true,
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
    if (!config.disabledColor || !config.refreshrate || !config.blur || !config.closeToTray) {
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
        Cue.init();
        refreshSources();
        refreshDeviceInfo();
        Processor.doLoad().then(() => {
            initLayout();
        });

        // Handle Settings checkboxes
        const startWithWindowsCheckbox = document.getElementById('startWithWindowsCheckbox') as HTMLInputElement;
        startWithWindowsCheckbox.checked = config.startWithWindows;
        startWithWindowsCheckbox.onchange = (ev) => {
            window.store.set('config', {
                ...window.store.get('config'),
                startWithWindows: (ev.target as HTMLInputElement).checked,
            });
            window.electron.ipcRenderer.send('set-start-with-windows', (ev.target as HTMLInputElement).checked);
        };

        const minimizeToTrayCheckbox = document.getElementById('minimizeToTrayCheckbox') as HTMLInputElement;
        minimizeToTrayCheckbox.checked = config.closeToTray;
        minimizeToTrayCheckbox.onchange = (ev) => {
            window.store.set('config', {
                ...window.store.get('config'),
                closeToTray: (ev.target as HTMLInputElement).checked,
            });
        };
    }
};
