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
    readonly electron: { ipcRenderer: { send: (channel: string, ...args: any[]) => void; on: (channel: string, listener: (event: any, ...args: any[]) => void) => Electron.IpcRenderer; invoke: (channel: string, ...args: any[]) => Promise<any>; }; };
    /** Expose Cue SDK */
    readonly cue: typeof import('C:/Users/Augustin/GitHub/icue-ambilight/node_modules/cue-sdk/index');
    /** Expose electron-store */
    readonly store: { get: (key: string) => any; set: (key: string, value: any) => any; };
}
