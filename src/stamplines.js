import UI from './ui/ui.js';
import Utils from './util/utils.js';
import ToolBelt from './tools/toolbelt.js';
import * as Palette from './palette/palette.js';
export default class StampLines {
	constructor(config={}) {
		// initialize StampLines core
		this.config = config;
		this.DOM = {
			canvas: (this.config.canvas ? $(this.config.canvas) : undefined)
		};

		// initialize UI
		this.UI = new UI(this, this.config.UI, this.DOM);

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
}
