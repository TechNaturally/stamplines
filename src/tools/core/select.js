import Tool from '../../core/tool.js';
export class Select extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
  }
  get activationPriority() {
    return 0;
  }
  refreshUI() {
    if (this.isActive()) {
      this.SL.UI.Mouse.Cursor.activateCursor('crosshair');
    }
  }
}
