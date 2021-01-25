const sdk = require('cue-sdk');
const { amibilight } = require("./amibilight");

const cue = {
  init: async function () {
    this.details = sdk.CorsairPerformProtocolHandshake();
    this.errCode = sdk.CorsairGetLastError();

    this.info = [];
    this.positions = [];

    if (this.errCode === 0) {
      // 'CE_Success'
    }

    this.info = this.getDevicesInfo()

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        this.positions[i] = sdk.CorsairGetLedPositionsByDeviceIndex(i);
      }
    }

    this.devices = this.parseDevicesInfo(this.info, this.positions);

    console.log(this.positions)

    amibilight.init(this.positions, this.devices)
  },

  parseDevicesInfo: function(info, positions) {
    const devices = [];

    let previousDevices = JSON.parse(localStorage.getItem("devices"));

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
      if (positions[i]) {
        device.sizeX = positions[i].reduce((acc, curr) => Math.max(curr.left, acc), 0);
        device.sizeY = positions[i].reduce((acc, curr) => Math.max(curr.top, acc), 0);
      } else {
        device.sizeX = 1
        device.sizeY = 1
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
    let extremums = {
      maxX: 0,
      maxY: 0,
    };

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        position = sdk.CorsairGetLedPositionsByDeviceIndex(i);
        let newX = position.reduce((acc, curr) => Math.max(curr.left, acc), 0);
        if (newX > extremums.maxX) {
          extremums.maxX = newX;
        }
        let newY = position.reduce((acc, curr) => Math.max(curr.top, acc), 0);
        if (newY > extremums.maxY) {
          extremums.maxY = newY + 1;
        }
      }
    }

    return extremums;
  },

  getDevicesInfo: function () {
    const n = sdk.CorsairGetDeviceCount();
    
    let info = [];
    
    for (let i = 0; i < n; ++i) {
      info[i] = sdk.CorsairGetDeviceInfo(i);
    }

    return info;
  }
}

exports.cue = cue;
