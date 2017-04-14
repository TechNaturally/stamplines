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

    this.canvas = config.canvas;
    if(this.canvas && this.canvas.length){
      paper.setup(this.canvas[0]);
    }

    this.registerHandlers(this.Handles);
  }
  get type() {
    return 'PaperCanvas';
  }

  get view() {
    return paper.view;
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
      Object.keys(handlers).forEach(function registerHandler(handler) {
        var callback = handlers[handler];
        view[handler] = callback;
      });
    }
  }
}
