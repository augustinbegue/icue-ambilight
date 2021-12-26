const { cue } = require('./cue');
const { processor } = require('../capture/processor');
const { amibilight } = require('./amibilight');

const displayCanvas = document.createElement('canvas');
exports.displayCanvas = displayCanvas;
canvasCtx = displayCanvas.getContext('2d');

// predefined colors for the devices
const colors = [
  '#E06C75',
  '#98C379',
  '#D19A66',
  '#61AFEF',
  '#C678DD',
  '#56B6C2',
  '#C06C84',
  '#3FC380',
  '#F67280',
  '#C2D5C4',
  '#F5F5F5',
];

export function initLayout() {
  const display = document.getElementById('display');

  displayCanvas.id = 'displayCanvas';

  display.appendChild(displayCanvas);

  displayCanvas.height = processor.height;
  displayCanvas.width = processor.width;
  displayCanvas.style.margin = '4px';
  displayCanvas.style.imageRendering = 'pixelated';

  displayCanvas.style.height = 'auto';
  displayCanvas.style.width = '100%';

  canvasCtx.rect(0, 0, displayCanvas.width, displayCanvas.height);
  canvasCtx.fillStyle = 'white';
  canvasCtx.fill();


  cue.devices.forEach((device, i) => {
    updateCanvas(i, device);

    layoutEl = document.getElementById('layout');
    layoutEl.innerHTML += `
    <div id="deviceForm${i}" class="box" style="margin: 8px; padding: 16px; background: ${colors[i]}">
      <p>#${i + 1} - ${device.model}</p>
      <div style="display: flex; flex-wrap: wrap; flex-direction: row">
        <label class="checkbox" style="color: white; margin: 8px;">
          <input type="checkbox" name="device${i}enable" id="device${i}enable" ${device.enabled ? 'checked' : ''}>
          Enable
        </label>
        <label class="checkbox" style="color: white; margin: 8px;">
          <input type="checkbox" name="device${i}showleds" id="device${i}showleds" ${device.showLeds ? 'checked' : ''}>
          Show LEDs
        </label>
      </div>
      <div class="control"  style="display: flex; flex-wrap: wrap;">
        <input class="input is-small" type="number" name="device${i}x1" id="device${i}x1"
               placeholder="x1" style="max-width: 60px; margin: 0px 4px 0px 4px;" value="${device.x1}">
        <input class="input is-small" type="number" name="device${i}y1" id="device${i}y1"
               placeholder="y1" style="max-width: 60px; margin: 0px 4px 0px 4px;" value="${device.y1}">
        <input class="input is-small" type="number" name="device${i}x2" id="device${i}x2"
               placeholder="x2" style="max-width: 60px; margin: 0px 4px 0px 4px;" value="${device.x2}">
        <input class="input is-small" type="number" name="device${i}y2" id="device${i}y2"
               placeholder="y2" style="max-width: 60px; margin: 0px 4px 0px 4px;" value="${device.y2}">
      </div>
    </div>`;
  });

  cue.devices.forEach((_device, i) => {
    const x1In = document.getElementById(`device${i}x1`);
    const x2In = document.getElementById(`device${i}x2`);
    const y1In = document.getElementById(`device${i}y1`);
    const y2In = document.getElementById(`device${i}y2`);
    const checkboxEnable = document.getElementById(`device${i}enable`);
    const checkboxShowLeds = document.getElementById(`device${i}showleds`);

    const handler = function () {
      x1In.value > displayCanvas.width ? x1In.value = displayCanvas.width : x1In.value;
      x2In.value > displayCanvas.width ? x2In.value = displayCanvas.width : x2In.value;
      y1In.value > displayCanvas.height ? y1In.value = displayCanvas.height : y1In.value;
      y2In.value > displayCanvas.height ? y2In.value = displayCanvas.height : y2In.value;

      updateLayout(i, x1In.value, y1In.value, x2In.value, y2In.value, checkboxEnable.checked, checkboxShowLeds.checked);
    };

    x1In.onchange = handler;
    x2In.onchange = handler;
    y1In.onchange = handler;
    y2In.onchange = handler;
    checkboxEnable.onchange = handler;
    checkboxShowLeds.onchange = handler;
  });
}

function updateLayout(i, x1, y1, x2, y2, enabled, showLeds) {
  cue.devices[i].x1 = parseInt(x1);
  cue.devices[i].x2 = parseInt(x2);
  cue.devices[i].y1 = parseInt(y1);
  cue.devices[i].y2 = parseInt(y2);
  cue.devices[i].enabled = enabled;
  cue.devices[i].showLeds = showLeds;

  localStorage.setItem('devices', JSON.stringify(cue.devices));
  amibilight.reload(cue.positions, cue.devices);

  updateCanvas();
}

function updateCanvas() {
  canvasCtx.fillStyle = 'white';
  canvasCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);

  cue.devices.forEach((device, i) => {
    if (device.enabled) {
      canvasCtx.globalAlpha = 0.6;
      canvasCtx.fillStyle = colors[i];
      canvasCtx.fillRect(device.x1, device.y1, device.x2, device.y2);
      canvasCtx.globalAlpha = 1;
    }
  });
}
