import Util from '../../core/util.js';
export class Grid extends Util {
	constructor(SL, config) {
		super(SL, config);
		this.name = 'Grid';
		console.log('|--$ NEW [Grid] UTIL');
	}

	activate() {
		console.log('|--* [Grid]->activate()');
	}
	deactivate() {
		console.log('|--* [Grid]->deactivate()');
	}
}
