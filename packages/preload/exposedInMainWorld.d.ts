interface Window {
    /**
     * Expose Environment versions.
     * @example
     * console.log( window.versions )
     */
    readonly versions: NodeJS.ProcessVersions;
    /**
     * Expose electron API
     * @example
     * window.electron.ipcRenderer.send('channel', 'data')
     */
    readonly electron: { ipcRenderer: { send: (channel: string, ...args: any[]) => void; on: (channel: string, listener: (event: any, ...args: any[]) => void) => Electron.IpcRenderer; }; };
}
