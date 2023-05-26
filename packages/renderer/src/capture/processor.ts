import { Cue } from '../cue/cue';

export class Processor {
  static video: HTMLVideoElement | null;
  static c1: HTMLCanvasElement | null;
  static ctx1: CanvasRenderingContext2D | null | undefined;
  static blur: HTMLInputElement | null;
  static brightness: HTMLInputElement | null;
  static contrast: HTMLInputElement | null;
  static saturation: HTMLInputElement | null;
  static width: number;
  static height: number;

  static doLoad() {
    this.video = document.querySelector('#video');
    this.c1 = document.querySelector('#c1');
    this.ctx1 = this.c1?.getContext('2d');

    const self = this;

    return new Promise<void>((resolve) => {
      this.video?.addEventListener('play', function (e) {
        const captureWidth = (e.target as HTMLVideoElement).videoWidth;
        const captureHeight = (e.target as HTMLVideoElement).videoHeight;

        const deviceMaxDef = Cue.getMaxDefinition();
        const deviceMaxWidth = deviceMaxDef.maxX;
        const deviceMaxHeight = deviceMaxDef.maxY;

        const captureRatio = captureWidth / captureHeight;

        if (deviceMaxWidth > deviceMaxHeight) {
          self.width = deviceMaxWidth;
          self.height = deviceMaxWidth / captureRatio;
        } else {
          self.width = deviceMaxHeight * captureRatio;
          self.height = deviceMaxHeight;
        }

        if (self.c1) {
          self.c1.width = self.width;
          self.c1.height = self.height;
        }

        self.configureFilters();
        self.timerCallback();

        resolve();
      }, false);
    });
  }

  static timerCallback() {
    if (this.video?.paused || this.video?.ended)
      return;

    this.computeFrame();
    const self = this;
    setTimeout(function () {
      self.timerCallback();
    }, 0);
  }

  static setFilter(config: StoredConfig) {
    if (!this.ctx1)
      return;

    this.ctx1.filter = `blur(${config.blur}px) saturate(${config.saturation}%) contrast(${config.contrast}%) brightness(${config.brightness}%)`;
  }

  static configureFilters() {
    if (!this.ctx1)
      return;

    const config = window.store.get('config') as StoredConfig;

    this.blur = document.getElementById('blur') as HTMLInputElement;
    this.brightness = document.getElementById('brightness') as HTMLInputElement;
    this.contrast = document.getElementById('contrast') as HTMLInputElement;
    this.saturation = document.getElementById('saturation') as HTMLInputElement;

    if (!config.blur) config.blur = 0;
    if (!config.brightness) config.brightness = 100;
    if (!config.contrast) config.contrast = 100;
    if (!config.saturation) config.saturation = 100;

    window.store.set('config', config);
    this.blur.value = config.blur.toString();
    this.brightness.value = config.brightness.toString();
    this.contrast.value = config.contrast.toString();
    this.saturation.value = config.saturation.toString();

    this.setFilter(config);

    const self = this;
    this.blur.onchange = function () {
      if (!self.blur || !self.ctx1)
        return;

      if (parseInt(self.blur.value) < 0)
        self.blur.value = '0';

      config.blur = parseInt(self.blur.value);
      self.setFilter(config);

      window.store.set('config', config);
    };
    this.brightness.onchange = function () {
      if (!self.brightness || !self.ctx1)
        return;

      if (parseInt(self.brightness.value) < 0)
        self.brightness.value = '0';

      config.brightness = parseInt(self.brightness.value);
      self.setFilter(config);

      window.store.set('config', config);
    };
    this.contrast.onchange = function () {
      if (!self.contrast || !self.ctx1)
        return;

      if (parseInt(self.contrast.value) < 0)
        self.contrast.value = '0';

      config.contrast = parseInt(self.contrast.value);
      self.setFilter(config);

      window.store.set('config', config);
    };
    this.saturation.onchange = function () {
      if (!self.saturation || !self.ctx1)
        return;

      if (parseInt(self.saturation.value) < 0)
        self.saturation.value = '0';

      config.saturation = parseInt(self.saturation.value);
      self.setFilter(config);

      window.store.set('config', config);
    };
  }

  static computeFrame() {
    this.ctx1?.drawImage(this.video as CanvasImageSource, 0, 0, this.width, this.height);
  }
}
