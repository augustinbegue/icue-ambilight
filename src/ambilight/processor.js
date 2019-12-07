const { cue } = require('./cue')

const processor = {
  timerCallback: function () {
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    let self = this;
    setTimeout(function () {
      self.timerCallback();
    }, 0);
  },

  doLoad: function () {
    const maxDef = cue.getMaxDefinition()

    this.video = document.getElementById("video");
    this.c1 = document.getElementById("c1");
    this.c1.width = maxDef.maxX + 10
    this.c1.height = maxDef.maxY + 10
    this.ctx1 = this.c1.getContext("2d");
    let self = this;

    this.video.addEventListener("play", function () {
      self.width = maxDef.maxX + 10;
      self.height = maxDef.maxY + 10;
      self.timerCallback();
    }, false);
  },

  computeFrame: function () {
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
    return;
  }
};

exports.processor = processor;
