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
        canvas: canvas
      };
      this._paper = new PaperCanvas(this, { canvas: this.DOM.canvas });
      this.init();
    }
  }
  init() {
    this.reset();
    this.initUI();
    this.initTools();
    this.initPalettes();
    this.initUtils();
  }
  reset() {
    this.resetUtils();
    this.resetPalettes();
    this.resetTools();
    this.resetUI();
  }
  initUI() {
    let config = this.config.UI || {};
    this.UI = new UI(this, config, {paper: this._paper});
  }
  resetUI() {

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
    this.Tools = new ToolBelt();
    this.Tools.init(this, config);
  }
  resetTools() {

  }
  initPalettes() {
    let config = this.config.Palettes || {};
    this.Palettes = {};
    for (let palette in StampLines.Palette.Type) {
      let Palette = StampLines.Palette.Type[palette];
      let paletteConfig = config[palette] || {};
      this.Palettes[palette] = new Palette(this, paletteConfig);
    }
  }
  resetPalettes() {

  }
  initUtils() {
    let config = this.config.Util || {};
    this.Utils = new Utils(this, config);
  }
  resetUtils() {
    if (this.Utils) {
      this.Utils.disable();
    }
  }

  loadConfig(source) {
    if (source) {
      let RemoteLoader = this.Utils.gets('RemoteLoader', {path: source});
      return RemoteLoader.load()
        .then((config) => {
          console.log('Remote Config loaded...', config);
          config = $.extend({}, StampLines.DEFAULT.config, config);
          this.init();
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
  coreTools: ['Select', 'Rotate', 'Scale'],
  config: {
    Palettes: {
      Lines: {},
      Stamps: {}
    },
    Tools: {
      enable: ['Select', 'Rotate', 'Scale']
    },
    UI: {
      DOM: {
        useWrapper: true
      },
      Dock: {},
      Mouse: {
        maxDragPoints: 3
      }
    },
    Util: {
      grid: {
        size: 25
      }
    }
  }
};
