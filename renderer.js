const { remote, shell } = require('electron');
const mainProcess = remote.require('./main.js');

const { processor } = require("./src/cue/processor");
const { cue } = require("./src/cue/cue");
const { getSources, startCapture } = require("./src/capture");
const { Panels } = require("./src/gui/Panels");

const win = remote.getCurrentWindow(); /* Note this is different to the
html global `window` variable */

// When document has loaded, initialise
document.onreadystatechange = (_event) => {
  if (document.readyState == "complete") {
    handleWindowControls();
  }
};

window.onbeforeunload = (_event) => {
  /* If window is reloaded, remove win event listeners
  (DOM element listeners get auto garbage collected but not
  Electron win listeners as the win is not dereferenced unless closed) */
  win.removeAllListeners();
}

function handleWindowControls() {
  // Make minimise/maximise/restore/close buttons work when they are clicked
  document.getElementById('min-button').addEventListener("click", _event => {
    win.minimize();
  });

  document.getElementById('max-button').addEventListener("click", _event => {
    win.maximize();
  });

  document.getElementById('restore-button').addEventListener("click", _event => {
    win.unmaximize();
  });

  document.getElementById('close-button').addEventListener("click", _event => {
    win.close();
  });

  // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
  toggleMaxRestoreButtons();
  win.on('maximize', toggleMaxRestoreButtons);
  win.on('unmaximize', toggleMaxRestoreButtons);

  function toggleMaxRestoreButtons() {
    if (win.isMaximized()) {
      document.body.classList.add('maximized');
    } else {
      document.body.classList.remove('maximized');
    }
  }
}

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

    const sourcesButtons = document.getElementById('sources').childNodes;

    for (const button of sourcesButtons) {
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        startCapture(sources[button.id]);
        processor.doLoad();

        sourcesButtons.forEach((_el, i) => {
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
      <p>${i + 1} - <strong>${device.model}</strong><br>Leds: ${device.ledsCount}</p>
    `;
  });
}

let displayCanvas = document.createElement("canvas");
canvasCtx = displayCanvas.getContext("2d");

function initLayout() {
  const maxDef = cue.getMaxDefinition();
  const display = document.getElementById("display");

  displayCanvas.id = "displayCanvas";

  display.appendChild(displayCanvas);

  displayCanvas.height = maxDef.maxY;
  displayCanvas.width = maxDef.maxX;
  displayCanvas.style.margin = '4px';

  displayCanvas.style.height = "auto";
  displayCanvas.style.width = "100%";

  canvasCtx.rect(0, 0, displayCanvas.width, displayCanvas.height);
  canvasCtx.fillStyle = 'white';
  canvasCtx.fill();
  

  cue.devices.forEach((device, i) => {
    updateCanvas(i, device)

    layoutEl = document.getElementById("layout");
    layoutEl.innerHTML += `
    <div id="deviceForm${i}">
      <p style="margin: 4px; background: rgb(${device.sizeX % 255}, ${device.sizeY % 255}, ${i * 100 % 255});">${device.model}</p>
      <div class="control"  style="display: flex; flex-wrap: wrap;">
        <input class="input is-small" type="text" name="device${i}x1" id="device${i}x1"
               placeholder="x1" style="max-width: 60px; margin: 0px 4px 0px 4px;" value="${device.x1}">
        <input class="input is-small" type="text" name="device${i}y1" id="device${i}y1"
               placeholder="y1" style="max-width: 60px; margin: 0px 4px 0px 4px;" value="${device.y1}">
        <input class="input is-small" type="text" name="device${i}x2" id="device${i}x2"
               placeholder="x2" style="max-width: 60px; margin: 0px 4px 0px 4px;" value="${device.x2}">
        <input class="input is-small" type="text" name="device${i}y2" id="device${i}y2"
               placeholder="y2" style="max-width: 60px; margin: 0px 4px 0px 4px;" value="${device.y2}">
        <button class="button is-small" id="device${i}butt">✔</button>
      </div>
    </div>
    `
  });

  cue.devices.forEach((device, i) => {
    document.getElementById(`device${i}butt`).addEventListener('click', function (e) {
      let x1In = document.getElementById(`device${i}x1`);
      let x2In = document.getElementById(`device${i}x2`);
      let y1In = document.getElementById(`device${i}y1`);
      let y2In = document.getElementById(`device${i}y2`);

      x1In.value > displayCanvas.width ? x1In.value = displayCanvas.width : x1In.value;
      x2In.value > displayCanvas.width ? x2In.value = displayCanvas.width : x2In.value;
      y1In.value > displayCanvas.height ? y1In.value = displayCanvas.height : y1In.value;
      y2In.value > displayCanvas.height ? y2In.value = displayCanvas.height : y2In.value;

      updateLayout(i, x1In.value, y1In.value, x2In.value, y2In.value)
    })
  })
}

function updateLayout(i, x1, y1, x2, y2) {
  cue.devices[i].x1 = parseInt(x1);
  cue.devices[i].x2 = parseInt(x2);
  cue.devices[i].y1 = parseInt(y1);
  cue.devices[i].y2 = parseInt(y2);

  localStorage.setItem("devices", JSON.stringify(cue.devices));

  updateCanvas();
}

function updateCanvas() {
  canvasCtx.fillStyle = 'white';
  canvasCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);

  cue.devices.forEach((device, i) => {
    canvasCtx.globalAlpha = 0.6;
    canvasCtx.fillStyle = `rgb(${device.sizeX % 255}, ${device.sizeY % 255}, ${i * 100 % 255}, 10)`;
    canvasCtx.fillRect(device.x1, device.y1, device.x2, device.y2);
    canvasCtx.globalAlpha = 1;
  })
}

if (!localStorage.getItem('config')) {
  localStorage.setItem('config', `${JSON.stringify({
    refreshrate: 30,
  })}`)
}

cue.init();
refreshSources();
refreshDeviceInfo();
initLayout();
processor.doLoad();
new Panels();



