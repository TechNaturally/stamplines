import Component from '../core/component.js';
import * as Tools from './_index.js';
export default class ToolBelt extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.Belt = {};
    this.State = {
      activeTool: undefined,
      Mouse: {
        Hover: {}
      }
    };
    if (config.enable) {
      this.enableTool(config.enable);
    }
    this.checkActiveTool();
  }
  reset() {
    super.reset();
    for (let type in this.Belt) {
      this.Belt[type].destroy();
      this.Belt[type] = undefined;
    }
    this.State.activeTool = undefined;
    this.State.Mouse.Hover = {};
  }

  enableTool(type) {
    if (type.constructor === Array) {
      for (var i=0; i < type.length; i++) {
        this.enableTool(type[i]);
      }
    }
    else if (type && typeof type == 'string' && !this.Belt[type] && Tools[type]) {
      let config = this.config[type] || {};
      let newTool = new Tools[type](this.SL, config, this);
      this.Belt[type] = newTool;
      if (!newTool.name) {
        newTool.name = type;
      }
    }
  }
  disableTool(type) {
    if (type && this.Belt[type]) {
      if (this.State.ActiveTool == this.Belt[type]) {
        this.deactivateTool();
      }
      this.Belt[type].destroy();
      this.Belt[type] = undefined;
      delete this.Belt[type];
    }
  }
  activateTool(type) {
    if (this.Belt[type]) {
      let wasActive = this.State.ActiveTool;
      let activate = this.Belt[type];
      if (wasActive && activate != wasActive) {
        this.deactivateTool(false);
      }
      this.State.ActiveTool = activate;
      if (activate && !activate.isActive() && typeof activate.activate == 'function') {
        activate.activate();
      }
      if (activate != wasActive) {
        this.checkMouseTarget();
        this.refreshUI();
      }
      return activate;
    }
  }
  deactivateTool(checkForActive=true, activeTool=null) {
    let deactivate = this.State.ActiveTool;
    if (activeTool && deactivate != activeTool) {
      return;
    }
    if (deactivate && typeof deactivate.deactivate == 'function') {
      deactivate.deactivate();
    }
    this.State.ActiveTool = undefined;
    if (deactivate) {
      this.refreshUI();
    }
    if (checkForActive) {
      this.checkActiveTool();
    }
    return deactivate;
  }
  checkActiveTool(enable=true) {
    let activate;
    for (let type in this.Belt) {
      let tool = this.Belt[type];
      let priority = tool.activationPriority;
      if (priority >= 0 && (!activate || priority >= activate.priority)) {
        if (!activate) {
          activate = {};
        }
        activate.type = type;
        activate.tool = tool;
        activate.priority = priority;
      }
    }
    if (activate && activate.type) {
      this.activateTool(activate.type);
    }
  }
  checkMouseTarget() {
    if (this.SL.UI.Mouse.State.active && this.SL.UI.Mouse.State.point) {
      var oldTarget = this.State.Mouse.Hover.target;
      var target = this.SL.Paper.project.hitTest(this.SL.UI.Mouse.State.point);
      this.State.Mouse.Hover.target = target;
      this.State.Mouse.Hover.targetItem = ((target && target.item) ? target.item : null);
      this.State.Mouse.Hover.targetLocked = (target && target.item && target.item.data && target.item.data.locked);
      if ( ((!target && oldTarget) || (target && !oldTarget) 
        || (target && oldTarget && (target.item != oldTarget.item || target.segment != oldTarget.segment)))) {
        this.runTools('onMouseHoverTargetChange', {target: target, oldTarget: oldTarget});
        this.refreshUI();
      }
    }
  }
  refreshUI() {
    this.runTools('refreshUI');
  }
  runTools(method, args, on=ToolBelt.RUN_ON.ALL) {
    for (let type in this.Belt) {
      let tool = this.Belt[type];
      if (!tool || typeof tool[method] != 'function') {
        continue;
      }
      if (on===ToolBelt.RUN_ON.ACTIVE) {
        if (tool.isActive()) {
          tool[method](args);
        }
      }
      else if (on===ToolBelt.RUN_ON.INACTIVE) {
        if (!tool.isActive()) {
          tool[method](args);
        }
      }
      else {
        tool[method](args);
      }
    }
  }
  refresh() {
    this.onMouseMove(this.SL.UI.Mouse.State.lastMove);
    this.refreshUI();
  }
  onKeyDown(event) {
    this.runTools('onKeyDown', event);
  }
  onKeyUp(event) {
    this.runTools('onKeyUp', event);
  }
  onMouseMove(event) {
    this.checkMouseTarget();
    this.checkActiveTool();
    this.runTools('onMouseMove', event);
  }
  onMouseDown(event) {
    this.runTools('onMouseDown', event);
  }
  onMouseUp(event) {
    this.runTools('onMouseUp', event);
  }
  onMouseDrag(event) {
    this.runTools('onMouseDrag', event);
  }
  onClick(event) {
    this.runTools('onClick', event);
  }
  onDoubleClick(event) {
    this.runTools('onDoubleClick', event);
  }
  onSelectionItemSelected(event) {
    this.runTools('onSelectionItemSelected', event);
  }
  onSelectionItemUnselected(event) {
    this.runTools('onSelectionItemUnselected', event);
  }
  onSelectionHover(event) {
    this.runTools('onSelectionHover', event);
  }
  onSelectionUnhover(event) {
    this.runTools('onSelectionUnhover', event);
  }
}
ToolBelt.RUN_ON = {
  ALL: 0,
  ACTIVE: 1,
  INACTIVE: 2
};
