import Component from './component.js';
export default class PaperCanvas extends Component {
  constructor(SL, config={}) {
    if (!config.canvas) {
      throw 'No canvas supplied for paper!';
    }
    if (!paper) {
      throw 'Could not find Paper.js library!';
    }
    super(SL, config);
    this.Handles = {
      onResize: function(event) {
        console.log('PaperCanvas.onResize =>', event);
      }
    };
    this.configure();
  }
  get type() {
    return 'PaperCanvas';
  }

  get view() {
    return paper.view;
  }

  configure(config) {
    config = super.configure(config);

    this.canvas = config.canvas;
    if(this.canvas && this.canvas.length){
      paper.setup(this.canvas[0]);
      if(!this.canvas.hasClass('sl-canvas')){
        this.canvas.addClass('sl-canvas');
      }
    }

    this.registerHandlers(this.Handles);

    return this.config;
  }

  registerHandlers(handlers) {
    var view = this.view || paper.view;
    if(!view){
      throw 'No view to register handlers on!';
    }
    if(handlers){
      if(typeof handlers != 'object'){
        throw 'Cannot register invalid handlers!';
      }
      Object.keys(handlers).forEach((handler) => {
        var callback = handlers[handler];
        view[handler] = callback;
      });
    }
  }
}
