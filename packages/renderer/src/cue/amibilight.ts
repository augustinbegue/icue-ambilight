import type { CorsairLed } from 'cue-sdk';
let config = window.store.get('config') as StoredConfig;

export class Amibilight {
  static c1: HTMLCanvasElement | null;
  static ctx1: CanvasRenderingContext2D | null | undefined;

  static layoutC: HTMLCanvasElement | null;
  static layoutCtx: CanvasRenderingContext2D | null | undefined;

  static imgDataCoordinates: ImgDataCoordinate[][];
  static positions: CorsairLed[][];
  static devices: Device[];

  static init(positions: CorsairLed[][], devices: Device[]) {
    config = window.store.get('config') as StoredConfig;

    this.c1 = document.getElementById('c1') as HTMLCanvasElement;
    this.ctx1 = this.c1?.getContext('2d');

    // Override the disabled color if it is not present in the config
    if (!config.disabledColor || config.disabledColor.r) {
      config.disabledColor = {
        r: 0,
        g: 0,
        b: 0,
      };

      window.store.set('config', JSON.stringify(config));
    }

    this.reload(positions, devices);

    const self = this;
    setInterval(function () {
      self.updateLeds();
    }, 1000 / config?.refreshrate ? config.refreshrate : 30);
  }

  static reload(positions: CorsairLed[][], devices: Device[]) {
    this.positions = positions;
    this.devices = devices;

    // Precomputing coordinates for capture
    this.imgDataCoordinates = [];
    for (let i = 0; i < positions.length; i++) {
      const device = this.devices[i];

      if (!device) {
        continue;
      }

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
  }

  static updateLeds() {
    this.layoutC = document.getElementById('displayCanvas') as HTMLCanvasElement;
    this.layoutCtx = this.layoutC?.getContext('2d');

    for (let i = 0; i < this.positions.length; i++) {
      if (this.positions[i].length > 0) {
        const colors = this.getColors(i, this.imgDataCoordinates[i]);
        window.cue.CorsairSetLedsColorsBufferByDeviceIndex(i, colors);
        window.cue.CorsairSetLedsColorsFlushBuffer();
      }
    }
  }

  static getColors(index: number, imgDataCoordinates: ImgDataCoordinate[]) {
    const device = this.devices[index];

    if (!device || !device.enabled) {
      return imgDataCoordinates.map((p) => {
        return {
          ledId: p.ledId,
          r: config.disabledColor.r,
          g: config.disabledColor.g,
          b: config.disabledColor.b,
        };
      });
    }

    return imgDataCoordinates.map((p) => {
      const imgData = this.ctx1?.getImageData(p.sx, p.sy, p.sw, p.sh);

      if (!imgData) {
        return {
          ledId: p.ledId,
          r: 0,
          g: 0,
          b: 0,
        };
      }

      const imgDataArr = imgData.data;

      let r = 0, g = 0, b = 0;
      for (let i = 0; i < imgDataArr.length; i += 4) {
        r += imgDataArr[i];
        g += imgDataArr[i + 1];
        b += imgDataArr[i + 2];
      }

      const num = (imgDataArr.length / 4);
      r = Math.round(r / num);
      g = Math.round(g / (imgDataArr.length / 4));
      b = Math.round(b / (imgDataArr.length / 4));

      if (device.showLeds && this.layoutCtx) {
        this.layoutCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.layoutCtx.fillRect(p.sx, p.sy, p.sw, p.sh);
      }

      return {
        ledId: p.ledId,
        r: r,
        g: g,
        b: b,
      };
    });
  }
}