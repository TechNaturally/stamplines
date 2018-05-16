import {default as Component} from '../core/component.js';
import {default as Dock} from './dock.js';
import {default as Mouse} from './mouse.js';
import {default as Keyboard} from './keyboard.js';
import {default as PaperDOM} from './paper-dom.js';
export default class UI extends Component {
  constructor(SL, config={}, control={}) {
    super(SL, config);
    this.DOM = SL.DOM;
    this.PaperCanvas = control.paper;
    this.eventHandlers = {};
    this.initialized = true;
    this.configure();
  }
  reset() {
    super.reset();
    this.resetEventHandlers();
    this.destroyDock();
    this.destroyPaperDOM();
    this.destroyMouse();
    this.destroyKeyboard();
    this.unwrapDOM();
  }
  destroyDock() {
    if (this.Dock) {
      this.Dock.destroy();
    }
  }
  destroyPaperDOM() {
    if (this.PaperDOM) {
      this.PaperDOM.destroy();
    }
  }
  destroyMouse() {
    if (this.Mouse) {
      this.Mouse.destroy();
    }
  }
  destroyKeyboard() {
    if (this.Keyboard) {
      this.Keyboard.destroy();
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
    this.PaperDOM.activate();
    this.Mouse.activate();
    this.Keyboard.activate();
    this.SL.Paper.emit('UI:Activated', {}, this);
  }
  deactivate() {
    if (this.DOM.wrapper) {
      this.DOM.wrapper.removeClass('sl-active');
    }
    this.Dock.deactivate();
    this.PaperDOM.deactivate();
    this.Mouse.deactivate();
    this.Keyboard.deactivate();
    this.SL.Paper.emit('UI:Deactivated', {}, this);
  }

  configure(config) {
    config = super.configure(config);

    if (this.config.DOM && this.config.DOM.useWrapper) {
      this.wrapDOM();
    }

    // initialize Dock
    this.config.Dock = this.config.Dock || {};
    this.Dock = new Dock(this.SL, this.config.Dock, this);

    // initialize PaperDOM
    this.config.PaperDOM = this.config.PaperDOM || {};
    this.PaperDOM = new PaperDOM(this.SL, this.config.PaperDOM, this);

    // initialize Mouse
    this.config.Mouse = this.config.Mouse || {};
    this.Mouse = new Mouse(this.SL, this.config.Mouse, this);

    // initialize Keyboard
    this.config.Keyboard = this.config.Keyboard || {};
    this.Keyboard = new Keyboard(this.SL, this.config.Keyboard, this);

    this.initEventHandlers();

    return this.config;
  }

  initEventHandlers() {
    if (!this.initialized) {
      return;
    }
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    if (!this.eventHandlers.ViewTransformed) {
      this.eventHandlers.ViewTransformed = this.SL.Paper.on('View.Transformed', undefined, (args, view) => {
        if (!args || !args.temporary) {
          if (this.DOM.wrapper) {
            var canvasStyle = window.getComputedStyle(this.DOM.canvas[0]);
            if (canvasStyle.width) {
              this.DOM.wrapper.css('width', canvasStyle.width);
            }
          }
        }
      }, 'UI.ViewTransformed');
    }
  }
  resetEventHandlers() {
    if (!this.initialized || !this.eventHandlers) {
      return;
    }
    if (this.eventHandlers.ViewTransformed) {
      this.SL.Paper.off('View.Transformed', this.eventHandlers.ViewTransformed.id);
      delete this.eventHandlers.ViewTransformed;
      this.eventHandlers.ViewTransformed = undefined;
    }
  }

  classify(id) {
    return id.toDashCase();
  }

  unwrapDOM() {
    if (this.DOM.wrapper) {
      if (this.DOM.canvas) {
        this.DOM.wrapper.before(this.DOM.canvas);
        this.DOM.wrapper.remove();
        delete this.DOM.wrapper;
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
