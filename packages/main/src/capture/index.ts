import { desktopCapturer } from 'electron';

function getSources() {
  return new Promise((resolve, reject) => {
    desktopCapturer.getSources({ types: ['screen'] })
      .then(async (sources) => {
        resolve(sources);
      })
      .catch(e => reject(e));
  });
}

async function startCapture(source) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(<any>{
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id,
        },
      },
    });
    handleStream(stream);
  }
  catch (e) {
    handleError(e);
  }
}

function handleStream(stream: MediaProvider) {
  const video = document.getElementById('video') as HTMLVideoElement;
  video.srcObject = stream;
  video.onloadedmetadata = () => video.play();
}

function handleError(e: any) {
  console.error(e);
}

exports.startCapture = startCapture;
exports.getSources = getSources;