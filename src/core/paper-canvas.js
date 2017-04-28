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
      this.paperProject.activate();
    }
  }
  deactivate() {
    if (this.SL.Paper && this.isActive()) {
      this.SL.Paper.activate();
    }
  }
  isActive () {
    return (paper.project === this.paperProject);
  }
  reset() {
    super.reset();
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
    if (this.canvas && this.canvas.length) {
      let activeProject = paper.project;

      // create + track the new paper.Project
      paper.setup(this.canvas[0]);
      this.paperProject = paper.project;

      // don't automatically activate the new project
      if (activeProject) {
        paper.project = activeProject;
      }

      // disable right-click menu on canvas
      this.canvas.bind('contextmenu', (event) => {
        return false;
      });

      // add the class to the canvas
      if (!this.canvas.hasClass('sl-canvas')) {
        this.canvas.addClass('sl-canvas');
      }

      this.view.onMouseLeave = (event) => {
        this.leftActive = !!(paper.view == this.view);
      };
      this.canvas.on('mouseenter.stamplines', (event) => {
        this.SL.activate();
      });
      this.canvas.on('mouseleave.stamplines', (event) => {
        setTimeout(() => {
          if (!this.leftActive) {
            this.SL.deactivate();
          }
        }, 0);
      });
    }
    this.registerHandlers(this.Handles);

    // @TODO: initialize a Util.Bounds(this.canvas)

    return this.config;
  }

  registerHandlers(handlers) {
    var view = this.view || paper.view;
    if (!view) {
      throw 'No view to register handlers on!';
    }
    if (handlers) {
      if (typeof handlers != 'object') {
        throw 'Cannot register invalid handlers!';
      }
      Object.keys(handlers).forEach((handler) => {
        var callback = handlers[handler];
        if (typeof callback == 'function') {
          view[handler] = callback;
        }
      });
    }
  }
}
