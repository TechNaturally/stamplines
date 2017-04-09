import UI from './ui/ui.js';
import Utils from './util/utils.js';
import ToolBelt from './tools/toolbelt.js';
import * as Palette from './palette/palette.js';
export default class {
	constructor(config={}) {
		this.config = config;

		this.DOM = {
			canvas: (this.config.canvas ? $(this.config.canvas) : undefined)
		};

		console.log("-------");
		this.UI = new UI(this, this.config.UI, this.DOM);
		console.log('| Check UI ['+this.UI.type+'] ['+(typeof this.UI)+'] ['+this.UI.constructor.name+'] =>', this.UI);
		console.log("-------");

		this.Tools = new ToolBelt();
		this.Tools.init(this, this.config.tools);
		this.Tools.enable(['Select', 'Rotate', 'Scale']);
		console.log("|");

		console.log('| CHECK Tools => ', this.Tools);
		for (let name in this.Tools.Belt) {
			let tool = this.Tools.Belt[name];
			console.log('| Tool "'+name+'" ['+tool.type+'] ['+(typeof tool)+'] ['+tool.constructor.name+'] =>', tool);
		}
		console.log("-------");

		console.log('| CHECK Palette => ['+Palette.type+'] ['+(typeof Palette)+'] ['+Palette.constructor.name+'] =>', Palette);
		let paletteConfig = (this.config && this.config.palettes);
		this.Palettes = {
			Stamps: new Palette.Type.StampPalette(this, (paletteConfig ? paletteConfig.stamps : undefined)),
			Lines: new Palette.Type.LinePalette(this, (paletteConfig ? paletteConfig.lines : undefined))
		};
		console.log('| Stamps ['+this.Palettes.Stamps.type+'] ['+(typeof this.Palettes.Stamps)+'] ['+this.Palettes.Stamps.constructor.name+'] =>', this.Palettes.Stamps);
		console.log('| Lines ['+this.Palettes.Lines.type+'] ['+(typeof this.Palettes.Lines)+'] ['+this.Palettes.Lines.constructor.name+'] =>', this.Palettes.Lines);
		console.log("-------");

		this.Utils = new Utils(this, this.config.Util);
		console.log('| Check Utils ['+this.Utils.type+'] ['+(typeof this.Utils)+'] ['+this.Utils.constructor.name+'] =>', this.Utils);
		this.Utils.enable('Grid');
		console.log("|");
		for (let id in this.Utils.active) {
			let util = this.Utils.active[id];
			console.log('| Util "'+id+'"/"'+util.name+'" ['+util.type+'] ['+(typeof util)+'] ['+util.constructor.name+'] =>', util);
		}
		console.log("-------");


	}
}
