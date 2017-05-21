import Tool from '../../core/tool.js';
export class EditLine extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.State = {
      Append: {
        line: null,
        from: null,
        to: null,
        toHead: null
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
    if (!config.ui) {
      config.ui = {};
    }
    if (config.ui.color == undefined) {
      config.ui.color = '#00AA66';
    }
    if (!config.ui.target) {
      config.ui.target = {};
    }
    if (config.ui.target.radius == undefined) {
      config.ui.target.radius = 10;
    }
    if (config.ui.target.color == undefined) {
      config.ui.target.color = config.ui.color;
    }
    if (config.ui.target.fillColor == undefined) {
      config.ui.target.fillColor = '#FFFFFF';
    }
    if (config.ui.target.strokeColor == undefined) {
      config.ui.target.strokeColor = config.ui.target.color;
    }
    if (config.ui.target.strokeWidth == undefined) {
      config.ui.target.strokeWidth = 2;
    }
    if (config.ui.target.opacity == undefined) {
      config.ui.target.opacity = 0.9;
    }
    return config;
  }
  reset() {
    if (!this.initialized) {
      return;
    }
    super.reset();
    this.resetState();
    this.resetUI();
    this.controlOtherTools(false);
  }
  resetState() {
    this.resetStateAppend();
    this.State.target = undefined;
    this.State.targetSegment = undefined;
    this.State.targetHead = undefined;
    this.State.targetTail = undefined;
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
  }
  activate() {
    super.activate();
    this.refreshUI();
    this.controlOtherTools();
  }
  deactivate() {
    super.deactivate();
    this.reset();
  }
  get activationPriority() {
    if (this.State.target) {
      return 100;
    }
    return (this.active ? 500 : -1);
  }

  controlOtherTools(control=true) {
    if (control) {
      this.SL.Paper.Item.forEachOfClass('Tool', (item) => {
        if (item && item.data && item.data.Source != this) {
          item.visible = false;
        }
      });
    }
    else {
      this.SL.Paper.Item.forEachOfClass('Tool', (item) => {
        item.visible = true;
      });
    }
  }

  refreshUI() {
    if (this.State.targetSegment) {
      if (!this.State.Append.line) {
        if (!this.UI.target) {
          this.UI.target = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:'UI_FG'}, paper.Shape.Circle, this.State.targetSegment.point, this.config.ui.target.radius);
          this.SL.Paper.applyStyle(this.UI.target, this.config.ui.target);
        }
        this.UI.target.position.set(this.State.targetSegment.point);
      }
      else if (this.UI.target) {
        this.resetUI();
      }
    }
  }
  resetUI() {
    if (this.UI.target) {
      this.SL.Paper.destroyPaperItem(this.UI.target);
      this.UI.target = undefined;
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
            this.State.Append.from.point.set(Snap.Point(this.State.Append.from.point));
          }
        }
      }
      else if (event.event.button == 2) {
        this.finish();
      }
    }
  }
  onMouseDrag(event) {
    if (this.isActive()) {
      if (this.UI.target) {
        let point = this.UI.target.position.add(event.delta);
        let Snap = this.SL.Utils.get('Snap');
        if (Snap) {
          this.UI.target.position.set(Snap.Point(point, {interactive: true}));
        }
        if (this.State.targetSegment) {
          this.State.targetSegment.point.set(this.UI.target.position);
          this.Belt.refreshUI();
        }
      }
    }
  }
  onMouseUp(event) {
    if (this.isActive()) {
      if (this.UI.target) {
        let point = this.UI.target.position.clone();
        let Snap = this.SL.Utils.get('Snap');
        if (Snap) {
          this.UI.target.position.set(Snap.Point(point, {interactive: false}));
        }
        if (this.State.targetSegment) {
          this.State.targetSegment.point.set(this.UI.target.position);
          this.Belt.refreshUI();
        }

        // check for click
        if (!this.SL.UI.Mouse.State.button.drag) {
          // check for click on end point
          if (this.State.targetHead || this.State.targetTail) {
            this.State.Append.line = this.State.target.item;
            this.State.Append.from = this.State.target.segment; //this.State.Append.line.segments[segmentIndex];
            this.State.Append.toHead = !this.State.targetTail;
            this.refreshUI();
          }
        }
      }
    }
  }
  onMouseMove(event) {
    if (this.isActive()) {
      if (this.State.Append.from) {
        let point = event.point.clone();
        let Snap = this.SL.Utils.get('Snap');
        if (Snap) {
          point = Snap.Point(point, {interactive: true});
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
        }
        else {
          // update the append point
          this.State.Append.to.point.set(point);
        }
      }
    }
    if (this.Belt.State.Mouse.Hover.targetSelected && this.Belt.State.Mouse.Hover.targetItem 
      && this.Belt.State.Mouse.Hover.targetItem.data && this.Belt.State.Mouse.Hover.targetItem.data.Type == 'Line'
      && this.Belt.State.Mouse.Hover.target.type == 'segment') {
      if (this.State.target != this.Belt.State.Mouse.Hover.target) {
        this.State.target = this.Belt.State.Mouse.Hover.target;
        this.State.targetSegment = (this.State.target && this.State.target.segment) ? this.State.target.segment : undefined;
        this.State.targetHead = false;
        this.State.targetTail = false;
        if (this.State.target && this.State.target.item && this.State.target.item.segments && this.State.target.segment) {
          let segments = this.State.target.item.segments;
          let segmentIndex = segments.indexOf(this.State.target.segment);
          if (segmentIndex == 0) {
            this.State.targetHead = true;
          }
          if (segmentIndex == (segments.length-1)) {
            this.State.targetTail = true;
          }
        }
        this.Belt.checkActiveTool();
      }
    }
    else if (this.State.target && (!this.UI.target || this.Belt.State.Mouse.Hover.targetItem != this.UI.target)) {
      this.State.target = undefined;
      this.State.targetSegment = undefined;
      this.State.targetHead = undefined;
      this.State.targetTail = undefined;
      if (!this.State.Append.line) {
        this.finish();
      }
    }
  }
}
