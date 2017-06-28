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
      onResize: (event) => {
        console.log('PaperCanvas.onResize =>', event);
      },
      onFrame: (event) => {
        this.emit('Frame', event);
      }
    };
    this.initItem();
    this.Layers = {
      'TEMPLATE': -1,
      'GROUPED': -1,
      'BG': 0,
      'CONTENT': 250,
      'CONTENT_ACTIVE': 275,
      'UI_BG': 450,
      'UI': 500,
      'UI_FG': 550
    };
    this.defaultClass = 'Content';
    this.untrackable = ['template'];
    this.paperItems = {};
    this.paperLayers = {};
    this.paperEvents = {};
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
  get isBlocked() {
    return !!(this.SL && this.SL.UI && this.SL.UI.PaperDOM && this.SL.UI.PaperDOM.isBlocked);
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
  initItem() {
    let self = this;
    this.Item = {
      addChild(item, child) {
        if (item && child) {
          if (item._children) {
            item.addChild(child);
          }
          else if (item.data) {
            if (!item.data.Children) {
              item.data.Children = [];
            }
            if (item.data.Children.indexOf(child) == -1) {
              item.data.Children.push(child);
            }
          }
        }
      },
      removeChild(item, child) {
        if (item && child) {
          if (item.children) {
            let childIdx = item.children.indexOf(child);
            if (childIdx != -1) {
              item.removeChildren(childIdx, childIdx+1);
            }
          }
          else if (item.data && item.data.Children) {
            let childIdx = item.data.Children.indexOf(child);
            if (childIdx != -1) {
              item.data.Children.splice(childIdx, 1);
            }
          }
        }
      },
      getChildren(item) {
        if (item) {
          if (item.children) {
            return item.children;
          }
          else if (item.data && item.data.Children) {
            return item.data.Children;
          }
        }
      },
      hasChildren(item) {
        let children = this.getChildren(item);
        return (children && children.length);
      },
      addClass(item, itemClass) {
        let classSet = false;
        if (item && item.data && itemClass) {
          if (!item.data.Class) {
            item.data.Class = itemClass;
            classSet = true;
          }
          else if (item.data.Class != itemClass) {
            if (item.data.Class instanceof 'string') {
              item.data.Class = [item.data.Class, itemClass];
              classSet = true;
            }
            else if (item.data.Class.constructor === Array) {
              if (item.data.Class.indexOf(itemClass) == -1) {
                item.data.Class.push(itemClass);
                classSet = true;
              }
            }
          }
          if (classSet) {
            self.trackItemByClass(item, itemClass);
          }
        }
        return classSet;
      },
      removeClass(item, itemClass) {
        let classSet = false;
        if (item && item.data && itemClass) {
          if (item.data.Class == itemClass) {
            item.data.Class = undefined;
            classSet = true;
          }
          else if (item.data.Class.constructor === Array) {
            let classIdx = item.data.Class.indexOf(itemClass);
            if (classIdx != -1) {
              item.data.Class.splice(classIdx, 1);
              classSet = true;
            }
          }
          if (classSet) {
            self.untrackItemByClass(item, itemClass);
          }
        }
        return classSet;
      },
      hasClass: function(item, itemClass) {
        if (item && item.data && item.data.Class && itemClass) {
          if (item.data.Class.constructor === Array) {
            return (item.data.Class.indexOf(itemClass) != -1);
          }
          else {
            return (item.data.Class == itemClass);
          }
        }
      },
      forEachClass: function(item, callback, data) {
        if (item && item.data && item.data.Class && typeof callback == 'function') {
          if (item.data.Class.constructor === Array) {
            for (let itemClass of item.data.Class) {
              if (callback(itemClass, data)) {
                break;
              }
            }
          }
          else {
            callback(item.data.Class, data);
          }
        }
      },
      forEachOfClass: function(itemClass, callback, data) {
        if (itemClass && self.paperItems[itemClass] && typeof callback == 'function') {
          for (let item of self.paperItems[itemClass]) {
            callback(item, data);
          }
        }
      },
      passesFilter: function(item, filter) {
        if (!filter) {
          return true;
        }
        if (item && item.data) {
          let props = Object.keys(filter);
          let result = true;
          for (let prop of props) {
            if (item.data[prop] != filter[prop]) {
              result = false;
            }
          }
          return result;
        }
        return false;
      },
      setLayer: function(item, layer) {
        if (item) {
          if (!item.data) {
            item.data = {};
          }
          if (item.data.Layer != layer) {
            item.data.Layer = layer;
            self.trackItemByLayer(item);
          }
        }
      },
      addCustomMethod(item, methodName, method, context) {
        if (item && item.data && methodName && typeof method == 'function') {
          item.data[methodName] = (args) => {
            return method.call((context || item), item, args);
          };
        }
      },
      hasCustomMethod(item, methodName) {
        return (item && item.data && methodName && typeof item.data[methodName] == 'function');
      },
      callCustomMethod(item, methodName, args) {
        if (this.hasCustomMethod(item, methodName)) {
          item.data[methodName](args);
        }
      }
    };
  }

  on(type, filter, callback, id) {
    if (type && typeof callback == 'function') {
      if (!this.paperEvents[type]) {
        this.paperEvents[type] = {};
      }
      if (!id) {
        let ID = this.SL.Utils.gets('Identity');
        if (ID) {
          id = ID.getUnique(type, this.paperEvents[type]);
        }
      }
      if (id) {
        if (!this.paperEvents[type][id]) {
          this.paperEvents[type][id] = {
            id: id,
            filter: filter,
            callback: callback
          };
        }
        return this.paperEvents[type][id];
      }
    }
  }
  off(type, id) {
    if (type && id && this.paperEvents[type] && this.paperEvents[type][id]) {
      let handler = this.paperEvents[type][id];
      this.paperEvents[type][id] = undefined;
      delete this.paperEvents[type][id];
      if (Object.keys(this.paperEvents[type]).length == 0) {
        this.paperEvents[type] = undefined;
        delete this.paperEvents[type];
      }
      return handler;
    }
  }
  emit(type, args, item) {
    if (type && this.paperEvents[type]) {
      let keys = Object.keys(this.paperEvents[type]);
      for (let id of keys) {
        let handler = this.paperEvents[type][id];
        if (typeof handler.callback == 'function' && (!item || !handler.filter 
          || (item && handler.filter && this.Item.passesFilter(item, handler.filter)))) {
          handler.callback(args, item);
        }
      }
    }
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
      let defaultLayer;
      this.Item.forEachClass({data: attributes}, (itemClass) => {
        if (this.Layers[itemClass.toUpperCase()] != undefined) {
          defaultLayer = this.Layers[itemClass.toUpperCase()];
          return true;
        }
      });
      if (defaultLayer) {
        attributes.Layer = defaultLayer;
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
      if (this.canTrackItem(item)) {
        this.trackItem(item);
      }
      if (item.data.Source && typeof item.data.Source.trackPaperItem == 'function') {
        item.data.Source.trackPaperItem(item);
      }
    }
    this.emit('Generate', {}, item);
    return item;
  }
  canTrackItem(item) {
    let trackable = true;
    this.Item.forEachClass(item, (itemClass, data) => {
      if (data.untrackable.indexOf(itemClass.toLowerCase()) != -1) {
        trackable = false;
        return true;
      }
    }, {untrackable: this.untrackable});
    return trackable;
  }
  trackItem(item) {
    if (item) {
      if (!item.data || !item.data.Class) {
        throw 'Cannot track PaperItem without Class attribute!';
      }
      else if (!this.canTrackItem(item)) {
        throw 'Cannot track PaperItem of untrackable Class!';
      }
      if (!item.data || item.data.Layer == undefined) {
        throw 'Cannot track PaperItem without Layer attribute!';
      }
      this.trackItemByClass(item);
      this.trackItemByLayer(item);
    }
    return item;
  }
  trackItemByClass(item, itemClass) {
    if (item) {
      if (!item.data || !item.data.Class) {
        throw 'Cannot track PaperItem without Class attribute!';
      }
      else if (!this.canTrackItem(item)) {
        throw 'Cannot track PaperItem of untrackable Class!';
      }
      if (itemClass) {
        if (this.paperItems[itemClass].indexOf(item) == -1) {
          this.paperItems[itemClass].push(item);
        }
      }
      else {
        this.Item.forEachClass(item, (itemClass) => {
          if (!this.paperItems[itemClass]) {
            this.paperItems[itemClass] = [];
          }
          if (this.paperItems[itemClass].indexOf(item) == -1) {
            this.paperItems[itemClass].push(item);
          }
        });
      }
    }
    return item;
  }
  trackItemByLayer(item) {
    if (item) {
      if (!this.canTrackItem(item)) {
        throw 'Cannot track PaperItem of untrackable Class!';
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
      this.emit('Destroy', {}, item);
      return item;
    }
  }
  untrackItem(item) {
    if (item) {
      this.untrackItemByClass(item);
      this.untrackItemByLayer(item);
    }
    return item;
  }
  untrackItemByClass(item, itemClass) {
    if (itemClass) {
      let itemIdx = this.paperItems[itemClass].indexOf(item);
      if (itemIdx != -1) {
        this.paperItems[itemClass].splice(itemIdx, 1);
      }
    }
    else {
      this.Item.forEachClass(item, (itemClass) => {
        if (this.paperItems[itemClass]) {
          let itemIdx = this.paperItems[itemClass].indexOf(item);
          if (itemIdx != -1) {
            this.paperItems[itemClass].splice(itemIdx, 1);
          }
        }
      });
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
