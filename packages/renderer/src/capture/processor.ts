import { Cue } from '../cue/cue';

export class Processor {
  static video: HTMLVideoElement | null;
  static c1: HTMLCanvasElement | null;
  static ctx1: CanvasRenderingContext2D | null | undefined;
  static blur: HTMLInputElement | null;
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

        self.configureBlur();
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

  static configureBlur() {
    if (!this.ctx1)
      return;

    const config = window.store.get('config') as StoredConfig;

    this.blur = document.getElementById('blur') as HTMLInputElement;

    if (!config.blur) {
      config.blur = 0;
    }

    window.store.set('config', config);
    this.blur.value = config.blur.toString();

    this.ctx1.filter = 'blur(' + config.blur + 'px)';

    const self = this;
    this.blur.onchange = function () {
      if (!self.blur || !self.ctx1)
        return;

      if (parseInt(self.blur.value) < 0)
        self.blur.value = '0';

      self.ctx1.filter = 'blur(' + self.blur.value + 'px)';
      config.blur = parseInt(self.blur.value);

      window.store.set('config', config);
    };
  }

  static computeFrame() {
    this.ctx1?.drawImage(this.video as CanvasImageSource, 0, 0, this.width, this.height);
  }
}
