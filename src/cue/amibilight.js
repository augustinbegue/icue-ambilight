const sdk = require('cue-sdk');
let config = JSON.parse(localStorage.getItem('config'));

const amibilight = {
  init: function (positions, devices) {
    config = JSON.parse(localStorage.getItem('config'));
    this.c1 = document.getElementById("c1");
    this.ctx1 = this.c1.getContext("2d");

    // Override the disabled color if it is not present in the config
    if (!config.disabledColor || config.disabledColor.r) {
      config.disabledColor = {
        r: 0,
        g: 0,
        b: 0
      };

      localStorage.setItem("config", JSON.stringify(config));
    }

    this.reload(positions, devices);

    let self = this;
    setInterval(function () {
      self.updateLeds();
    }, 1000 / config?.refreshrate ? config.refreshrate : 30);
  },

  reload: function (positions, devices) {
    this.positions = positions;
    this.devices = devices;

    console.log(this.devices);
    console.log(this.positions);

    // Precomputing coordinates for capture
    this.imgDataCoordinates = [];
    for (let i = 0; i < positions.length; i++) {
      const device = this.devices[i];

      let startX = positions[i][0].left, startY = positions[i][0].top;
      for (let j = 0; j < positions[i].length; j++) {
        const element = positions[i][j];
        if (element.left < startX)
          startX = element.left;
        if (element.top < startY)
          startY = element.top;
      }

      this.imgDataCoordinates.push(positions[i].map(p => {
        const deviceXScale = (device.x2 - device.x1) / (device.sizeX - startX);
        const deviceYScale = (device.y2 - device.y1) / (device.sizeY - startY);

        return {
          ledId: p.ledId,
          sx: device.x1 + (p.left - startX) * deviceXScale,
          sy: device.y1 + (p.top - startY) * deviceYScale,
          sw: Math.ceil(p.width * deviceXScale),
          sh: Math.ceil(p.height * deviceYScale),
        };
      }));
    }

    console.log(this.imgDataCoordinates);
  },

  updateLeds: function () {
    this.layoutC = document.getElementById("displayCanvas");
    this.layoutCtx = this.layoutC?.getContext("2d");

    for (let i = 0; i < this.positions.length; i++) {
      if (this.positions[i].length > 0) {
        let colors = this.getColors(i, this.imgDataCoordinates[i]);
        sdk.CorsairSetLedsColorsBufferByDeviceIndex(i, colors);
        sdk.CorsairSetLedsColorsFlushBuffer();
      }
    }
  },

  getColors: function (index, imgDataCoordinates) {
    const device = this.devices[index];

    if (!device.enabled) {
      return colors = imgDataCoordinates.map((p) => {
        return {
          ledId: p.ledId,
          r: config.disabledColor.r,
          g: config.disabledColor.g,
          b: config.disabledColor.b
        };
      });
    }

    return colors = imgDataCoordinates.map((p) => {
      let imgData = this.ctx1.getImageData(p.sx, p.sy, p.sw, p.sh);

      imgData = imgData.data;

      let r = 0, g = 0, b = 0;
      for (let i = 0; i < imgData.length; i += 4) {
        r += imgData[i];
        g += imgData[i + 1];
        b += imgData[i + 2];
      }

      let num = (imgData.length / 4);
      r = Math.round(r / num);
      g = Math.round(g / (imgData.length / 4));
      b = Math.round(b / (imgData.length / 4));

      if (device.showLeds) {
        this.layoutCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.layoutCtx.fillRect(p.sx, p.sy, p.sw, p.sh);
      }

      return {
        ledId: p.ledId,
        r: r,
        g: g,
        b: b
      };
    });
  },
};

exports.amibilight = amibilight;  
