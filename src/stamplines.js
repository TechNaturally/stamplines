import PaperCanvas from './core/paper-canvas.js';
import UI from './ui/ui.js';
import Utils from './util/utils.js';
import ToolBelt from './tools/toolbelt.js';
import * as Palette from './palette/palette.js';
export default class StampLines {
  constructor(canvas, config=StampLines.DEFAULT.config) {
    this.config = config;
    if (this.config) {
      this.DOM = {
        canvas: $(canvas)
      };
      this._paper = new PaperCanvas(this, { canvas: this.DOM.canvas });
      this.init();
    }
  }
  destroy() {
    this.deactivate();
    this.reset();
  }
  init() {
    this.reset();
    this.initUtils();
    this.initUI();
    this.initTools();
    this.initPalettes();
  }
  reset() {
    this.resetPalettes();
    this.resetTools();
    this.resetUI();
    this.resetUtils();
  }
  initUtils() {
    let config = this.config.Utils || {};
    this.Utils = new Utils(this, config);
    this.Utils.configure();
  }
  resetUtils() {
    if (this.Utils) {
      this.Utils.disable('*');
    }
  }
  initUI() {
    let config = this.config.UI || {};
    this.UI = new UI(this, config, {paper: this._paper});
  }
  resetUI() {
    if (this.UI) {
      this.UI.destroy();
      this.UI = undefined;
    }
  }
  initTools() {
    let config = this.config.Tools || {};
    if (!config.enable) {
      config.enable = [];
    }
    for (let enable of StampLines.DEFAULT.coreTools) {
      if (config.enable.indexOf(enable)==-1) {
        config.enable.push(enable);
      }
    }
    this.Tools = new ToolBelt(this, config);
  }
  resetTools() {
    if (this.Tools) {
      this.Tools.destroy();
    }
    this.Tools = undefined;
  }
  initPalettes() {
    let config = this.config.Palettes || {};
    this.Palettes = new Palette.Manager(this, config);
  }
  resetPalettes() {
    if (this.Palettes) {
      this.Palettes.removePalette('*');
    }
  }

  activate() {
    if (StampLines.ACTIVE && StampLines.ACTIVE != this) {
      StampLines.ACTIVE.deactivate();
    }
    if (this.Paper) {
      this.Paper.activate();
    }
    if (this.UI) {
      this.UI.activate();
    }
    StampLines.ACTIVE = this;
  }
  deactivate() {
    if (StampLines.ACTIVE===this) {
      StampLines.ACTIVE = undefined;
    }
    if (this.UI) {
      this.UI.deactivate();
    }
  }
  isActive() {
    return !!(StampLines.ACTIVE===this);
  }

  loadConfig(source) {
    if (source) {
      let RemoteLoader = this.Utils.gets('RemoteLoader', {path: source});
      return RemoteLoader.load()
        .then((config) => {
          this.config = $.extend({}, StampLines.DEFAULT.config, config);
          this.init();
          return config;
        });
    }
  }

  get canvas() {
    if (!this.DOM.canvas) {
      throw 'StampLines does not have a canvas!';
    }
    return this.DOM.canvas;
  }

  get Paper() {
    if (!this._paper || !this._paper.view) {
      throw 'StampLines has not been initialized with Paper.js!';
    }
    return this._paper;
  }
}
StampLines.Palette = Palette;
StampLines.DEFAULT = {
  coreTools: ['Select', 'Move', 'Rotate', 'Scale'],
  config: {
    Palettes: {
      Lines: {},
      Stamps: {}
    },
    Tools: {
      enable: ['Select', 'Move', 'Rotate', 'Scale', 'CreateLine', 'EditLine', 'CreateStamp'],
      Rotate: {
        slices: (360/45),
        snap: true
      },
      Scale: {
        minSize: {
          width: 40,
          height: 40
        }
      }
    },
    UI: {
      DOM: {
        useWrapper: true
      },
      Dock: {},
      Keyboard: {},
      Mouse: {
        maxDragPoints: 3,
        Cursors: {
          custom: {
            'plus': {icon:'plus'},
            'minus': {icon:'minus'},
            'rotate': {icon:'rotate-right'},
            'move': {icon:'arrows'},
            'expand-nesw': {icon:'expand'},
            'expand-senw': {icon:'expand flip-horizontal'},
            'expand-ns': {icon:'arrows-v'},
            'expand-ew': {icon:'arrows-h'},
            'link': {icon:'link'},
            'unlink': {icon:'unlink'},
            'crosshairs': {icon:'crosshairs'}
          }
        }
      }
    },
    Utils: {
      Snap: {},
      Bounds: {},
      Geo: {},
      Grid: {
        size: 20,
        strong: 4,
        style: {
          strokeWidth: 0.5,
          strokeColor: (2.0/3.0),
          opacity: 0.25
        },
        strongStyle: {
          strokeWidth: 1.0,
          opacity: 0.3
        }
      }
    }
  }
};
