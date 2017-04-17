import Component from '../core/component.js';
export default class Util extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.configure();
  }
  get type() {
    return 'Util';
  }
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }

  activate() {
    this._active = true;
  }
  deactivate() {
    this._active = false;
  }
  isActive() {
    return this._active;
  }
}
