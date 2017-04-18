export default class UIComponent {
  constructor(UI, config={}) {
    this.UI = UI;
    this.config = config;
  }
  destroy() {
    if (typeof this.destroyDOM == 'function') {
      this.destroyDOM();
    }
  }
  get type() {
    return 'UI.Component';
  }

  register(paperCanvas) {
    paperCanvas = paperCanvas || this.UI.PaperCanvas;
    if (this.Handles && paperCanvas) {
      paperCanvas.registerHandlers(this.Handles);
    }
  }
}
