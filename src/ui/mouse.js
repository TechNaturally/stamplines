import UIComponent from '../core/ui-component.js';
export default class Mouse extends UIComponent {
  constructor(SL, config, UI) {
    super(SL, config, UI);
    var State = this.State = {
      active: false,
      lastMove: null,
      point: new paper.Point(0, 0),
      button: {
        last: null,
        active: null,
        downAt: null,
        drag: null
      }
    };
    this.Handles = {
      config: config,
      State: State,
      onMouseEnter(event) {
        this.State.active = true;
      },
      onMouseLeave: function(event) {
        this.State.active = false;
      },
      onMouseMove: function(event) {
        this.State.lastMove = event;
        this.State.point.set(event.point);
      },
      onMouseDown: function(event) {
        this.State.button.active = event.event.button;
        this.State.button.downAt = event.point;
      },
      onMouseUp: function(event) {
        setTimeout(() => {
          this.State.button.last = ((this.State.button.active || this.State.button.active===0) ? this.State.button.active : null);
          this.State.button.active = null;
          this.State.button.downAt = null;
          this.State.button.drag = null;
        }, 0);
      },
      onMouseDrag: function(event) {
        this.State.point.set(event.point);

        if (!this.State.button.drag) {
          this.State.button.drag = {
            points: [ this.State.button.downAt ]
          };
        }
        this.State.button.drag.points.push(event.point);

        if (this.config && (this.config.maxDragPoints || this.config.maxDragPoints===0)) {
          if (this.State.button.drag.points.length > this.config.maxDragPoints) {
            this.State.button.drag.points.splice(0, (this.State.button.drag.points.length-this.config.maxDragPoints));
          }
        }
      },
      onClick: function(event) {},
      onDoubleClick: function(event) {
        console.log('Mouse.onDoubleClick =>', event);
      }
    };
    this.register();
    this.configure();
  }
  get type() {
    return 'UI.Mouse';
  }
}
