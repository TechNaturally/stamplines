import Tool from '../../core/tool.js';
export class Move extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
  }
  get activationPriority() {
    if (this.Belt.State.Mouse.Hover.selection) {
      return 10;
    }
    return -1;
  }
  refreshUI() {
    if (this.isActive()) {
      this.SL.UI.Mouse.Cursor.activateCursor('move');
    }
  }
  onMouseDrag(event) {
    if (this.isActive()) {
      let Select = this.Belt.Belt.Select;
      let bounds = new paper.Rectangle(Select.UI.outline.strokeBounds);
      bounds.center.set(bounds.center.add(event.delta));
      let Snap = this.SL.Utils.get('Snap');
      if (Snap) {
        bounds = Snap.Rectangle(bounds, {interactive: true});
      }
      let delta = bounds.center.subtract(Select.UI.outline.strokeBounds.center);
      Select.Group.translate(delta);
      this.Belt.refreshUI();
    }
  }
  onMouseUp(event) {
    if (this.isActive()) {
      this.Belt.Belt.Select.SnapSelected({
        position: true,
        size: false
      });
    }
  }
}
