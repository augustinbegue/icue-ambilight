const { cue } = require('../cue/cue')
const config = JSON.parse(localStorage.getItem('config'));

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
    this.c1.width = maxDef.maxX
    this.c1.height = maxDef.maxY
    this.ctx1 = this.c1.getContext("2d");

    this.configureBlur(this)

    /*this.c2 = document.getElementById("c2");
    this.c2.width = maxDef.maxX
    this.c2.height = maxDef.maxY
    this.ctx2 = this.c2.getContext("2d");*/

    let self = this;

    this.video.addEventListener("play", function () {
      self.width = maxDef.maxX;
      self.height = maxDef.maxY;
      self.timerCallback();
    }, false);

    /*this.blackBars = [0, 0]
    setInterval(() => {
      this.checkForBlackBars()
    }, 1000)*/
  },

  configureBlur: function (self) {
    self.blur = document.getElementById("blur")

    if (config.blur === undefined) {
      config.blur = 0
    }
    localStorage.setItem("config", JSON.stringify(config))
    self.blur.value = config.blur

    self.ctx1.filter = 'blur(' + config.blur + 'px)'

    self.blur.onchange = function () {
      console.log("blur changed " + self.blur.value)
      self.ctx1.filter = 'blur(' + self.blur.value + 'px)'
      config.blur = self.blur.value

      localStorage.setItem("config", JSON.stringify(config))
    }
  },

  computeFrame: function () {
    // this.ctx2.drawImage(this.video, 0, 0, this.width, this.height)
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height)
    /*sx = 0;
    sy = ((this.width * (9 / 16))/this.height) * this.blackBars[0]; // (Original Height / Canvas height) * blackbars height -> adapt mesured height to video capture real height
    sLargeur = this.width;
    sHauteur = this.width*(9 / 16) - ((this.width*(9 / 16)) / this.height) * (this.blackBars[0] + this.blackBars[1]);
    dx = 0;
    dy = 0;
    dLargeur = this.width;
    dHauteur = this.height;
    this.ctx1.drawImage(this.video, sx, sy, sLargeur, sHauteur, dx, dy, dLargeur, dHauteur)
    return;*/
  },

  checkForBlackBars: function () { // Check for how many pixels deep the image is black -> black bar height
    let topBarHeight = 0;
    let bottomBarHeight = 0;

    for (let t = 0; t < this.height; t++) { // From top to bottom
      // Check color on 3 points for better accuracy
      const leftData = this.ctx2.getImageData(0, t, 1, 1).data
      const middleData = this.ctx2.getImageData(this.width / 2, t, 1, 1).data
      const rightData = this.ctx2.getImageData(this.width - 1, t, 1, 1).data

      if (leftData[0] === leftData[1] && leftData[1] === leftData[2] && leftData[2] === 0) {
        if (rightData[0] === rightData[1] && rightData[1] === rightData[2] && rightData[2] === 0) {
          if (middleData[0] === middleData[1] && middleData[1] === middleData[2] && middleData[2] === 0) {
            topBarHeight++
          }
        }
      } else {
        break;
      }
    }

    for (let b = this.height; b > 0; b--) { // From bottom to top
      const leftData = this.ctx2.getImageData(0, b, 1, 1).data
      const middleData = this.ctx2.getImageData(this.height / 2, b, 1, 1).data
      const rightData = this.ctx2.getImageData(this.height - 1, b, 1, 1).data

      if (leftData[0] === leftData[1] && leftData[1] === leftData[2] && leftData[2] === 0) {
        if (rightData[0] === rightData[1] && rightData[1] === rightData[2] && rightData[2] === 0) {
          if (middleData[0] === middleData[1] && middleData[1] === middleData[2] && middleData[2] === 0) {
            bottomBarHeight++
          }
        }
      } else {
        break;
      }
    }

    // TODO : left and right detection (minor)

    if (topBarHeight === 152) {
      topBarHeight = 0
    }

    if (bottomBarHeight === 152) {
      bottomBarHeight = 0
    }

    this.blackBars = [topBarHeight, bottomBarHeight]
  },
};

exports.processor = processor;
