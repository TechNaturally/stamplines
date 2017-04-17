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
  activate() {
    if (this.paperProject && paper.project != this.paperProject) {
      paper.project = this.paperProject;
    }
  }
  deactivate() {
    this.SL.Paper.activate();
  }
  destroy() {
    if (this.paperProject) {
      this.paperProject.remove();
      this.paperProject = undefined;
    }
  }

  get type() {
    return 'PaperCanvas';
  }
  get project() {
    return this.paperProject;
  }
  get view() {
    return this.project.view;
  }

  configure(config) {
    config = super.configure(config);
    this.canvas = config.canvas;
    if(this.canvas && this.canvas.length){
      let activeProject = paper.project;

      // create + track the new paper.Project
      paper.setup(this.canvas[0]);
      this.paperProject = paper.project;

      // don't automatically activate the new project
      if (activeProject) {
        paper.project = activeProject;
      }

      // add the class to the canvas
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
