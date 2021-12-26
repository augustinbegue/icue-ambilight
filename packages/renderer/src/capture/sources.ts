import { processor } from './processor';
import { cue } from '../cue/cue';
import { getSources, startCapture } from './index';

export function refreshSources() {
  const sourcesEl = document.getElementById('sources');

  getSources().then((sources) => {
    let selectedSource = window.store.get('selectedSource') || 0;

    console.log(selectedSource);

    sourcesEl.innerHTML = '';
    for (const i in sources) {
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

    startCapture(sources[selectedSource]);

    const sourcesButtons = document.getElementById('sources').childNodes;
    updateSelectedSource(sourcesButtons, selectedSource);

    for (const button of sourcesButtons) {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        await startCapture(sources[button.id]);

        selectedSource = parseInt(button.id);
        updateSelectedSource(sourcesButtons, selectedSource);

        processor.doLoad();
      });
    }
  });
}

function updateSelectedSource(sourcesButtons, selectedSource) {
  window.store.set('selectedSource', selectedSource);

  sourcesButtons.forEach((_el, i) => {
    const butt = document.getElementById(i);

    if (butt) {
      if (i == selectedSource) {
        butt.classList.add('selected');
      } else {
        butt.classList.remove('selected');
      }
    }
  });
}

export function refreshDeviceInfo() {
  const info = cue.devices;

  const devicesEl = document.getElementById('devices');

  if (info && info.length > 0) {
    info.forEach((device, i) => {
      if (i != 0) {
        devicesEl.innerHTML += '<hr>';
      }
      devicesEl.innerHTML += `
        <p>${i + 1} - <strong>${device.model}</strong><br>Leds: ${device.ledsCount}</p>
      `;
    });
  }
}
