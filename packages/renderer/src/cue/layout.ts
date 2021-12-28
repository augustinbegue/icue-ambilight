import { Cue } from './cue';
import { Processor } from '../capture/processor';
import { Amibilight } from './amibilight';

export const displayCanvas = document.createElement('canvas') as HTMLCanvasElement;
const canvasCtx = displayCanvas.getContext('2d') as CanvasRenderingContext2D;

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
  const display = document.getElementById('display') as HTMLDivElement;

  displayCanvas.id = 'displayCanvas';

  display.appendChild(displayCanvas);

  displayCanvas.height = Processor.height;
  displayCanvas.width = Processor.width;
  displayCanvas.style.margin = '4px';
  displayCanvas.style.imageRendering = 'pixelated';

  displayCanvas.style.height = 'auto';
  displayCanvas.style.width = '100%';

  canvasCtx.rect(0, 0, displayCanvas.width, displayCanvas.height);
  canvasCtx.fillStyle = 'white';
  canvasCtx.fill();


  Cue.devices.forEach((device, i) => {
    updateCanvas();

    const layoutEl = document.getElementById('layout') as HTMLDivElement;
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

  Cue.devices.forEach((_device, i) => {
    const x1In = document.getElementById(`device${i}x1`) as HTMLInputElement;
    const x2In = document.getElementById(`device${i}x2`) as HTMLInputElement;
    const y1In = document.getElementById(`device${i}y1`) as HTMLInputElement;
    const y2In = document.getElementById(`device${i}y2`) as HTMLInputElement;
    const checkboxEnable = document.getElementById(`device${i}enable`) as HTMLInputElement;
    const checkboxShowLeds = document.getElementById(`device${i}showleds`) as HTMLInputElement;

    const handler = function () {
      let x1 = parseInt(x1In.value) > displayCanvas.width ? displayCanvas.width : parseInt(x1In.value);
      let x2 = x1 + parseInt(x2In.value) > displayCanvas.width ? displayCanvas.width : parseInt(x2In.value);
      let y1 = parseInt(y1In.value) > displayCanvas.height ? displayCanvas.height : parseInt(y1In.value);
      let y2 = y1 + parseInt(y2In.value) > displayCanvas.height ? displayCanvas.height : parseInt(y2In.value);
      x1 = x1 < 0 ? 0 : x1;
      x2 = x2 < 0 ? 0 : x2;
      y1 = y1 < 0 ? 0 : y1;
      y2 = y2 < 0 ? 0 : y2;

      x1In.value = x1.toString();
      x2In.value = x2.toString();
      y1In.value = y1.toString();
      y2In.value = y2.toString();

      updateLayout(i, x1, y1, x2, y2, checkboxEnable.checked, checkboxShowLeds.checked);
    };

    x1In.onchange = handler;
    x2In.onchange = handler;
    y1In.onchange = handler;
    y2In.onchange = handler;
    checkboxEnable.onchange = handler;
    checkboxShowLeds.onchange = handler;
  });
}

function updateLayout(i: number, x1: number, y1: number, x2: number, y2: number, enabled: boolean, showLeds: boolean) {
  Cue.devices[i].x1 = x1;
  Cue.devices[i].x2 = x2;
  Cue.devices[i].y1 = y1;
  Cue.devices[i].y2 = y2;
  Cue.devices[i].enabled = enabled;
  Cue.devices[i].showLeds = showLeds;

  window.store.set('devices', Cue.devices);
  Amibilight.reload(Cue.positions, Cue.devices);

  updateCanvas();
}

function updateCanvas() {
  canvasCtx.fillStyle = 'white';
  canvasCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);

  Cue.devices.forEach((device, i) => {
    if (device.enabled) {
      canvasCtx.globalAlpha = 0.6;
      canvasCtx.fillStyle = colors[i];
      canvasCtx.fillRect(device.x1, device.y1, device.x2, device.y2);
      canvasCtx.globalAlpha = 1;
    }
  });
}
