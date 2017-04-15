import Component from '../core/component.js';
import * as Available from './_index.js';
export default class Utils extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.active = {};
  }
  get type() {
    return 'Utils';
  }

  get(id) {
    return this.active[id];
  }

  enable(type, id) {
    if (type.constructor === Array) {
      let enabled = [];
      type.forEach(type => {
        if (typeof type == 'string') {
          enabled.push(this.enable(type));
        } else if (typeof type == 'object') {
          enabled.push(this.enable(type.type, type.id));
        }
      });
      return enabled;
    } else if (type && typeof type == 'string'){
      if (!id) {
        id = type.toLowerCase();
      }
      if (!this.active[id] && Available[type]) {
        var newUtil = new Available[type](this.SL, ((this.config && this.config[id])?this.config[id]:{}));
        this.active[id] = newUtil;
        if (!newUtil.name) {
          newUtil.name = type;
        }
      }
      if (this.active[id] && typeof this.active[id].activate == 'function') {
        this.active[id].activate();
      }
      return this.active[id];
    }
  }
}
