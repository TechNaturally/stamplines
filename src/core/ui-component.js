export default class UIComponent {
  constructor(UI, config={}) {
    this.UI = UI;
    this.config = config;
  }
  get type() {
    return 'UI.Component';
  }

  register() {
    let paperCanvas = this.config.paperCanvas;
    if (this.Handles && paperCanvas) {
      paperCanvas.registerHandlers(this.Handles);
    }
  }
}
