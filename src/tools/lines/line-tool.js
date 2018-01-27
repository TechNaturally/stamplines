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
      endTargetted: false,
      Target: {
        hit: undefined,
        segment: undefined,
        head: undefined,
        tail: undefined
      },
      target: undefined,
      targetSegment: undefined,
      targetHead: undefined,
      targetTail: undefined
    };
    this.UI = {};
    this.initialized = true;
  }
  configure(config) {
    config = super.configure(config);
    this.configureUI(config.ui);
    return config;
  }
  configureUI(config={}) {
    this.config.ui = config;
    if (config.color == undefined) {
      config.color = '#00AA66';
    }
    if (!config.target) {
      config.target = {};
    }
    if (config.target.radius == undefined) {
      config.target.radius = 10;
    }
    if (config.target.color == undefined) {
      config.target.color = config.color;
    }
    if (config.target.fillColor == undefined) {
      config.target.fillColor = '#FFFFFF';
    }
    if (config.target.strokeColor == undefined) {
      config.target.strokeColor = config.target.color;
    }
    if (config.target.strokeWidth == undefined) {
      config.target.strokeWidth = 2;
    }
    if (config.target.opacity == undefined) {
      config.target.opacity = 0.9;
    }
  }
  reset() {
    if (!this.initialized) {
      return;
    }
    super.reset();
    this.resetUI();
    this.resetState();
  }
  resetUI() {
    if (this.UI.target) {
      this.SL.Paper.destroyPaperItem(this.UI.target);
      this.UI.target = undefined;
    }
  }
  resetState() {
    this.resetStateAppend();
    this.resetStateTarget();
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
  resetStateTarget() {
    this.State.Target.hit = undefined;
    this.State.Target.segment = undefined;
    this.State.Target.head = undefined;
    this.State.Target.tail = undefined;
  }
  activate() {
    super.activate();
    this.refreshUI();
  }
  deactivate() {
    super.deactivate();
    this.reset();
  }
  isAppending() {
    return (this.State.Append.line || this.State.Append.from || this.State.Append.to);
  }
  stopAppending() {
    this.resetStateAppend();
  }

  refreshUI() {
    if (this.isActive()) {
      this.SL.UI.Mouse.Cursor.activateCursor('crosshairs');

      let targetPoint = new paper.Point();
      let hasTargetPoint = false;

      if (this.State.Target.segment && this.State.Target.segment.point) {
        targetPoint.set(this.State.Target.segment.point);
        hasTargetPoint = true;
      }
      else if (this.State.Append.to && this.State.Append.to.point) {
        targetPoint.set(this.State.Append.to.point);
        hasTargetPoint = true;
      }
      else if (this.State.Append.from && this.State.Append.from.point) {
        targetPoint.set(this.State.Append.from.point);
        hasTargetPoint = true;
      }

      if (hasTargetPoint) {
        if (!this.UI.target) {
          this.UI.target = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:this.SL.Paper.Layers['UI_FG']+10}, paper.Shape.Circle, targetPoint, this.config.ui.target.radius);
          this.SL.Paper.applyStyle(this.UI.target, this.config.ui.target);
        }
        if (this.UI.target && this.UI.target.position) {
          this.UI.target.position.set(targetPoint);
        }
      }
    }
    else if (this.UI.target) {
      this.resetUI();
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
          let wasFrom = this.State.Append.from;
          this.State.Append.from = this.State.Append.to;
          this.State.Append.to = null;
          let Snap = this.SL.Utils.get('Snap');
          if (Snap) {
            this.State.Append.from.point.set(Snap.Point(this.State.Append.from.point, {context: 'line-point', segment: this.State.Append.from}));
          }
          this.SL.Paper.emit('LineSegmentAdded', {from: wasFrom, to: this.State.Append.from});
        }
      }
      else if (event.event.button == 2) {
        this.finish();
      }
    }
  }
  onMouseUp(event) {
    if (this.isActive()) {
      // snap the point with interactive: false
      let point = event.point.clone();
      let Snap = this.SL.Utils.get('Snap');
      if (Snap && point) {
        point.set(Snap.Point(point, {context: 'line-point', interactive: false, segment: this.State.Target.segment}));
      }

      // make sure the target gets snapped
      if (this.UI.target) {
        this.UI.target.position.set(point);
      }
      if (this.State.Target.segment) {
        this.State.Target.segment.point.set(point);
        this.Belt.refreshUI();
      }

      if (!this.SL.UI.Mouse.State.button.drag) {
        // no drag means a click, check if it was on end point
        if (this.State.Target.head || this.State.Target.tail) {
          this.State.Append.line = this.State.Target.hit.item;
          this.State.Append.from = this.State.Target.segment;
          this.State.Append.toHead = !this.State.Target.tail;
          this.refreshUI();
        }
      }

    }
  }
  onMouseMove(event) {
    if (this.isActive()) {
      let point = event.point.clone();
      let Snap = this.SL.Utils.get('Snap');
      if (Snap) {
        point.set(Snap.Point(point, {context: 'line-point', interactive: true, segment: this.State.Append.to}));
      }
      if (this.State.Append.from) {
        if (!this.State.Append.to) {
          // spoof segment object to initialize the real one with
          // the real segment is returned by the line's append function
          this.State.Append.to = { point: point };
        }
      }
      if (this.State.Append.to && this.State.Append.to.point) {
        // update the append point
        this.State.Append.to.point.set(point);

        // insert the point if it doesn't have a path
        if (this.State.Append.line && !this.State.Append.to.path) {
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
      }
      this.refreshUI();
    }
    if (this.Belt.State.Mouse.Hover.targetSelected && this.Belt.State.Mouse.Hover.targetItem 
      && this.Belt.State.Mouse.Hover.targetItem.data && this.Belt.State.Mouse.Hover.targetItem.data.Type == 'Line'
      && this.Belt.State.Mouse.Hover.target.type == 'segment') {
      // Mouse is hovered on a selected line
      if (this.State.Target.hit != this.Belt.State.Mouse.Hover.target) {
        this.State.Target.hit = this.Belt.State.Mouse.Hover.target;
        this.State.Target.segment = (this.State.Target.hit && this.State.Target.hit.segment) ? this.State.Target.hit.segment : undefined;
        this.State.Target.head = false;
        this.State.Target.tail = false;

        if (this.State.Target.segment && this.State.Target.hit.item && this.State.Target.hit.item.segments) {
          let segments = this.State.Target.hit.item.segments;
          let segmentIndex = segments.indexOf(this.State.Target.segment);
          if (segmentIndex == 0) {
            this.State.Target.head = true;
          }
          if (segmentIndex == (segments.length-1)) {
            this.State.Target.tail = true;
          }
        }
        this.Belt.checkActiveTool();
      }
    }
    else if (this.State.Target.hit && this.State.Target.hit != this.Belt.State.Mouse.Hover.target && (!this.Belt.State.Mouse.Hover.target || this.Belt.State.Mouse.Hover.target.item != this.UI.target)) {
      this.State.Target.hit = undefined;
      this.State.Target.segment = undefined;
      this.State.Target.head = undefined;
      this.State.Target.tail = undefined;
      if (!this.isAppending()) {
        this.finish();
      }
    }
  }
}
