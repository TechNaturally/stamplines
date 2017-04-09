import Component from './component.js';
export default class Tool extends Component {
	constructor(SL, config) {
		super(SL, config);
	}
	get type() {
		return 'Tool';
	}
	get name() {
		return this._name;
	}
	set name(name) {
		this._name = name;
	}
}
