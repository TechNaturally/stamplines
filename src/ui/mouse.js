import UIComponent from '../core/ui-component.js';
export default class Mouse extends UIComponent {
	constructor(config={}) {
		super(config);
		this.Handles = {
			onMouseEnter: function(event) {
				console.log('Mouse.onMouseEnter =>', event);
			},
			onMouseLeave: function(event) {
				console.log('Mouse.onMouseLeave =>', event);
			},
			onMouseMove: function(event) {
				//console.log('Mouse.onMouseMove =>', event);
			},
			onMouseDown: function(event) {
				console.log('Mouse.onMouseDown =>', event);
			},
			onMouseUp: function(event) {
				console.log('Mouse.onMouseUp =>', event);
			},
			onMouseDrag: function(event) {
				console.log('Mouse.onMouseDrag =>', event);
			},
			onClick: function(event) {
				console.log('Mouse.onClick =>', event);
			},
			onDoubleClick: function(event) {
				console.log('Mouse.onDoubleClick =>', event);
			}
		};
		this.register();
	}
	get type() {
		return "UI.Mouse";
	}
}
