import {LineTool} from './line-tool.js';
export class EditLine extends LineTool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    // nothing to customize here
    this.initialized = true;
  }
  reset() {
    if (!this.initialized) {
      return;
    }
    super.reset();
    this.controlOtherTools(false);
  }
  activate() {
    super.activate();
    this.controlOtherTools();
  }
  get activationPriority() {
    if (this.State.Target.hit) {
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
      this.endTargetted(this.State.Target.head || this.State.Target.tail);
    }
    else {
      this.SL.Paper.Item.forEachOfClass('Tool', (item) => {
        item.visible = true;
      });
      this.endTargetted(false);
    }
  }
  
  onDoubleClick(event) {
    if (this.isActive() && event.event && event.event.button === 0) {
      if (this.State.Target.segment && this.State.Target.segment.path && this.State.Target.segment.path.segments && this.State.Target.segment.path.segments.length > 2) {
        if (this.isAppending()) {
          this.stopAppending();
        }
        this.State.Target.segment.remove();
        this.resetUI();
        this.Belt.refresh();
      }
    }
  }
  onMouseDrag(event) {
    if (this.isActive()) {
      if (this.UI.target) {
        let point = event.point.clone();
        let Snap = this.SL.Utils.get('Snap');
        if (Snap) {
          this.UI.target.position.set(Snap.Point(point, {context: 'line-point', interactive: true, segment: this.State.Target.segment}));
        }
        if (this.State.Target.segment) {
          this.State.Target.segment.point.set(this.UI.target.position);
          this.Belt.refreshUI();
        }
      }
    }
  }
}
