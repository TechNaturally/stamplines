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
    this.Layers = {
      'TEMPLATE': -1,
      'GROUPED': -1,
      'BG': 0,
      'CONTENT': 250,
      'UI_BG': 450,
      'UI': 500,
      'UI_FG': 550
    };
    this.defaultClass = 'Content';
    this.untrackable = ['template'];
    this.paperItems = {};
    this.paperLayers = {};
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
    if (this.paperLayers) {
      for (let layer in this.paperLayers) {
        this.paperLayers[layer].remove();
        this.paperLayers[layer] = undefined;
        delete this.paperLayers[layer];
      }
    }
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

    // initialize the paperProject on the canvas
    this.canvas = $(config.canvas);
    if (this.canvas && this.canvas.length) {
      let activeProject = paper.project;

      // create + track the new paper.Project
      paper.setup(this.canvas[0]);
      this.paperProject = paper.project;

      // don't automatically activate the new project
      if (activeProject) {
        activeProject.activate();
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

    return this.config;
  }

  generatePaperItem() {
    if (arguments.length < 1 || arguments[0] === undefined) {
      throw 'Cannot generate PaperItem without attributes!';
    }
    if (arguments.length < 2 || typeof arguments[1] != 'function') {
      throw 'Cannot generate PaperItem without constructor!';
    }
    let attributes = arguments[0];
    let Constructor = arguments[1];
    let args = Array.prototype.slice.call(arguments, 1); // leave Constructor as 1st entry for bin.apply call

    if (!attributes.Class) {
      // use a default Class
      attributes.Class = this.defaultClass;
    }
    if (attributes.Layer == undefined) {
      // try to read layer based on Class
      if (this.Layers[attributes.Class.toUpperCase()] != undefined) {
        attributes.Layer = this.Layers[attributes.Class.toUpperCase()];
      }
    }
    if (attributes.Layer && typeof attributes.Layer == 'string' && this.Layers[attributes.Layer.toUpperCase()] != undefined) {
      // map string Layer id to numerical Layer id
      attributes.Layer = this.Layers[attributes.Layer.toUpperCase()];
    }

    // verify Layer and Class attributes after auto-conversions
    if (attributes.Layer == undefined) {
      throw 'Cannot generate PaperItem without Layer attribute!';
    }
    else if (Number(attributes.Layer) != attributes.Layer) {
      throw `Cannot generate PaperItem with invalid Layer attribute! (${attributes.Layer})`;
    }
    if (attributes.Class == undefined) {
      throw 'Cannot generate PaperItem without Class attribute!';
    }

    // assert this paperScope
    let activeProject = paper.project;
    if (this.paperProject && activeProject != this.paperProject) {
      this.paperProject.activate();
    }
    
    // Source: http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
    let item = new (Function.prototype.bind.apply(Constructor, args));
    if (typeof item.remove == 'function') {
      item.remove();
    }
    // flip back active project if different
    if (activeProject && activeProject != this.paperProject) {
      activeProject.activate();
    }

    // handle attributes
    if (item.data) {
      $.extend(item.data, attributes);

      // track the item
      if (this.untrackable.indexOf(item.data.Class.toLowerCase()) == -1) {
        this.trackItem(item);
      }
      if (item.data.Source && typeof item.data.Source.trackPaperItem == 'function') {
        item.data.Source.trackPaperItem(item);
      }
    }
    
    return item;
  }
  trackItem(item) {
    if (item) {
      if (!item.data || !item.data.Class) {
        throw 'Cannot track PaperItem without Class attribute!';
      }
      else if (this.untrackable.indexOf(item.data.Class.toLowerCase()) != -1) {
        throw `Cannot track PaperItem of untrackable Class "${item.data.Class}"!`;
      }
      if (!item.data || item.data.Layer == undefined) {
        throw 'Cannot track PaperItem without Layer attribute!';
      }
      this.trackItemByClass(item);
      this.trackItemByLayer(item);
    }
    return item;
  }
  trackItemByClass(item) {
    if (item) {
      if (!item.data || !item.data.Class) {
        throw 'Cannot track PaperItem without Class attribute!';
      }
      else if (this.untrackable.indexOf(item.data.Class.toLowerCase()) != -1) {
        throw `Cannot track PaperItem of untrackable Class "${item.data.Class}"!`;
      }
      if (!this.paperItems[item.data.Class]) {
        this.paperItems[item.data.Class] = [];
      }
      if (this.paperItems[item.data.Class].indexOf(item) == -1) {
        this.paperItems[item.data.Class].push(item);
      }
    }
    return item;
  }
  trackItemByLayer(item) {
    if (item) {
      if (item.data && item.data.Class && this.untrackable.indexOf(item.data.Class.toLowerCase()) != -1) {
        throw `Cannot track PaperItem of untrackable Class "${item.data.Class}"!`;
      }
      if (!item.data || item.data.Layer == undefined) {
        throw 'Cannot track PaperItem without Layer attribute!';
      }
      if (item.data.Layer && typeof item.data.Layer == 'string') {
        // map string Layer id to numerical Layer id
        item.data.Layer = this.Layers[item.data.Layer];
      }
      if (!this.paperLayers[item.data.Layer]) {
        // assert this paperScope
        let activeProject = paper.project;
        if (this.paperProject && activeProject != this.paperProject) {
          this.paperProject.activate();
        }

        // create the new layer
        this.paperLayers[item.data.Layer] = new paper.Layer();
        this.sortLayers();

        // flip back active project if different
        if (activeProject && activeProject != this.paperProject) {
          activeProject.activate();
        }
      }
      this.paperLayers[item.data.Layer].appendTop(item);
    }
    return item;
  }
  destroyPaperItem(item) {
    if (item) {
      if (typeof item.remove == 'function') {
        item.remove();
      }
      this.untrackItem(item);

      if (item.data && item.data.Source && typeof item.data.Source.untrackPaperItem == 'function') {
        item.data.Source.untrackPaperItem(item);
      }
    }
  }
  untrackItem(item) {
    if (item) {
      this.untrackItemByClass(item);
      this.untrackItemByLayer(item);
    }
    return item;
  }
  untrackItemByClass(item) {
    if (item && item.data && item.data.Class && this.paperItems[item.data.Class]) {
      let itemIdx = this.paperItems[item.data.Class].indexOf(item);
      if (itemIdx != -1) {
        this.paperItems[item.data.Class].splice(itemIdx, 1);
      }
    }
    return item;
  }
  untrackItemByLayer(item) {
    if (item && item.data && item.data.Layer && this.paperLayers[item.data.Layer] && item.parent == this.paperLayers[item.data.Layer]) {
      item.remove();
    }
    return item;
  }

  applyStyle(item, style) {
    if (item && style) {
      for (var prop in style) {
        item[prop] = style[prop];
      }
    }
  }

  sortLayers() {
    let keys = Object.keys(this.paperLayers);
    keys.sort((a, b) => {
      return (Number(a) - Number(b));
    });
    keys.forEach((layer) => {
      this.paperLayers[layer].bringToFront();
    });
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
