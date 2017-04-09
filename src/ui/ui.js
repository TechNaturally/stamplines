import Component from '../core/component.js';
import Dock from './dock.js';
import Mouse from './mouse.js';
export default class UI extends Component {
	constructor(SL, config, DOM={}) {
		super(SL, config);
		
		this.DOM = DOM;
		this.Dock = new Dock();
		this.Mouse = new Mouse();
	}
	get type() {
		return 'UI';
	}
}
