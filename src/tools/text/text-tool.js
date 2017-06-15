import Tool from '../../core/tool.js';
export class TextTool extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.loaded = {};
  }
  activate() {
    super.activate();
    if (this.DOM && this.DOM.PaletteButton) {
      this.DOM.PaletteButton.addClass(this.DOM.PaletteButton.data('activeClass'));
    }
  }
  deactivate() {
    super.deactivate();
    if (this.DOM && this.DOM.PaletteButton) {
      this.DOM.PaletteButton.removeClass(this.DOM.PaletteButton.data('activeClass'));
    }
  }
  get activationPriority() {
    return (this.active ? 500 : -1);
  }
  onMouseDown(event) {
    if (this.isActive()) {
      if (event.event.button == 2) {
        this.finish();
      }
      else {
        // @TODO: check for targetted TextItems or create a TextItem
      }
    }
  }
  onKeyDown(event) {
    if (this.isActive()) {
      // @TODO: handle typing
    }
    else if (this.SL.UI.Keyboard.keyActive('control') && this.SL.UI.Keyboard.keyActive('t')) {
      this.start();
    }
  }
}
