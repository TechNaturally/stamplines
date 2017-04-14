import UIComponent from '../core/ui-component.js';
export default class Dock extends UIComponent {
  constructor(config={}) {
    super(config);
    this.register();
  }
  get type() {
    return 'UI.Dock';
  }
}
