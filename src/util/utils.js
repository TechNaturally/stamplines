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

  configure(config) {
    config = super.configure(config);
    for (let id in config) {
      let type = config[id].type || id.toCamelCase().capitalizeFirstLetter();
      if (this.active[id]) {
        this.disable(id);
      }
      this.enable(type, id, config.id);
    }
    return this.config;
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
        let ID = this.SL.Utils.gets('Identity');
        if (ID) {
          id = ID.getUnique(type.toLowerCase(), this.active);
        }
      }
      if (Available[type] && typeof Available[type] == 'function') {
        if (!this.active[id]) {
          config = config || ((this.config && this.config[id]) ? this.config[id] : {});
          let newUtil = new Available[type](this.SL, config);
          newUtil.id = id;
          this.active[id] = newUtil;
          if (!newUtil.name) {
            newUtil.name = type;
          }
        }
        if (this.active[id] && typeof this.active[id].activate == 'function') {
          this.active[id].activate();
        }
        return this.active[id];
      } else if (Available[type]) {
        return Available[type];
      }
    }
  }
  disable(id='*') {
    if (id == '*') {
      id = Object.keys(this.active);
    }
    if (id.constructor === Array) {
      let disabled = [];
      id.forEach((id) => {
        if (typeof id == 'string') {
          disabled.push(this.disable(id));
        } else if (typeof id == 'object' && id.id) {
          disabled.push(this.disable(id.id));
        }
      });
      return disabled;
    } else if (id && typeof id == 'string'){
      if (this.active[id]) {
        let deactivate = this.active[id];
        if (typeof deactivate.deactivate == 'function') {
          deactivate.deactivate();
        }
        this.active[id] = undefined;
        delete this.active[id];
        return deactivate;
      }
    }
  }
}
