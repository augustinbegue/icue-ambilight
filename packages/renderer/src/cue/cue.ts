import type { CorsairDeviceInfo, CorsairError, CorsairLed, CorsairProtocolHandshake } from 'cue-sdk';
import { Amibilight } from './amibilight';

/**
 * Displays the error modal on the screen
 * @param {string} message Error message to display on the screen
 */
function displayError(message: string, reloadOnClose = false) {
  const errorContainer = document.getElementById('error-container');
  const errorField = document.getElementById('error-field');

  if (!errorContainer || !errorField)
    return;

  errorContainer.style.display = 'flex';
  errorField.innerHTML = message;

  document.getElementById('error-close')?.addEventListener('click', () => {
    errorContainer.style.display = 'none';
    if (reloadOnClose)
      window.location.reload();
  });
}

export class Cue {
  static details: CorsairProtocolHandshake;
  static errCode: CorsairError;

  static info: (CorsairDeviceInfo | undefined)[];
  static positions: CorsairLed[][];
  static devices: Device[];

  static async init() {
    this.details = window.cue.CorsairPerformProtocolHandshake();
    this.errCode = window.cue.CorsairGetLastError();

    this.info = [];
    this.positions = [];

    if (this.errCode !== 0) {
      displayError('The Corsair SDK is not connected. Please check that iCue is opened and that you have <a style="color: white; text-decoration: underline" href="https://github.com/augustinbegue/icue-ambilight/blob/master/Q%26A.md#how-to-enable-the-sdk-" target="_blank">enabled the sdk in the settings</a>. Then, close this warning to reload the app.', true);
      return;
    }

    this.info = this.getDevicesInfo();

    console.log('CorsairDeviceInfo:', this.info);

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i]?.capsMask && window.cue.CorsairDeviceCaps.CDC_Lighting) {
        this.positions[i] = window.cue.CorsairGetLedPositionsByDeviceIndex(i);
      }
    }

    this.devices = this.parseDevicesInfo(this.info, this.positions);

    console.log('Devices:', this.devices);
    console.log('CorsairLeds:', this.positions);

    Amibilight.init(this.positions, this.devices);
  }

  static getDevicesInfo() {
    const n = window.cue.CorsairGetDeviceCount();

    const info = [];

    for (let i = 0; i < n; ++i) {
      info[i] = window.cue.CorsairGetDeviceInfo(i);
    }

    return info;
  }

  static parseDevicesInfo(info: (CorsairDeviceInfo | undefined)[], positions: CorsairLed[][]) {
    const devices: Device[] = [];

    const previousDevices = window.store.get('devices');

    for (let i = 0; i < info.length; i++) {
      const cdi = info[i] as CorsairDeviceInfo;

      if (positions[i] === undefined) {
        console.log('no positions for', cdi);
      }

      const device: Device = {
        enabled: false,
        showLeds: false,
        model: cdi.model,
        ledsCount: cdi.ledsCount,
        sizeX: positions[i] !== undefined ? positions[i][0].width : 0,
        sizeY: positions[i] !== undefined ? positions[i][0].height : 0,
        x1: 0,
        y1: 0,
        x2: positions[i] !== undefined ? positions[i][0].width : 0,
        y2: positions[i] !== undefined ? positions[i][0].height : 0,
      };

      if (previousDevices && previousDevices[i] && !previousDevices[i].enabled) {
        device.enabled = false;
      } else {
        device.enabled = true;
      }

      if (!device.ledsCount) device.enabled = false;

      if (positions[i]) {
        for (let j = 0; j < positions[i].length; j++) {
          const pos = positions[i][j];
          if (pos.left + pos.width > device.sizeX) {
            device.sizeX = pos.left + pos.width + 1;
          }
          if (pos.top + pos.height > device.sizeY) {
            device.sizeY = pos.top + pos.height + 1;
          }
        }
      } else {
        device.sizeX = 1;
        device.sizeY = 1;
      }

      if (previousDevices && previousDevices[i] && previousDevices[i].model == device.model) {
        device.x1 = previousDevices[i].x1;
        device.y1 = previousDevices[i].y1;
        device.x2 = previousDevices[i].x2;
        device.y2 = previousDevices[i].y2;
      }

      devices.push(device);
    }

    return devices;
  }

  static getMaxDefinition() {
    const extremums = {
      maxX: 0,
      maxY: 0,
    };

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i]?.capsMask && window.cue.CorsairDeviceCaps.CDC_Lighting) {
        const position = window.cue.CorsairGetLedPositionsByDeviceIndex(i);

        const newX = position.reduce((acc, curr) => Math.max(curr.left, acc), 0) / position.reduce((acc, curr) => Math.max(curr.width, acc), 0);

        if (newX > extremums.maxX) {
          extremums.maxX = newX;
        }
        const newY = position.reduce((acc, curr) => Math.max(curr.top, acc), 0) / position.reduce((acc, curr) => Math.max(curr.height, acc), 0);

        if (newY > extremums.maxY) {
          extremums.maxY = newY + 1;
        }
      }
    }

    return extremums;
  }
}