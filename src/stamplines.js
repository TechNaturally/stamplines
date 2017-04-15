import PaperCanvas from './core/paper-canvas.js';
import UI from './ui/ui.js';
import Utils from './util/utils.js';
import ToolBelt from './tools/toolbelt.js';
import * as Palette from './palette/palette.js';
export default class StampLines {
  constructor(canvas, config=StampLines.defaults.config) {
    this.config = config;
    this.DOM = {
      canvas: canvas
    };
    this._paper = new PaperCanvas(this, { canvas: this.DOM.canvas });
    this.init();
  }
  init() {
    this.initUI();
    this.initTools();
    this.initPalettes();
    this.initUtils();
  }
  initUI() {
    let config = this.config.UI || {};
    this.UI = new UI(this, config, {paper: this._paper});
  }
  initTools() {
    let config = this.config.Tools || {};
    if (!config.enable) {
      config.enable = [];
    }
    for (let enable of StampLines.defaults.coreTools) {
      if (config.enable.indexOf(enable)==-1) {
        config.enable.push(enable);
      }
    }
    this.Tools = new ToolBelt();
    this.Tools.init(this, config);
  }
  initPalettes() {
    let config = this.config.Palettes || {};
    this.Palettes = {
      Stamps: new Palette.Type.StampPalette(this, (config ? config.stamps : undefined)),
      Lines: new Palette.Type.LinePalette(this, (config ? config.lines : undefined))
    };
  }
  initUtils() {
    let config = this.config.Util || {};
    this.Utils = new Utils(this, config);
    this.Utils.enable('Grid');
    for (let id in this.Utils.active) {
      let util = this.Utils.active[id];
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
StampLines.defaults = {
  coreTools: ['Select', 'Rotate', 'Scale'],
  config: {
    Palettes: {
      Lines: {},
      Stamps: {}
    },
    Tools: {
    },
    UI: {
      DOM: {
        useWrapper: true
      },
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
