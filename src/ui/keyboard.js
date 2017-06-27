import UIComponent from '../core/ui-component.js';
export default class Keyboard extends UIComponent {
  constructor(SL, config, UI) {
    super(SL, config, UI);
    config = this.config;
    var State = this.State = {
      activeKeys: []
    };
    this.Handles = {
      config: config,
      State: State,
      onKeyDown: (event) => {
        if (this.assertActive()) {
          let keyIdx = this.State.activeKeys.indexOf(event.key);
          if (keyIdx == -1) {
            this.State.activeKeys.push(event.key);
          }
          this.delegateEvent('onKeyDown', event);
        }
      },
      onKeyUp: (event) => {
        let keyIdx = this.State.activeKeys.indexOf(event.key);
        if (keyIdx != -1) {
          this.State.activeKeys.splice(keyIdx, 1);
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
  keyActive(key) {
    return (this.State.activeKeys.indexOf(key) != -1);
  }
}
