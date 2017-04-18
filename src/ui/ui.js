import {default as Component} from '../core/component.js';
import {default as Dock} from './dock.js';
import {default as Mouse} from './mouse.js';
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
    if(this.Dock){
      this.Dock.destroy();
    }
  }
  destroyMouse() {
    if(this.Mouse){
      this.Mouse.destroy();
    }
  }

  get type() {
    return 'UI';
  }

  configure(config) {
    config = super.configure(config);

    if (this.config.DOM && this.config.DOM.useWrapper) {
      this.wrapDOM();
    }

    // initialize Dock
    this.config.Dock = this.config.Dock || {};
    this.Dock = new Dock(this, this.config.Dock);

    // initialize Mouse
    this.config.Mouse = this.config.Mouse || {};
    this.Mouse = new Mouse(this, this.config.Mouse);

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
      if(canvasStyle.width){
        this.DOM.wrapper.css('width', canvasStyle.width);
      }
      this.DOM.canvas.before(this.DOM.wrapper);
      this.DOM.wrapper.append(this.DOM.canvas);
    }
  }
}
