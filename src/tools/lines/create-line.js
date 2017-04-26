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
      this.applyStyle(this.Append.line, this.loaded.line.style);
    }
  }
  unloadLine() {
    this.loaded.line = undefined;
    delete this.loaded.line;
    this.loaded.palette = undefined;
    delete this.loaded.paletted;
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
          this.Append.from = { point: event.point.clone() };
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
      if (!this.Append.line && this.Append.to && this.Append.from) {
        // @TODO: paper shape tracking
        this.Append.line = new paper.Path.Line(this.Append.from.point, this.Append.to.point);
        this.Append.to = this.Append.line.segments[this.Append.line.segments.length-1];
        if (this.loaded.line && this.loaded.line.style) {
          this.applyStyle(this.Append.line, this.loaded.line.style);
        }
      }
    }
  }
}
