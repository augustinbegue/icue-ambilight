const { remote } = require('electron');
const mainProcess = remote.require('./main.js');

const { processor } = require("./src/ambilight/processor");
const { cue } = require("./src/ambilight/cue");
const { getSources, startCapture } = require("./src/capture")

const sourcesEl = document.getElementById('sources')

cue.init()
refreshSources()
processor.doLoad();

function refreshSources() {
  getSources().then((sources) => {
    sourcesEl.innerHTML = '';
    for (const i in sources) {
      sources[i].thumbnail = sources[i].thumbnail.toDataURL();
      sourcesEl.innerHTML += `<div id="${i}" class="source box" style="width: auto;">
        <article class="media">
           <div class="media-left">
            <figure class="image is-64x64">
             <img src="${sources[i].thumbnail}">
            </figure>
          </div>
          <div class="media-content">
            <div class="content">
              <p>
              Source: <strong>${sources[i].name}</strong>
              </p>
            </div>
          </div>
        </article>
        </div>`;
    }

    startCapture(sources[0])

    const sourcesButtons = document.getElementById('sources').childNodes;
    for (const button of sourcesButtons) {
      button.addEventListener('click', (event) => {
        startCapture(sources[button.id]);
        processor.doLoad();
      });
    }
  });
}

/*const refreshSourcesEl = document
  .getElementById('refreshSources')
  .addEventListener('click', (event) => {
    refreshSources();
  })

const startElem = document
  .getElementById('startAmbilight')
  .addEventListener('click', (event) => {

  })
*/