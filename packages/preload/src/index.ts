import { contextBridge, ipcRenderer } from 'electron';

/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */

/**
 * After analyzing the `exposeInMainWorld` calls,
 * `packages/preload/exposedInMainWorld.d.ts` file will be generated.
 * It contains all interfaces.
 * `packages/preload/exposedInMainWorld.d.ts` file is required for TS is `renderer`
 *
 * @see https://github.com/cawa-93/dts-for-context-bridge
 */

/**
 * Expose Environment versions.
 * @example
 * console.log( window.versions )
 */
contextBridge.exposeInMainWorld('versions', process.versions);

/**
 * Expose electron API
 * @example
 * window.electron.ipcRenderer.send('channel', 'data')
 */
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      console.log('send', channel, args);
      return ipcRenderer.send(channel, ...args);
    },
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
      console.log('on', channel);
      return ipcRenderer.on(channel, listener);
    },
  },
});