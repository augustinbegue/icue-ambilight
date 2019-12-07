const sdk = require('cue-sdk');
const config = JSON.parse(localStorage.getItem('config'))

const cue = {
  init: async function () {
    
    this.c1 = document.getElementById("c1");
    this.ctx1 = this.c1.getContext("2d");

    this.details = sdk.CorsairPerformProtocolHandshake();
    this.errCode = sdk.CorsairGetLastError();

    this.info = [];
    this.positions = [];

    if (this.errCode === 0) {
      // 'CE_Success'
    }

    const n = sdk.CorsairGetDeviceCount();
    
    for (let i = 0; i < n; ++i) {
      this.info[i] = sdk.CorsairGetDeviceInfo(i);
    }

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        this.positions[i] = sdk.CorsairGetLedPositionsByDeviceIndex(i);
      }
    }

    let self = this;
    setInterval(function () {
      self.updateLeds()
    }, 1000 / config.refreshrate)
  },
  updateLeds: function () {
    for (let i = 0; i < this.positions.length; i++) {
      sdk.CorsairSetLedsColorsBufferByDeviceIndex(i, this.getColors(this.positions[i]));
      sdk.CorsairSetLedsColorsFlushBuffer();
    }
  },
  getColors: function (positions) {
    return colors = positions.map((p) => {
      const imgData = this.ctx1.getImageData(p.left, p.top, 1, 1).data
      return {
        ledId: p.ledId,
        r: imgData[0],
        g: imgData[1],
        b: imgData[2]
      }
    });
  },
  getMaxDefinition: function () {
    let extremums = {
      maxX: 0,
      maxY: 0,
    }

    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        positions = sdk.CorsairGetLedPositionsByDeviceIndex(i);
        let newX = positions.reduce((acc, curr) => Math.max(curr.left, acc), 0);
        if (newX > extremums.maxX) {
          extremums.maxX = newX
        }
        let newY = positions.reduce((acc, curr) => Math.max(curr.top, acc), 0);
        if (newY > extremums.maxY) {
          extremums.maxY = newY+1
        }
      }
    }

    return extremums;
  }
}


exports.cue = cue;
