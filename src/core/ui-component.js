export default class UIComponent {
	constructor(config={}) {
		this.config = config;
	}
	get type() {
		return "UI.Component";
	}

	register() {
		let paperCanvas = this.config.paperCanvas;
		if (this.Handles && paperCanvas) {
			paperCanvas.registerHandlers(this.Handles);
		}
	}
}
