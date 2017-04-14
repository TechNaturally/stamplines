import UIComponent from '../core/ui-component.js';
export default class Dock extends UIComponent {
  constructor(UI, config={}) {
    super(UI, config);
    this.register();
  }
  get type() {
    return 'UI.Dock';
  }
}
