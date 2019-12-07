const sdk = require('cue-sdk');

const cue = {
  init: async function () {
    this.details = sdk.CorsairPerformProtocolHandshake();
    this.errCode = sdk.CorsairGetLastError();
    if (this.errCode === 0) {
      // 'CE_Success'
    }

    const n = sdk.CorsairGetDeviceCount();
    this.info = [];

    for (let i = 0; i < n; ++i) {
      this.info[i] = sdk.CorsairGetDeviceInfo(i);
    }

    let self = this;
    setInterval(function () {
      self.updateLeds()
    }, 1000 / 60)
  },
  updateLeds: function () {
    for (let i = 0; i < this.info.length; i++) {
      if (this.info[i].capsMask & sdk.CorsairDeviceCaps.CDC_Lighting) {
        positions = sdk.CorsairGetLedPositionsByDeviceIndex(i);

        sdk.CorsairSetLedsColorsBufferByDeviceIndex(i, this.getColors(positions));
        sdk.CorsairSetLedsColorsFlushBuffer();
      }
    }
  },
  getColors: function (positions) {
    this.c1 = document.getElementById("c1");
    this.ctx1 = this.c1.getContext("2d");
    const height = this.c1.height;
    const length = this.c1.length;

    this.extremums = {
      minX: positions.reduce((acc, curr) => Math.min(curr.left, acc), 0),
      maxX: positions.reduce((acc, curr) => Math.max(curr.left, acc), 0),
      minY: positions.reduce((acc, curr) => Math.min(curr.top, acc), 0),
      maxY: positions.reduce((acc, curr) => Math.max(curr.top, acc), 0),
    }

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
          extremums.maxY = newY
        }
      }
    }

    return extremums;
  }
}


exports.cue = cue;
