import * as Tools from './_index.js';
export default class ToolBelt extends paper.Tool {
  // constructor is limited because class extension
  // instead, call init(SL, config) after creation
  init(SL, config) {
    // need to do funny binding because paper.Tool doesn't seem to keep methods otherwise
    this.bindMethods();
    this.init(SL, config);
  }
  bindMethods() {
    // binding methods by assignment (vs ES6 class methods) allows them to stay on the paper.Tool
    $.extend(this, {
      init: (SL, config) => {
        this.SL = SL;
        this.config = config;
        this.Belt = {};
        this.ActiveTool = undefined;
        if (config.enable) {
          this.enableTool(config.enable);
        }
        this.activate(); // normal paper.Tool behaviour is to activate new Tools, so do that
      },
      destroy: () => {
        for (let type in this.Belt) {
          this.Belt[type].destroy();
          this.Belt[type] = undefined;
        }
        this.remove();
      },
      enableTool: (type) => {
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
      },
      disableTool: (type) => {
        if (type && this.Belt[type]) {
          if (this.ActiveTool == this.Belt[type]) {
            this.deactivateTool();
          }
          this.Belt[type].destroy();
          this.Belt[type] = undefined;
          delete this.Belt[type];
        }
      },
      activateTool: (type) => {
        if (this.Belt[type]) {
          let activate = this.Belt[type];
          if (this.ActiveTool && this.ActiveTool != activate) {
            this.deactivateTool(false);
          }
          this.ActiveTool = activate;
          if (activate && !activate.isActive() && typeof activate.activate == 'function') {
            activate.activate();
          }
          return activate;
        }
      },
      deactivateTool: (checkForActive=true, activeTool=null) => {
        let deactivate = this.ActiveTool;
        if (activeTool && deactivate != activeTool) {
          return;
        }
        if (deactivate && typeof deactivate.deactivate == 'function') {
          deactivate.deactivate();
        }
        this.ActiveTool = undefined;
        if (checkForActive) {
          this.checkActiveTool();
        }
        return deactivate;
      },
      checkActiveTool: (enable=true) => {
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
      },
      checkMouseTarget: () => {
        // @TODO: check SL.UI.Mouse.State.point
      },
      refreshUI: () => {
        this.runTools('refreshUI');
      },
      runTools: (method, args, on=ToolBelt.RUN_ON.ALL) => {
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
      },
      onActivate: () => {
        this.checkActiveTool();
      },
      onDeactivate: () => {
      },
      onKeyDown: (event) => {
        this.runTools('onKeyDown', event);
      },
      onKeyUp: (event) => {
        this.runTools('onKeyUp', event);
      },
      onMouseMove: (event) => {
        this.checkMouseTarget();
        this.checkActiveTool();
        this.runTools('onMouseMove', event);
      },
      onMouseDown: (event) => {
        this.runTools('onMouseDown', event);
      },
      onMouseUp: (event) => {
        this.runTools('onMouseUp', event);
      },
      onMouseDrag: (event) => {
        this.runTools('onMouseDrag', event);
      },
      onClick: (event) => {
        this.runTools('onClick', event);
      },
      onDoubleClick: (event) => {
        this.runTools('onDoubleClick', event);
      },
      onSelectionChange: (event) => {
        this.runTools('onSelectionChange', event);
      }
    });
  }
}
ToolBelt.RUN_ON = {
  ALL: 0,
  ACTIVE: 1,
  INACTIVE: 2
};
