import Tool from '../../core/tool.js';
export class CreateStamp extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.loaded = {};
  }
  get activationPriority() {
    return (this.active ? 500 : -1);
  }
  activate() {
    super.activate();
  }
  deactivate() {
    super.deactivate();
    this.unloadStamp();
  }

  loadStamp(stamp, palette, activate=true) {
    this.loaded.stamp = stamp;
    this.loaded.palette = palette;
    if (activate) {
      this.start();
    }
    this.refreshUI();
  }
  placeStamp(point) {
    if (this.loaded.palette && this.loaded.stamp) {
      let stamp = this.loaded.palette.placeStamp(this.loaded.stamp, point.clone());
      let Snap = this.SL.Utils.get('Snap');
      if (Snap) {
        Snap.Item(stamp);
      }
    }
    this.finish();
  }
  unloadStamp() {
    this.loaded.stamp = undefined;
    delete this.loaded.stamp;
    this.loaded.palette = undefined;
    delete this.loaded.palette;
  }

  refreshUI() {
    if (this.isActive()) {
      if (this.loaded.stamp && this.loaded.palette) {
        this.SL.UI.Mouse.Cursor.activateCursor({
          src: this.loaded.palette.getImagePath(this.loaded.stamp)
        });
      }
      else {
        this.SL.UI.Mouse.Cursor.activateCursor('crosshairs');
      }
    }
  }
  onMouseDown(event) {
    if (this.isActive()) {
      if (event.event.button == 2) {
        this.finish();
      }
    }
  }
  onMouseUp(event) {
    if (this.isActive()) {
      if (event.event.button != 2) {
        this.placeStamp(event.point);
      }
    }
  }
}
