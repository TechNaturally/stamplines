import Util from '../../core/util.js';
export class Zoom extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'Zoom';
    this.eventHandlers = {};
    this.initialized = true;
    this.configure();
  }

  configure(config) {
    config = super.configure(config);
    if (!config.scale) {
      config.scale = 1.0;
    }
    if (!config.zoom) {
      config.zoom = 1.0;
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
  exportConfig(into, args) {
    into.Zoom = $.extend(true, {}, this.config);
    return into.Zoom;
  }
  importConfig(from, args) {
    if (from && from.Zoom) {
      this.configure(from.Zoom);
    }
  }

  positionView(args) {
    if (this.SL.Paper && this.SL.Paper.view) {
      let delta = this.SL.Paper.view.viewToProject(new paper.Point(0, 0));
      let eventArgs = {};
      this.SL.Paper.view.translate(delta);
      if (args && args.temporary) {
        eventArgs.temporary = true;
      }
      this.SL.Paper.emit('View.Transformed', eventArgs, this.SL.Paper.view);
    }
  }

  getFitSize() {
    let fitSize = ((this.config.fit && (typeof this.config.fit.width != 'undefined' || typeof this.config.fit.height != 'undefined')) ? this.config.fit : undefined);
    if (fitSize) {
      fitSize = $.extend(true, {}, fitSize);
      let Layout = this.SL.Utils.get('Layout');
      if (Layout) {
        let shouldLandscape = (Layout.getOrientation() == 'landscape');
        let swapDimensions = false;
        if (shouldLandscape && typeof fitSize.width != 'undefined' && (typeof fitSize.height == 'undefined' || fitSize.height > fitSize.width)) {
          swapDimensions = true;
        }
        else if (!shouldLandscape && typeof fitSize.width != 'undefined' && typeof fitSize.height != 'undefined' && fitSize.width > fitSize.height) {
          swapDimensions = true;
        }
        if (swapDimensions) {
          let tmpHeight = fitSize.height;
          fitSize.height = fitSize.width;
          fitSize.width = tmpHeight;
        }
      }
    }
    return fitSize;
  }
  fitToSize(width, height, args) {
    if (this.SL.Paper && this.SL.Paper.canvas && this.SL.Paper.canvas.length) {
      let canvas = this.SL.Paper.canvas[0];
      let scales = [];
      if (width) {
        scales.push(canvas.width / width);
      }
      if (height) {
        scales.push(canvas.height / height);
      }
      let scale = Math.min(...scales);
      if (scale) {
        this.applyZoom(scale, args);
      }
    }
  }

  applyConfig(args) {
    let fitSize = this.getFitSize();
    if (fitSize) {
      this.fitToSize(fitSize.width, fitSize.height, args);
    }
    else {
      this.applyZoom(undefined, args);
    }
  }
  applyScale(scale, args) {
    if (typeof scale == 'undefined') {
      scale = this.config.scale;
    }
    if (this.SL.Paper && this.SL.Paper.view && this.SL.Paper.canvas && this.SL.Paper.canvas.length) {
      let canvas = this.SL.Paper.canvas[0];
      this.SL.Paper.view.size.set(canvas.width * scale, canvas.height * scale);      
      this.positionView(args);
    }
  }
  applyZoom(zoom, args) {
    if (typeof zoom == 'undefined') {
      zoom = this.config.zoom;
    }
    if (this.SL.Paper && this.SL.Paper.view && this.SL.Paper.canvas && this.SL.Paper.canvas.length) {
      this.SL.Paper.view.zoom = zoom;
      this.positionView(args);
    }
  }

  naturalizeCanvas(args) {
    if (this.SL.Paper && this.SL.Paper.view && this.SL.Paper.canvas && this.SL.Paper.canvas.length) {
      let view = this.SL.Paper.view;
      let canvas = this.SL.Paper.canvas[0];
      let size = view.size;
      let zoom = view.zoom;
      if (zoom != 1.0) {
        let scale = 1.0 / zoom;
        view.zoom = 1.0;
        view.viewSize.set(view.viewSize.width * scale, view.viewSize.height * scale);
        if (args && args.denaturalize) {
          args.denaturalize.push(() => {
            view.viewSize.set(view.viewSize.width / scale, view.viewSize.height / scale);
            this.applyConfig(args);
          });
        }
        this.positionView(args);
      }
    }
  }
  denaturalizeCanvas(args) {
    if (args && args.denaturalize) {
      for (let denaturalize of args.denaturalize) {
        if (denaturalize && typeof denaturalize == 'function') {
          denaturalize();
        }
      }
      denaturalize.length = 0;
    }
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
          this.applyZoom();
        }
      }, 'Zoom.PaperActivated');
    }
    if (!this.eventHandlers.CanvasNaturalize) {
      this.eventHandlers.CanvasNaturalize = this.SL.Paper.on('Canvas.Naturalize', undefined, (args, item) => {
        this.naturalizeCanvas(args);
      }, 'Zoom.CanvasNaturalize');
    }
    if (!this.eventHandlers.CanvasDenaturalize) {
      this.eventHandlers.CanvasDenaturalize = this.SL.Paper.on('Canvas.Denaturalize', undefined, (args, item) => {
        this.denaturalizeCanvas(args);
      }, 'Zoom.CanvasDenaturalize');
    }
    if (!this.eventHandlers.ConfigExport) {
      this.eventHandlers.ConfigExport = this.SL.Paper.on('Config.Export', undefined, (args, into) => {
        this.exportConfig(into || args.into, args);
      }, 'Zoom.ConfigExport');
    }
    if (!this.eventHandlers.ConfigImport) {
      this.eventHandlers.ConfigImport = this.SL.Paper.on('Config.Import', undefined, (args, from) => {
        this.importConfig(from, args);
      }, 'Zoom.ConfigImport');
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
    if (this.eventHandlers.CanvasNaturalize) {
      this.SL.Paper.off('Canvas.Naturalize', this.eventHandlers.CanvasNaturalize.id);
      delete this.eventHandlers.CanvasNaturalize;
      this.eventHandlers.CanvasNaturalize = undefined;
    }
    if (this.eventHandlers.CanvasDenaturalize) {
      this.SL.Paper.off('Canvas.Denaturalize', this.eventHandlers.CanvasDenaturalize.id);
      delete this.eventHandlers.CanvasDenaturalize;
      this.eventHandlers.CanvasDenaturalize = undefined;
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
