import { cue } from '../cue/cue';

const config = window.store.get('config') as StoredConfig;

export const processor = {
  timerCallback: function () {
    if (this.video?.paused || this.video?.ended) {
      return;
    }
    this.computeFrame();
    const self = this;
    setTimeout(function () {
      self.timerCallback();
    }, 0);
  },

  doLoad: function () {
    return new Promise<void>((resolve) => {
      this.video = document.getElementById('video');
      this.c1 = document.getElementById('c1');
      this.ctx1 = this.c1.getContext('2d');
      const self = this;

      this.video.addEventListener('play', function (e) {
        const captureWidth = e.target.videoWidth;
        const captureHeight = e.target.videoHeight;

        const deviceMaxDef = cue.getMaxDefinition();
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

        self.c1.width = self.width;
        self.c1.height = self.height;

        self.configureBlur(self);
        self.timerCallback();

        resolve();
      }, false);
    });
  },

  configureBlur: function (self) {
    self.blur = document.getElementById('blur');

    if (config.blur === undefined) {
      config.blur = 0;
    }
    window.store.set('config', config);
    self.blur.value = config.blur;

    self.ctx1.filter = 'blur(' + config.blur + 'px)';

    self.blur.onchange = function () {
      if (self.blur.value < 0)
        self.blur.value = 0;

      self.ctx1.filter = 'blur(' + self.blur.value + 'px)';
      config.blur = self.blur.value;

      window.store.set('config', config);
    };
  },

  computeFrame: function () {
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
  },
};