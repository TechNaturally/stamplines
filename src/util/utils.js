import Component from '../core/component.js';
import {default as NamedObjectMap} from './classes/named-object-map.js';
import * as Available from './_index.js';
export default class Utils extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.active = new NamedObjectMap(SL, {
      config: this.config,
      types: Available,
      exclusiveIDs: true,
      '#onAdd': [
        (entry, type) => {
          entry.name = (entry.name || type);
        },
        'activate'],
      '#onRemove': 'deactivate'
    });
    this.configure();
  }
  get type() {
    return 'Utils';
  }

  configure(config) {
    config = super.configure(config);
    this.active.readConfigured(config);
    return this.config;
  }
  enable(type, id, config) {
    return this.active.addEntry(type, id, config);
  }
  disable(id='*') {
    return this.active.removeEntry(id);
  }
  get(type, id, config) {
    return this.active.getEntry(type, id, config);
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
}
