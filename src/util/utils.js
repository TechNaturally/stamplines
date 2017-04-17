import Component from '../core/component.js';
import * as Available from './_index.js';
export default class Utils extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.active = {};
    this.configure();
  }
  get type() {
    return 'Utils';
  }

  get(id) {
    return this.active[id];
  }
  gets(type, config={}) {
    if (Available[type]) {
      if (typeof Available[type] != 'function') {
        return Available[type];
      } else {
        return new Available[type](this.SL, config);
      }
    }
    throw `Could not get '${type}' utility!`;
  }

  configure(config) {
    config = super.configure(config);
    for (let id in config) {
      let type = config[id].type || id.toCamelCase().capitalizeFirstLetter();
      this.enable(type, id, config.id);
    }
    return this.config;
  }

  enable(type, id, config) {
    if (type.constructor === Array) {
      let enabled = [];
      type.forEach((type) => {
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
        config = config || ((this.config && this.config[id]) ? this.config[id] : {});
        let newUtil = new Available[type](this.SL, config);
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
