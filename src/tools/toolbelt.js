import * as Tools from './_index.js';
export default class ToolBelt extends paper.Tool {
  // constructor is limited because class extension
  // instead, call init(SL, config) after creation
  init(SL, config) {
    this.SL = SL;
    this.config = config;
    this.Belt = {};
    if (config.enable) {
      this.enable(config.enable);
    }
  }
  enable(type) {
    if (type.constructor === Array) {
      for (var i=0; i < type.length; i++) {
        this.enable(type[i]);
      }
    } else if (type && typeof type == 'string' && !this.Belt[type] && Tools[type]) {
      var newTool = new Tools[type](this.SL, this.config);
      this.Belt[type] = newTool;
      if (!newTool.name) {
        newTool.name = type;
      }
    }
  }
}
