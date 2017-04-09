import Component from './component.js';
export default class Palette extends Component {
	constructor(SL, config) {
		super(SL, config);
	}
	get type() {
		return 'Palette';
	}
}
