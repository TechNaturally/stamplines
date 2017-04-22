import {default as Component} from '../core/component.js';
import {default as Dock} from './dock.js';
import {default as Mouse} from './mouse.js';
import {default as Keyboard} from './keyboard.js';
export default class UI extends Component {
  constructor(SL, config={}, control={}) {
    super(SL, config);
    this.DOM = SL.DOM;
    this.PaperCanvas = control.paper;
    this.configure();
  }
  destroy() {
    this.destroyDock();
    this.destroyMouse();
    this.unwrapDOM();
  }
  destroyDock() {
    if (this.Dock) {
      this.Dock.destroy();
    }
  }
  destroyMouse() {
    if (this.Mouse) {
      this.Mouse.destroy();
    }
  }

  get type() {
    return 'UI';
  }

  activate() {
    if (this.DOM.wrapper) {
      this.DOM.wrapper.addClass('sl-active');
    }
    this.Dock.activate();
    this.Mouse.activate();
    this.Keyboard.activate();
  }
  deactivate() {
    if (this.DOM.wrapper) {
      this.DOM.wrapper.removeClass('sl-active');
    }
    this.Dock.deactivate();
    this.Mouse.deactivate();
    this.Keyboard.deactivate();
  }

  configure(config) {
    config = super.configure(config);

    if (this.config.DOM && this.config.DOM.useWrapper) {
      this.wrapDOM();
    }

    // initialize Dock
    this.config.Dock = this.config.Dock || {};
    this.Dock = new Dock(this.SL, this.config.Dock, this);

    // initialize Mouse
    this.config.Mouse = this.config.Mouse || {};
    this.Mouse = new Mouse(this.SL, this.config.Mouse, this);

    // initialize Keyboard
    this.config.Keyboard = this.config.Keyboard || {};
    this.Keyboard = new Keyboard(this.SL, this.config.Keyboard, this);

    return this.config;
  }

  classify(id) {
    return id.toDashCase();
  }

  unwrapDOM() {
    if (this.DOM.wrapper) {
      if (this.DOM.canvas && this.DOM.canva) {

      }
    }
  }
  wrapDOM() {
    if (!this.DOM.wrapper && this.DOM.canvas) {
      var wrapperClass = 'stamplines';
      if (typeof this.config.useWrapper == 'string' && wrapperClass != this.config.useWrapper) {
        wrapperClass += ' '+this.config.useWrapper;
      }
      this.DOM.wrapper = $('<div></div>');
      this.DOM.wrapper.addClass(wrapperClass);
      var canvasStyle = window.getComputedStyle(this.DOM.canvas[0]);
      if (canvasStyle.width) {
        this.DOM.wrapper.css('width', canvasStyle.width);
      }
      this.DOM.canvas.before(this.DOM.wrapper);
      this.DOM.wrapper.append(this.DOM.canvas);
    }
  }
}
