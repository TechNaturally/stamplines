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
        //console.log('PaperCanvas.onResize =>', event);
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
    this.Paper = {};
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
      this.emit('Paper:Activated', {}, this);
    }
  }
  deactivate() {
    if (this.SL.Paper && this.isActive()) {
      this.SL.Paper.activate();
      this.emit('Paper:Deactivated', {}, this);
    }
  }
  isActive () {
    return (paper.project === this.paperProject);
  }
  reset() {
    super.reset();
    this.resetPaper();
    this.resetEventHandlers();
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
      this.canvas.on('resize.stamplines', (event, size) => {
        this.emit('Canvas:Resized', size, this);
      });
    }

    this.initEventHandlers();

    if (!this.config.Paper) {
      this.config.Paper = {};
    }
    if (!this.config.Paper.background) {
      this.config.Paper.background = {};
    }
    this.configurePaper(this.config.Paper);
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
            if (Array.isArray(filter[prop]) && !Array.isArray(item.data[prop])) {
              if (filter[prop].indexOf(item.data[prop]) == -1) {
                result = false;
              }
            }
            else if (item.data[prop] != filter[prop]) {
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
      },
      blockTransform(item, transform) {
        if (transform && item && item.data) {
          if (!item.data.blockedTransforms) {
            item.data.blockedTransforms = [];
          }
          if (item.data.blockedTransforms.indexOf(transform) == -1) {
            item.data.blockedTransforms.push(transform);
          }
        }
      },
      canTransform(item, transform) {
        if (transform && item && item.data && item.data.blockedTransforms) {
          return (item.data.blockedTransforms.indexOf(transform) == -1);
        }
        return true;
      },
      unblockTransform(item, transform) {
        if (transform && item && item.data && item.data.blockedTransforms) {
          let index = item.data.blockedTransforms.indexOf(transform);
          if (index != -1) {
            item.data.blockedTransforms.splice(index, 1);
          }
        }
      }
    };
  }

  on(type, filter, callback, id, priority=10) {
    if (type && typeof callback == 'function') {
      if (!this.paperEvents[type]) {
        this.paperEvents[type] = {};
      }
      if (!this.paperEvents[type][priority]) {
        this.paperEvents[type][priority] = {};
      }
      if (!id) {
        let ID = this.SL.Utils.gets('Identity');
        if (ID) {
          id = ID.getUnique(type, this.paperEvents[type][priority]);
        }
      }
      if (id) {
        if (!this.paperEvents[type][priority][id]) {
          this.paperEvents[type][priority][id] = {
            id: id,
            filter: filter,
            callback: callback,
            priority: priority
          };
        }
        return this.paperEvents[type][priority][id];
      }
    }
  }
  off(type, id, priority=10) {
    if (type && id && this.paperEvents[type] && this.paperEvents[type][priority] && this.paperEvents[type][priority][id]) {
      let handler = this.paperEvents[type][priority][id];
      this.paperEvents[type][priority][id] = undefined;
      delete this.paperEvents[type][priority][id];
      if (Object.keys(this.paperEvents[type][priority]).length == 0) {
        this.paperEvents[type][priority] = undefined;
        delete this.paperEvents[type][priority];
      }
      if (Object.keys(this.paperEvents[type]).length == 0) {
        this.paperEvents[type] = undefined;
        delete this.paperEvents[type];
      }
      return handler;
    }
  }
  emit(type, args, item) {
    if (type && this.paperEvents[type]) {
      let priorities = Object.keys(this.paperEvents[type]).sort();
      for (let priority of priorities) {
        let keys = Object.keys(this.paperEvents[type][priority]);
        for (let id of keys) {
          let handler = this.paperEvents[type][priority][id];
          if (typeof handler.callback == 'function' && (!item || !handler.filter 
            || (item && handler.filter && this.Item.passesFilter(item, handler.filter)))) {
            handler.callback(args, item);
          }
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
    if (item && item.style) {
      item.style.strokeScaling = false;
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
  getPaperLayer(layer, createMissing=true) {
    if (layer && typeof layer == 'string') {
      // map string Layer id to numerical Layer id
      layer = this.Layers[layer];
    }
    if (!this.paperLayers[layer] && createMissing) {
      // assert this paperScope
      let activeProject = paper.project;
      if (this.paperProject && activeProject != this.paperProject) {
        this.paperProject.activate();
      }

      // create the new layer
      this.paperLayers[layer] = new paper.Layer();
      this.sortLayers();

      // flip back active project if different
      if (activeProject && activeProject != this.paperProject) {
        activeProject.activate();
      }
    }
    return this.paperLayers[layer];
  }
  trackItemByLayer(item) {
    if (item) {
      if (!this.canTrackItem(item)) {
        throw 'Cannot track PaperItem of untrackable Class!';
      }
      if (!item.data || item.data.Layer == undefined) {
        throw 'Cannot track PaperItem without Layer attribute!';
      }
      let PaperLayer = this.getPaperLayer(item.data.Layer);
      if (PaperLayer) {
        PaperLayer.appendTop(item);
      }
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

  applyStyle(item, style, cache=true) {
    if (item && style) {
      if (cache) {
        this.cacheStyle(item, style);
      }
      for (var prop in style) {
        item[prop] = style[prop];
      }
    }
  }
  removeStyle(item, style, all=false) {
    this.uncacheStyle(item, style, all);
  }
  stackStyles(item) {
    var stacked = {};
    if (item && item.data && item.data.Styles) {
      for (var style of item.data.Styles) {
        for (var prop in style) {
          stacked[prop] = style[prop];
        }
      }
    }
    return stacked;
  }
  cacheStyle(item, style) {
    if (item && style) {
      if (!item.data) {
        item.data = {};
      }
      if (!item.data.Styles) {
        item.data.Styles = [];
      }
      
      if (!item.data.Styles.length || item.data.Styles[item.data.Styles.length-1] != style) {
        // only cache it if it isn't already the last style in the cache
        item.data.Styles.push(style);
      }
    }
  }
  uncacheStyle(item, style, all=false) {
    if (item && style && item.data && item.data.Styles) {
      let reverseIndex = item.data.Styles.slice().reverse().findIndex(check => {
        if (typeof style == 'string') {
          return (check && check.Class == style);
        }
        return (check == style);
      });
      let styleIndex = ((reverseIndex < 0) ? -1 : (item.data.Styles.length - reverseIndex - 1));
      if (styleIndex != -1) {
        let last = (styleIndex == item.data.Styles.length-1);
        item.data.Styles.splice(styleIndex, 1);
        if (all) {
          // keep removing it as long as it is found
          this.uncacheStyle(item, style, all);
        }
        if (last && item.data.Styles.length) {
          // last style in cache removed, apply the next last style (don't cache it though)
          this.applyStyle(item, this.stackStyles(item), false);
        }
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

  resetContent(args) {
    let resetClasses = (args && args.ContentClasses) || ['Content', 'ContentAddon'];
    let destroyItems = [];
    for (let resetClass of resetClasses) {
      this.SL.Paper.Item.forEachOfClass(resetClass, (item) => {
        if (destroyItems.indexOf(item) == -1) {
          destroyItems.push(item);
        }
      });
    }
    for (let item of destroyItems) {
      this.destroyPaperItem(item);
    }
  }
  hideContent(args) {
    if (args && args === Object(args)) {
      if (!args.hidden) {
        args.hidden = [];
      }
    }
    let exclude = (args && args.exclude) || null;
    let itemClasses = Object.keys(this.paperItems);
    for (let itemClass of itemClasses) {
      if (exclude && exclude.classes && exclude.classes.indexOf(itemClass) != -1) {
        continue;
      }
      for (let item of this.paperItems[itemClass]) {
        if (item) {
          let hasExcludeClass = false;
          if (exclude && exclude.classes && item && item.data.Class && Array.isArray(item.data.Class)) {
            for (let checkClass of item.data.Class) {
              if (exclude.classes.indexOf(checkClass) != -1) {
                hasExcludeClass = true;
                break;
              }
            }
          }
          if (hasExcludeClass || (exclude && exclude.types && item && item.data && item.data.Type && exclude.types.indexOf(item.data.Type) != -1)) {
            continue;
          }
          item.visible = false;
          if (args && args.hidden && args.hidden.indexOf(item) == -1) {
            args.hidden.push(item);
          }
        }
      }
    }
  }
  unhideContent(args) {
    if (args && Array.isArray(args.hidden)) {
      for (let item of args.hidden) {
        if (item) {
          item.visible = true;
        }
      }
      args.hidden.length = 0;
    }
  }
  refreshBackground() {
    if (this.Paper.background) {
      let view = this.view || paper.view;
      let width = view.size.width || 0;
      let height = view.size.height || 0;
      this.Paper.background.bounds.set(0, 0, width, height);
    }
  }

  initEventHandlers() {
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    if (!this.eventHandlers.ContentReset) {
      this.eventHandlers.ContentReset = this.on('Content.Reset', undefined, (args, item) => {
        this.resetContent(args);
      }, 'Paper.Content.Reset');
    }
    if (!this.eventHandlers.ContentHide) {
      this.eventHandlers.ContentHide = this.on('Content.Hide', undefined, (args, item) => {
        this.hideContent(args);
      }, 'Paper.Content.Hide');
    }
    if (!this.eventHandlers.ContentUnhide) {
      this.eventHandlers.ContentUnhide = this.on('Content.Unhide', undefined, (args, item) => {
        this.unhideContent(args);
      }, 'Paper.Content.Unhide');
    }
    if (!this.eventHandlers.ViewTransformed) {
      this.eventHandlers.ViewTransformed = this.on('View.Transformed', undefined, (args, view) => {
        if (view == this.view) {
          this.refreshBackground();
        }
      }, 'Paper.View.Transformed');
    }
  }
  resetEventHandlers() {
    if (!this.eventHandlers) {
      return;
    }
    if (this.eventHandlers.ContentReset) {
      this.off('Content.Reset', this.eventHandlers.ContentReset.id);
      delete this.eventHandlers.ContentReset;
      this.eventHandlers.ContentReset = undefined;
    }
    if (this.eventHandlers.ContentHide) {
      this.off('Content.Hide', this.eventHandlers.ContentHide.id);
      delete this.eventHandlers.ContentHide;
      this.eventHandlers.ContentHide = undefined;
    }
    if (this.eventHandlers.ContentUnhide) {
      this.off('Content.Unhide', this.eventHandlers.ContentUnhide.id);
      delete this.eventHandlers.ContentUnhide;
      this.eventHandlers.ContentUnhide = undefined;
    }
    if (this.eventHandlers.ViewTransformed) {
      this.off('View.Transformed', this.eventHandlers.ViewTransformed.id);
      delete this.eventHandlers.ViewTransformed;
      this.eventHandlers.ViewTransformed = undefined;
    }
  }

  configurePaper(config) {
    config = config || this.config.Paper;
    if (config.background && config.background.style) {
      if (!this.Paper.background) {
        let view = this.view || paper.view;
        let width = view.size.width || 0;
        let height = view.size.height || 0;
        this.Paper.background = this.generatePaperItem({Class:'BG', Layer:'BG'}, paper.Shape.Rectangle, new paper.Rectangle(0, 0, width, height));
      }
      this.removeStyle(this.Paper.background, 'config', true);
      this.applyStyle(this.Paper.background, $.extend({}, config.background.style, {Class: 'config'}), true);
    }
    else {
      this.resetPaperBackground();
    }
  }
  resetPaper() {
    this.resetPaperBackground();
  }
  resetPaperBackground() {
    if (this.Paper.background) {
      this.destroyPaperItem(this.Paper.background);
      this.Paper.background = undefined;
    }
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
