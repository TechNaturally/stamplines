import {default as Component} from '../core/component.js';
import {default as Dock} from './dock.js';
import {default as Mouse} from './mouse.js';
export default class UI extends Component {
  constructor(SL, config={}, control={}) {
    super(SL, config);
    
    this.DOM = SL.DOM;
    this.PaperCanvas = control.paper;

    if (this.config.DOM && this.config.DOM.useWrapper) {
      this.wrapDOM();
    }

    // initialize UI Compontents
    let componentConfig = {
      paperCanvas: this.PaperCanvas
    };

    // initialize Dock
    this.config.Dock = this.config.Dock || {};
    $.extend(this.config.Dock, componentConfig);
    this.Dock = new Dock(this, this.config.Dock);

    // initialize Mouse
    this.config.Mouse = this.config.Mouse || {};
    $.extend(this.config.Mouse, componentConfig);
    this.Mouse = new Mouse(this, this.config.Mouse);
  }
  get type() {
    return 'UI';
  }

  wrapDOM() {
    if(!this.DOM.wrapper && this.DOM.canvas){
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
