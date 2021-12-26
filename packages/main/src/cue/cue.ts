import * as sdk from 'cue-sdk';
import { amibilight } from './amibilight';

/**
 * Displays the error modal on the screen
 * @param {string} message Error message to display on the screen
 */
function displayError(message) {
  const errorContainer = document.getElementById('error-container');
  const errorField = document.getElementById('error-field');

  errorContainer.style.display = 'flex';
  errorField.innerHTML = message;

  document.getElementById('error-close').addEventListener('click', () => {
    const errorContainer = document.getElementById('error-container');
    errorContainer.style.display = 'none';
  });
}

export const cue = {
  init: async function () {
    this.details = sdk.CorsairPerformProtocolHandshake();
    this.errCode = sdk.CorsairGetLastError();

    this.info = [];
    this.positions = [];

    if (this.errCode === 1) {
      console.error('The Corsair SDK is not connected. Please check that iCue is opened and that you have enabled the sdk in the settings (see https://github.com/Tagueo/icue-ambilight/blob/master/README.md#how-to-enable-the-sdk-)');
      displayError('The Corsair SDK is not connected. Please check that iCue is opened and that you have enabled the sdk in the settings. Then, reload the app.');
    }

    this.info = this.getDevicesInfo();

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        this.positions[i] = sdk.CorsairGetLedPositionsByDeviceIndex(i);
      }
    }

    this.devices = this.parseDevicesInfo(this.info, this.positions);

    amibilight.init(this.positions, this.devices);
  },

  parseDevicesInfo: function (info, positions) {
    const devices = [];

    const previousDevices = JSON.parse(localStorage.getItem('devices'));

    for (let i = 0; i < info.length; i++) {
      devices[i] = {};
      const device = devices[i];

      if (previousDevices && previousDevices[i] && !previousDevices[i].enabled) {
        device.enabled = false;
      } else {
        device.enabled = true;
      }

      device.model = info[i].model;
      device.ledsCount = info[i].ledsCount;

      device.sizeX = positions[i][0].width;
      device.sizeY = positions[i][0].height;

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
      } else {
        device.x1 = 0;
        device.y1 = 0;
        device.x2 = device.sizeX;
        device.y2 = device.sizeY;
      }
    }

    return devices;
  },

  getMaxDefinition: function () {
    const extremums = {
      maxX: 0,
      maxY: 0,
    };

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        position = sdk.CorsairGetLedPositionsByDeviceIndex(i);
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
  },

  getDevicesInfo: function () {
    const n = sdk.CorsairGetDeviceCount();

    const info = [];

    for (let i = 0; i < n; ++i) {
      info[i] = sdk.CorsairGetDeviceInfo(i);
    }

    return info;
  },
};
