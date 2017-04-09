import Component from '../core/component.js';
export default class Util extends Component {
	constructor(SL, config) {
		super(SL, config);
	}
	get type() {
		return 'Util';
	}
	get name() {
		return this._name;
	}
	set name(name) {
		this._name = name;
	}
}
