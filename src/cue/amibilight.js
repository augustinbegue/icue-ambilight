const sdk = require('cue-sdk');
const config = JSON.parse(localStorage.getItem('config'));

const amibilight = {
  init: function (positions) {
    this.c1 = document.getElementById("c1");
    this.ctx1 = this.c1.getContext("2d");

    this.positions = positions;

    let self = this;
    setInterval(function () {
      self.updateLeds();
    }, 1000 / config.refreshrate);
  },

  updateLeds: function () {
    for (let i = 0; i < this.positions.length; i++) {
      sdk.CorsairSetLedsColorsBufferByDeviceIndex(i, this.getColors(this.positions[i]));
      sdk.CorsairSetLedsColorsFlushBuffer();
    }
  },

  getColors: function (positions) {
    return colors = positions.map((p) => {
      const imgData = this.ctx1.getImageData(p.left, p.top, 1, 1).data;
      return {
        ledId: p.ledId,
        r: imgData[0],
        g: imgData[1],
        b: imgData[2]
      };
    });
  },
};

exports.amibilight = amibilight;
