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

    console.log(this.positions)

    amibilight.init(this.positions)
  },

  getMaxDefinition: function () {
    let extremums = {
      maxX: 0,
      maxY: 0,
    };

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        positions = sdk.CorsairGetLedPositionsByDeviceIndex(i);
        let newX = positions.reduce((acc, curr) => Math.max(curr.left, acc), 0);
        if (newX > extremums.maxX) {
          extremums.maxX = newX;
        }
        let newY = positions.reduce((acc, curr) => Math.max(curr.top, acc), 0);
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
