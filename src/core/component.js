export default class Component {	
	constructor(SL, config) {
		this.SL = SL;
		this.config = config;
		console.log('|-$ NEW ['+this.type+'] COMPONENT');
	}
	get type() {
		return 'Component';
	}
}
