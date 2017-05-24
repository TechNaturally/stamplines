import {LineTool} from './line-tool.js';
export class EditLine extends LineTool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    $.extend(this.State, {
      target: undefined,
      targetSegment: undefined,
      targetHead: undefined,
      targetTail: undefined
    });
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
    this.controlOtherTools(false);
  }
  resetState() {
    super.resetState();
    this.State.target = undefined;
    this.State.targetSegment = undefined;
    this.State.targetHead = undefined;
    this.State.targetTail = undefined;
  }
  activate() {
    super.activate();
    this.controlOtherTools();
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
      this.endTargetted(this.State.targetHead || this.State.targetTail);
    }
    else {
      this.SL.Paper.Item.forEachOfClass('Tool', (item) => {
        item.visible = true;
      });
      this.endTargetted(false);
    }
  }

  refreshUI() {
    super.refreshUI();
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
  
  onMouseDrag(event) {
    if (this.isActive()) {
      if (this.UI.target) {
        let point = this.UI.target.position.add(event.delta);
        let Snap = this.SL.Utils.get('Snap');
        if (Snap) {
          this.UI.target.position.set(Snap.Point(point, {context: 'line-point', interactive: true}));
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
          this.UI.target.position.set(Snap.Point(point, {context: 'line-point', interactive: false}));
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
    super.onMouseMove(event);
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
