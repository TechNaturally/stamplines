import Component from './component.js';
export default class Tool extends Component {
  constructor(SL, config, Belt) {
    super(SL, config);
    this.Belt = Belt;
    this.configure(config);
  }
  configure(config) {
    return super.configure($.extend({}, config));
  }
  get type() {
    return 'Tool';
  }
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }
  get activationPriority() {
    return -1;
  }
  isActive() {
    return !!this.active;
  }
  activate() {
    this.active = true;
  }
  deactivate() {
    this.active = false;
  }
  start() {
    this.Belt.activateTool(this.constructor.name);
  }
  finish(checkForActive=true) {
    this.Belt.deactivateTool(checkForActive, this);
  }
}
