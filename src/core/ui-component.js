import Component from './component.js';
export default class UIComponent extends Component {
  constructor(SL, config, UI) {
    super(SL, config);
    if (!UI && this.SL) {
      UI = this.SL.UI;
    }
    this.UI = UI;
  }
  destroy() {
    if (typeof this.destroyDOM == 'function') {
      this.destroyDOM();
    }
  }
  get type() {
    return 'UI.Component';
  }
  activate() {}
  deactivate() {}

  register(paperCanvas) {
    paperCanvas = paperCanvas || this.UI.PaperCanvas;
    if (this.Handles && paperCanvas) {
      paperCanvas.registerHandlers(this.Handles);
    }
  }

  assertActive() {
    if (!StampLines.ACTIVE) {
      this.SL.activate();
    }
    return this.SL.isActive();
  }
  delegateEvent(callback, event, delegateTo) {
    if (this.assertActive()) {
      if (!delegateTo) {
        delegateTo = this.SL.Tools;
      }
      if (delegateTo) {
        if (typeof delegateTo[callback] == 'function') {
          delegateTo[callback](event);
        }
      }
    }
  }
}
