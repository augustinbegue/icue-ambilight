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

    console.log(this.info)

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        this.positions[i] = sdk.CorsairGetLedPositionsByDeviceIndex(i);
        console.log(this.positions[i]);
      }
    }

    this.devices = this.parseDevicesInfo(this.info, this.positions);

    amibilight.init(this.positions)
  },

  parseDevicesInfo: function(info, positions) {
    const devices = [];

    for (let i = 0; i < info.length; i++) {
      devices[i] = {};
      const device = devices[i];
      
      device.model = info[i].model;
      device.ledsCount = info[i].ledsCount;
      device.sizeX = positions[i].reduce((acc, curr) => Math.max(curr.left, acc), 0);
      device.sizeY = positions[i].reduce((acc, curr) => Math.max(curr.top, acc), 0);
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
