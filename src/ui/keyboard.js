import UIComponent from '../core/ui-component.js';
export default class Keyboard extends UIComponent {
  constructor(SL, config, UI) {
    super(SL, config, UI);
    config = this.config;
    var State = this.State = {
      activeButton: []
    };
    this.Handles = {
      config: config,
      State: State,
      onKeyDown: (event) => {
        if (this.assertActive()) {
          let keyIdx = this.State.activeButton.indexOf(event.key);
          if (keyIdx == -1) {
            this.State.activeButton.push(event.key);
          }
          this.delegateEvent('onKeyDown', event);
        }
      },
      onKeyUp: (event) => {
        let keyIdx = this.State.activeButton.indexOf(event.key);
        if (keyIdx != -1) {
          this.State.activeButton.splice(keyIdx, 1);
        }
        this.delegateEvent('onKeyUp', event);
      }
    };
    this.register();
    this.configure();
  }
  get type() {
    return 'UI.Keyboard';
  }
}
