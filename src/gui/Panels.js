class Panels {
  panelIds = ['sourcesContainer', 'layoutContainer', 'captureContainer', 'settingsContainer'];

  constructor() {
    this.panelIds.forEach(element => {
      document.getElementById(element + "Button").addEventListener('click', (event) => {
        event.stopPropagation();
        this.display(element);
      });
    });
  }

  toggle(id) {
    for (let i = 0; i < this.panelIds.length; i++) {
      if (i === id) {
        document.getElementById(this.panelIds[i]).classList.remove('is-hidden');
        document.getElementById(this.panelIds[i] + "Button").classList.add('is-active');
      } else {
        document.getElementById(this.panelIds[i]).classList.add('is-hidden');
        document.getElementById(this.panelIds[i] + "Button").classList.remove('is-active');
      }
    }
  }

  display(id) {
    switch (id) {
      case this.panelIds[0]:
        this.toggle(0);
        break;
      case this.panelIds[1]:
        this.toggle(1);
        break;
      case this.panelIds[2]:
        this.toggle(2);
        break;
      case this.panelIds[3]:
        this.toggle(3);
        break;
      default:
        break;
    }
  }
}
exports.Panels = Panels;
