import Component from './component.js';
export default class UIComponent extends Component {
  constructor(SL, config, UI) {
    super(SL, config);
    if (!UI && this.SL) {
      UI = this.SL.UI;
    }
    this.UI = UI;
  }
  reset() {
    super.reset();
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
  delegateEvent(callback, event, delegateTo, emit=true) {
    if (this.assertActive()) {
      if (this.SL.Paper.isBlocked) {
        return;
      }
      if (!delegateTo) {
        delegateTo = this.SL.Tools;
      }
      if (emit && this.UI.PaperCanvas) {
        let eventName = callback;
        if (eventName.substr(0, 2) == 'on') {
          eventName = eventName.substr(2);
        }
        this.UI.PaperCanvas.emit(eventName, event);
      }
      if (delegateTo) {
        if (typeof delegateTo[callback] == 'function') {
          delegateTo[callback](event);
        }
      }
    }
  }
}
