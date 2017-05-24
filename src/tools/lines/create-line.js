import {LineTool} from './line-tool.js';
export class CreateLine extends LineTool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.loaded = {};
  }
  activate() {
    super.activate();
    this.endTargetted(true);
  }
  deactivate() {
    super.deactivate();
    this.unloadLine();
  }
  get activationPriority() {
    return (this.active ? 500 : -1);
  }

  loadLine(line, palette, activate=true) {
    this.loaded.line = line;
    this.loaded.palette = palette;
    if (activate) {
      this.start();
    }
    this.refreshUI();
    if (this.State.Append.line && this.loaded.line && this.loaded.line.style) {
      this.SL.Paper.applyStyle(this.State.Append.line, this.loaded.line.style);
    }
  }
  unloadLine() {
    this.loaded.line = undefined;
    delete this.loaded.line;
    this.loaded.palette = undefined;
    delete this.loaded.palette;
  }

  onMouseDown(event) {
    if (this.isActive()) {
      if (event.event.button === 0) {
        if (!this.State.Append.from && this.loaded.line) {
          let point = event.point.clone();
          let Snap = this.SL.Utils.get('Snap');
          if (Snap) {
            point = Snap.Point(point);
          }
          this.State.Append.from = { point: point };
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
      if (!this.State.Append.line && this.State.Append.to && this.State.Append.from && this.loaded.palette) {
        this.State.Append.line = this.loaded.palette.createLine(this.State.Append.from, this.State.Append.to, this.loaded.line);
        this.State.Append.to = this.State.Append.line.segments[this.State.Append.line.segments.length-1];
      }
    }
  }
}
