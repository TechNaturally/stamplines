import PaperCanvas from './core/paper-canvas.js';
import UI from './ui/ui.js';
import Utils from './util/utils.js';
import ToolBelt from './tools/toolbelt.js';
import * as Palette from './palette/palette.js';
export default class StampLines {
	constructor(canvas, config=StampLines.defaults.config) {
		// initialize StampLines core
		this.config = config;
		this.DOM = {
			canvas: canvas
		};

		this._paper = new PaperCanvas(this, { canvas: this.DOM.canvas });

		// initialize UI
		this.UI = new UI(this, this.config.UI, {paper: this._paper});

		// initialize Tools
		this.Tools = new ToolBelt();
		this.Tools.init(this, this.config.tools);
		this.Tools.enable(['Select', 'Rotate', 'Scale']);

		// initialize Palettes
		let paletteConfig = (this.config && this.config.palettes);
		this.Palettes = {
			Stamps: new Palette.Type.StampPalette(this, (paletteConfig ? paletteConfig.stamps : undefined)),
			Lines: new Palette.Type.LinePalette(this, (paletteConfig ? paletteConfig.lines : undefined))
		};

		// initialize Utils
		this.Utils = new Utils(this, this.config.Util);
		this.Utils.enable('Grid');
		for (let id in this.Utils.active) {
			let util = this.Utils.active[id];
		}
	}

	get canvas() {
		if (!this.DOM.canvas) {
			throw "StampLines does not have a canvas!";
		}
		return this.DOM.canvas;
	}

	get Paper() {
		if (!this._paper || !this._paper.view) {
			throw "StampLines has not been initialized with Paper.js!";
		}
		return this._paper;
	}
}
StampLines.defaults = {
	config: {
		Util: {
		  grid: {
		    size: 25
		  }
		}
	}
};
