import Util from '../../core/util.js';
export class Layout extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'Layout';
    this.eventHandlers = {};
    this.state = {
      size: 'default'
    };
    this.initialized = true;
    this.configure();
  }

  configure(config) {
    config = super.configure(config);

    if (!config.sizes) {
      config.sizes = {};
    }
    if (!config.sizes.default) {
      config.sizes.default = {};
    }
    if (config.sizes.default.width != 'auto' && (isNaN(config.sizes.default.width) || config.sizes.default.width < 0)) {
      config.sizes.default.width = 'auto';
    }
    if (config.sizes.default.height != 'auto' && (isNaN(config.sizes.default.height) || config.sizes.default.height < 0)) {
      config.sizes.default.height = 'auto';
    }
    if (!config.sizes.default.orientations) {
      config.sizes.default.orientations = ['portrait', 'landscape'];
    }

    this.initEventHandlers();
    this.applyConfig();

    return config;
  }
  reset() {
    if (!this.initialized) {
      return;
    }
    super.reset();
    this.resetEventHandlers();
  }
  applyConfig() {
    this.setSize();
  }
  exportConfig(into, args) {
    into.Layout = {
      config: $.extend(true, {}, this.config),
      state: $.extend(true, {}, this.state)
    };
    return into.Layout;
  }
  importConfig(from, args) {
    if (from && from.Layout) {
      if (from.Layout.config) {
        this.configure(from.Layout.config);
      }
      if (from.Layout.state) {
        if (from.Layout.state.dimensions) {
          this.resizeCanvas(from.Layout.state.dimensions.width, from.Layout.state.dimensions.height);
        }
        if (from.Layout.state.size) {
          this.setSize(from.Layout.state.size);
        }
        if (from.Layout.state.orientation) {
          this.setOrientation(from.Layout.state.orientation);
        }
      }
    }
  }

  getDimensions() {
    let canvas = this.SL.DOM.canvas;
    return {
      width: (this.state.size.hasOwnProperty('width') && this.state.size.width != 'auto') ? this.state.size.width : $(canvas).width(),
      height: (this.state.size.hasOwnProperty('height') && this.state.size.height != 'auto') ? this.state.size.height : $(canvas).height()
    };
  }
  getOrientation() {
    return (this.state.orientation);
  }
  getOrientations() {
    return (typeof this.state.size === 'object' && this.state.size && this.state.size.orientations) || [];
  }

  resizeCanvas(width, height) {
    let canvas = this.SL.DOM.canvas;
    let dimensions = this.getDimensions();
    if ((!width && width !== 0) || width < 0) {
      width = dimensions.width;
    }
    if ((!height && height !== 0) || height < 0) {
      height = dimensions.height;
    }
    let view = this.SL.Paper.view;
    let scaleH = (width / view.viewSize.width);
    let scaleV = (height / view.viewSize.height);
    $(canvas).css({ width: `${width}px`, height: `${height}px` });
    view.viewSize.set(width, height);
    this.SL.Paper.emit('View.Transformed', {}, view);
  }

  setSize(size) {
    let sizes = this.config.sizes;
    if (!size) {
      size = this.state.size;
    }
    if (typeof size === 'string') {
      if (sizes.hasOwnProperty(size)) {
        size = sizes[size];
      }
      else {
        throw `Layout does not recognize size: ${size}`;
      }
    }
    if (typeof size !== 'object') {
      throw `Invalid size of type: ${typeof size}`;
    }
    this.state.size = size;

    let dimensions = this.getDimensions();
    this.state.dimensions = dimensions;
    if (this.state.size.orientations) {
      if (this.state.size.orientations.includes('portrait') && dimensions.width <= dimensions.height) {
        this.state.orientation = 'portrait';
      }
      else if (this.state.size.orientations.includes('landscape') && dimensions.width > dimensions.height) {
        this.state.orientation = 'landscape';
      }
    }
    this.resizeCanvas();
  }
  setOrientation(orientation) {
    if (!orientation) {
      if (this.state.orientation) {
        orientation = this.state.orientation;
      }
      else if (this.state.size.orientations && this.state.size.orientations.length) {
        orientation = this.state.size.orientations[0];
      }
      else {
        return;
      }
    }
    let size = this.getDimensions();
    let width = size.width;
    let height = size.height;
    if (typeof orientation === 'string') {
      let dimensions = [ width, height ];
      if (orientation == 'portrait') {
        width = Math.min(...dimensions);
        height = Math.max(...dimensions);
      }
      else if (orientation == 'landscape') {
        width = Math.max(...dimensions);
        height = Math.min(...dimensions);
      }
    }
    else if (typeof orientation === 'object') {
      if (orientation.hasOwnProperty('width')) {
        if (orientation.width != 'auto') {
          width = orientation.width;
        }
      }
      if (orientation.hasOwnProperty('height')) {
        if (orientation.height != 'auto') {
          height = orientation.height;
        }
      }
    }
    this.state.orientation = orientation;
    this.resizeCanvas(width, height);
  }

  initEventHandlers() {
    if (!this.initialized) {
      return;
    }
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    if (!this.eventHandlers.PaperActivated) {
      this.eventHandlers.PaperActivated = this.SL.Paper.on('Paper:Activated', undefined, (args, paper) => {
        if (paper == this.SL.Paper) {
          this.setSize();
        }
      }, 'Layout.PaperActivated');
    }
    if (!this.eventHandlers.CanvasResized) {
      this.eventHandlers.CanvasResized = this.SL.Paper.on('Canvas:Resized', undefined, (args, paper) => {
        console.log('Layout CanvasResized', args, paper, this.SL.Paper, (paper === this.SL.Paper));
        if (paper == this.SL.Paper) {
          this.setSize();
        }
      }, 'Layout.CanvasResized');
    }
    if (!this.eventHandlers.ConfigExport) {
      this.eventHandlers.ConfigExport = this.SL.Paper.on('Config.Export', undefined, (args, into) => {
        this.exportConfig(into || args.into, args);
      }, 'Layout.ConfigExport');
    }
    if (!this.eventHandlers.ConfigImport) {
      this.eventHandlers.ConfigImport = this.SL.Paper.on('Config.Import', undefined, (args, from) => {
        this.importConfig(from, args);
      }, 'Layout.ConfigImport');
    }
  }
  resetEventHandlers() {
    if (!this.initialized || !this.eventHandlers) {
      return;
    }
    if (this.eventHandlers.PaperActivated) {
      this.SL.Paper.off('Paper:Activated', this.eventHandlers.PaperActivated.id);
      delete this.eventHandlers.PaperActivated;
      this.eventHandlers.PaperActivated = undefined;
    }
    if (this.eventHandlers.CanvasResized) {
      this.SL.Paper.off('Canvas:Resized', this.eventHandlers.CanvasResized.id);
      delete this.eventHandlers.CanvasResized;
      this.eventHandlers.CanvasResized = undefined;
    }
    if (this.eventHandlers.ConfigExport) {
      this.SL.Paper.off('Config.Export', this.eventHandlers.ConfigExport.id);
      delete this.eventHandlers.ConfigExport;
      this.eventHandlers.ConfigExport = undefined;
    }
    if (this.eventHandlers.ConfigImport) {
      this.SL.Paper.off('Config.Import', this.eventHandlers.ConfigImport.id);
      delete this.eventHandlers.ConfigImport;
      this.eventHandlers.ConfigImport = undefined;
    }
  }
}
