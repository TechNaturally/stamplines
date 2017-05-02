import Tool from '../../core/tool.js';
export class EditLine extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.line = null;
    this.Append = {
      line: null,
      from: null,
      to: null
    };
  }

  get activationPriority() {
    return (this.active ? 500 : -1);
  }
  activate() {
    super.activate();
  }
  deactivate() {
    this.resetAppend();
    super.deactivate();
  }

  resetAppend() {
    if (this.Append.to && typeof this.Append.to.remove == 'function') {
      this.Append.to.remove();
    }
    if (this.Append.line && this.Append.line.segments.length < 2) {
      // 1 point == 1 segment, so there is no line if there are less than 2 points
      this.SL.Paper.destroyPaperItem(this.Append.line);
    }
    this.Append.line = null;
    this.Append.from = null;
    this.Append.to = null;
  }

  onMouseMove(event) {
    if (this.isActive()) {
      if (this.Append.from) {
        if (!this.Append.to) {
          this.Append.to = { point: event.point.clone() };
          if (this.Append.line) {
            this.Append.to = this.Append.line.add(this.Append.to.point);
          }
        }
        else {
          this.Append.to.point.set(event.point);
        }
      }
    }
  }
  onMouseDown(event) {
    if (this.isActive()) {
      if (event.event.button === 0) {
        if (this.Append.line && this.Append.to) {
          this.Append.from = this.Append.to;
          this.Append.to = null;
        }
      }
      else if (event.event.button == 2) {
        this.finish();
      }
    }
  }
}
