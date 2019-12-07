const { desktopCapturer } = require('electron');
const { cue } = require('../ambilight/cue')

function getSources() {
  return new Promise((resolve, reject) => {
    desktopCapturer.getSources({ types: ['screen'] })
    .then(async (sources) => {
      resolve(sources)
    })
    .catch(e => reject(e))
  })
}

async function startCapture(source) {
  const maxDef = cue.getMaxDefinition()

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
          minWidth: maxDef.maxX,
          maxWidth: maxDef.maxX
        }
      }
    });
    handleStream(stream);
  }
  catch (e) {
    handleError(e);
  }
}

function handleStream(stream) {
  const video = document.getElementById('video');
  video.srcObject = stream;
  video.onloadedmetadata = (e) => video.play();
}
function handleError(e) {
  console.error(e);
}

exports.startCapture = startCapture;
exports.getSources = getSources;