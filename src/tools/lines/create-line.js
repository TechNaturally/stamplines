import {EditLine} from './edit-line.js';
export class CreateLine extends EditLine {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.loaded = {};
  }
  deactivate() {
    super.deactivate();
    this.unloadLine();
  }

  loadLine(line, palette, activate=true) {
    this.loaded.line = line;
    this.loaded.palette = palette;
    if (activate) {
      this.start();
    }
    this.refreshUI();
    if (this.Append.line && this.loaded.line && this.loaded.line.style) {
      this.SL.Paper.applyStyle(this.Append.line, this.loaded.line.style);
    }
  }
  unloadLine() {
    this.loaded.line = undefined;
    delete this.loaded.line;
    this.loaded.palette = undefined;
    delete this.loaded.palette;
  }

  refreshUI() {
    if (this.isActive()) {
      this.SL.UI.Mouse.Cursor.activateCursor('crosshairs');
    }
  }

  onMouseDown(event) {
    if (this.isActive()) {
      if (event.event.button === 0) {
        if (!this.Append.from && this.loaded.line) {
          let point = event.point.clone();
          let Snap = this.SL.Utils.get('Snap');
          if (Snap) {
            point = Snap.Point(point);
          }
          this.Append.from = { point: point };
          // setting Append.from initiates the sequence:
          // - EditLine::onMouseMove sees Append.from and sets Append.to
          // - CreateLine::onMouseMove sees Append.to and !Append.line and creates new paper.Path.Line
          // - EditLine::onMouseMove contintues to update Append.to
          // - EditLine::onMouseDown handles adding more points and finishing (including cleanup of Append)
        }
      }
    }
    super.onMouseDown(event);
  }
  onMouseMove(event) {
    super.onMouseMove(event);
    if (this.isActive()) {
      if (!this.Append.line && this.Append.to && this.Append.from && this.loaded.palette) {
        this.Append.line = this.loaded.palette.createLine(this.Append.from, this.Append.to, this.loaded.line);
        this.Append.to = this.Append.line.segments[this.Append.line.segments.length-1];
      }
    }
  }
}
