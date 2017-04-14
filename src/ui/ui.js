import {default as Component} from '../core/component.js';
import {default as Dock} from './dock.js';
import {default as Mouse} from './mouse.js';
export default class UI extends Component {
  constructor(SL, config={}, control={}) {
    super(SL, config);
    
    this.DOM = SL.DOM;
    this.PaperCanvas = control.paper;

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
}
