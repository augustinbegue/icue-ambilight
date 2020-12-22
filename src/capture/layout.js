const { cue } = require("../cue/cue");

let displayCanvas = document.createElement("canvas");
exports.displayCanvas = displayCanvas;
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
    updateCanvas(i, device);

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
      </div>
    </div>
    `;
  });

  cue.devices.forEach((_device, i) => {
    let x1In = document.getElementById(`device${i}x1`);
    let x2In = document.getElementById(`device${i}x2`);
    let y1In = document.getElementById(`device${i}y1`);
    let y2In = document.getElementById(`device${i}y2`);

    const handler = function (e) {
      x1In.value > displayCanvas.width ? x1In.value = displayCanvas.width : x1In.value;
      x2In.value > displayCanvas.width ? x2In.value = displayCanvas.width : x2In.value;
      y1In.value > displayCanvas.height ? y1In.value = displayCanvas.height : y1In.value;
      y2In.value > displayCanvas.height ? y2In.value = displayCanvas.height : y2In.value;
      
      updateLayout(i, x1In.value, y1In.value, x2In.value, y2In.value)
    };

    x1In.onchange = handler;
    x2In.onchange = handler;
    y1In.onchange = handler;
    y2In.onchange = handler;
  });
}
exports.initLayout = initLayout;

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
  });
}
