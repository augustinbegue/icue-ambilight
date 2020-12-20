const { remote, shell } = require('electron');
const mainProcess = remote.require('./main.js');

const { processor } = require("./src/cue/processor");
const { cue } = require("./src/cue/cue");
const { getSources, startCapture } = require("./src/capture");
const { Panels } = require("./src/gui/Panels");

function refreshSources() {
  const sourcesEl = document.getElementById('sources')

  getSources().then((sources) => {
    sourcesEl.innerHTML = '';
    for (const i in sources) {
      sources[i].thumbnail = sources[i].thumbnail.toDataURL();
      sourcesEl.innerHTML += `
      <div id="${i}" class="source box ${i == 0 ? 'selected' : ''}" style="margin: 16px;">
        <figure class="image is-16by9">
          <img src="${sources[i].thumbnail}">
        </figure>
        <p>
          Source: <strong>${sources[i].name}</strong>
        </p>
      </div>`;
    }

    startCapture(sources[0]);
    refreshLayout(sources[0]);

    const sourcesButtons = document.getElementById('sources').childNodes;
    
    for (const button of sourcesButtons) {
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        startCapture(sources[button.id]);
        refreshLayout(sources[button.id]);
        processor.doLoad();

        sourcesButtons.forEach((el, i) => {
          let but = document.getElementById(i);

          if (but) {
            if (i == button.id) {
              but.classList.add('selected');
            } else {
              but.classList.remove('selected');
            }
          }
        })
      });
    }
  });
}

function refreshDeviceInfo() {
  const info = cue.devices;

  devicesEl = document.getElementById("devices")

  info.forEach((device, i) => {
    if (i != 0) {
      devicesEl.innerHTML += `<hr>`
    }
    devicesEl.innerHTML += `
    <p>${i+1} - <strong>${device.model}</strong><br>Leds: ${device.ledsCount}</p>
    `;
  });
}

function refreshLayout(source) {
  const devices = cue.devices;
  const maxDef = cue.getMaxDefinition()
  
  devices.forEach((device, i) => {
    let canvas = document.createElement("canvas");
    canvas.id = "deviceLayout"+i;

    layoutEl.appendChild(canvas);

    canvas.height = device.sizeY;
    canvas.width = device.sizeX;
    canvas.style.opacity = '0.5';
    canvas.style.margin = '4px';

    canvasCtx = canvas.getContext("2d");
    canvasCtx.rect(0, 0, canvas.width, canvas.height);
    canvasCtx.fillStyle = 'red';
    canvasCtx.fill();
    canvasCtx.font = '16px sans-serif'
    canvasCtx.fillStyle = 'black';
    canvasCtx.fillText(device.model, 2, 18, canvas.width);
  });
}

if (!localStorage.getItem('config')) {
  localStorage.setItem('config', `${JSON.stringify({
    refreshrate: 30,
  })}`)
}

cue.init();
refreshSources();
refreshDeviceInfo();
processor.doLoad();
new Panels();



