export function getSources() {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer.invoke('dekstop-capture-get-sources', { types: ['screen'] })
      .then((sources) => {
        resolve(sources);
      })
      .catch(e => reject(e));
  });
}

export async function startCapture(source: any) {
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
