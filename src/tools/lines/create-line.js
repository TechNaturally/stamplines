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
            point.set(Snap.Point(point, {context: 'line-point'}));
          }
          this.State.Append.from = { point: point };
          // setting Append.from initiates the sequence:
          // - LineTool::onMouseMove sees Append.from and sets Append.to
          // - CreateLine::onMouseMove sees Append.to and !Append.line and creates new paper.Path.Line
          // - LineTool::onMouseMove contintues to update Append.to
          // - LineTool::onMouseDown handles adding more points and finishing (including cleanup of Append)
        }
      }
    }
    super.onMouseDown(event);
  }
  onMouseMove(event) {
    super.onMouseMove(event);
    if (this.isActive()) {
      if (!this.State.Append.to) {
        let point = event.point.clone();
        let Snap = this.SL.Utils.get('Snap');
        if (Snap) {
          point.set(Snap.Point(point, {context: 'line-point', interactive: true, segment: this.State.Append.to}));
        }
        this.State.Append.to = { point: point };
      }
      if (!this.State.Append.line && this.State.Append.to && this.State.Append.from && this.loaded.palette) {
        // no line, but have to and from points
        // create a new line
        this.State.Append.line = this.loaded.palette.createLine(this.State.Append.from, this.State.Append.to, this.loaded.line);
        this.State.Append.from = this.State.Append.line.segments[0];
        this.State.Append.to = this.State.Append.line.segments[this.State.Append.line.segments.length-1];
        this.SL.Paper.emit('LineSegmentAdded', {from: this.State.Append.from, to: this.State.Append.to});
        let Snap = this.SL.Utils.get('Snap');
        if (Snap) {
          // from and to were spoof segments before, now snap them with the real segments
          this.State.Append.from.point.set(Snap.Point(this.State.Append.from.point, {context: 'line-point', interactive: false, segment: this.State.Append.from}));
          this.State.Append.to.point.set(Snap.Point(this.State.Append.to.point, {context: 'line-point',  interactive: true, segment: this.State.Append.to}));
        }
      }
    }
  }
}
