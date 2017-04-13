import {default as Component} from '../core/component.js';
import {default as Dock} from './dock.js';
import {default as Mouse} from './mouse.js';
export default class UI extends Component {
	constructor(SL, config, control) {
		super(SL, config);
		
		this.DOM = SL.DOM;
		this.PaperCanvas = control.paper;

		// initialize UI Compontents
		let componentConfig = {
			paperCanvas: this.PaperCanvas
		};
		this.Dock = new Dock(componentConfig);
		this.Mouse = new Mouse(componentConfig);
	}
	get type() {
		return 'UI';
	}
}
