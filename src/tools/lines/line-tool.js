import Tool from '../../core/tool.js';
export class LineTool extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.State = {
      Append: {
        line: null,
        from: null,
        to: null,
        toHead: null
      },
      endTargetted: false
    };
    this.initialized = true;
  }
  reset() {
    if (!this.initialized) {
      return;
    }
    super.reset();
    this.resetState();
  }
  resetState() {
    this.resetStateAppend();
  }
  resetStateAppend() {
    if (this.State.Append.to && typeof this.State.Append.to.remove == 'function') {
      this.State.Append.to.remove();
    }
    if (this.State.Append.line && this.State.Append.line.segments.length < 2) {
      // 1 point == 1 segment, so there is no line if there are less than 2 points
      this.SL.Paper.destroyPaperItem(this.State.Append.line);
    }
    this.State.Append.line = null;
    this.State.Append.from = null;
    this.State.Append.to = null;
    this.State.Append.toHead = null;
    this.endTargetted(false);
  }
  activate() {
    super.activate();
    this.refreshUI();
  }
  deactivate() {
    super.deactivate();
    this.reset();
  }

  refreshUI() {
    if (this.isActive()) {
      this.SL.UI.Mouse.Cursor.activateCursor('crosshairs');
    }
  }

  endTargetted(toggle=true) {
    if (this.State.endTargetted != toggle) {
      this.State.endTargetted = toggle;
      this.SL.Paper.emit('LineEndTarget', {toggle: toggle});
    }
  }

  onMouseDown(event) {
    if (this.isActive()) {
      if (event.event.button === 0) {
        if (this.State.Append.line && this.State.Append.to) {
          this.State.Append.from = this.State.Append.to;
          this.State.Append.to = null;
          let Snap = this.SL.Utils.get('Snap');
          if (Snap) {
            this.State.Append.from.point.set(Snap.Point(this.State.Append.from.point, {context: 'line-point'}));
          }
        }
      }
      else if (event.event.button == 2) {
        this.finish();
      }
    }
  }
  onMouseMove(event) {
    if (this.isActive()) {
      if (this.State.Append.from) {
        let point = event.point.clone();
        let Snap = this.SL.Utils.get('Snap');
        if (Snap) {
          point = Snap.Point(point, {context: 'line-point', interactive: true});
        }
        if (!this.State.Append.to) {
          // spoof segment object to initialize the real one with
          // the real segment is returned by the line's append function
          this.State.Append.to = { point: point };
          if (this.State.Append.line) {
            if (this.State.Append.toHead) {
              this.State.Append.to = this.State.Append.line.insert(0, this.State.Append.to.point);
            }
            else {
              this.State.Append.to = this.State.Append.line.add(this.State.Append.to.point);
            }
          }
          this.endTargetted(true);
        }
        else {
          // update the append point
          this.State.Append.to.point.set(point);
        }
      }
    }
  }
}
