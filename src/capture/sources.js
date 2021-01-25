const { processor } = require("./processor");
const { cue } = require("../cue/cue");
const { getSources, startCapture } = require(".");

function refreshSources() {
  const sourcesEl = document.getElementById('sources');

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
        event.stopPropagation();
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
        });
      });
    }
  });
}
exports.refreshSources = refreshSources;

function refreshDeviceInfo() {
  const info = cue.devices;

  devicesEl = document.getElementById("devices");

  if (info && info.length > 0) {
    info.forEach((device, i) => {
      if (i != 0) {
        devicesEl.innerHTML += `<hr>`;
      }
      devicesEl.innerHTML += `
        <p>${i + 1} - <strong>${device.model}</strong><br>Leds: ${device.ledsCount}</p>
      `;
    });
  }
}
exports.refreshDeviceInfo = refreshDeviceInfo;
