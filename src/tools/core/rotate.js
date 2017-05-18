import Tool from '../../core/tool.js';
export class Rotate extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.UI = {};
    this.State = {
      rotation: -90.0,
      Mouse: {
        Hover: {}
      }
    };
    this.initCalc();
    this.initialized = true;
  }
  initCalc() {
    this.Calc = {
      degDenormalize: function(angle) {
        return angle + 90.0;
      },
      degNormalize: function(angle) {
        return angle - 90.0;
      },
      degToRad: function(angle) {
        return angle * (Math.PI / 180.0);
      },
      pointOnCircle: function(angle, center, radius) {
        let point = new paper.Point(center);
        angle = this.degToRad(angle);
        return point.add({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        });
      }
    };
  }
  configure(config) {
    config = super.configure(config);
    if (!config.ui) {
      config.ui = {};
    }
    if (config.ui.color == undefined) {
      config.ui.color = '#FF9933';
    }
    if (config.ui.color2 == undefined) {
      config.ui.color2 = '#990000';
    }
    if (!config.ui.circle) {
      config.ui.circle = {};
    }
    if (config.ui.circle.strokeWidth == undefined) {
      config.ui.circle.strokeWidth = 1;
    }
    if (config.ui.circle.strokeColor == undefined) {
      config.ui.circle.strokeColor = config.ui.color;
    }
    if (config.ui.circle.opacity == undefined) {
      config.ui.circle.opacity = 0.6;
    }
    if (!config.ui.circleActive) {
      config.ui.circleActive = {};
    }
    if (config.ui.circleActive.strokeWidth == undefined) {
      config.ui.circleActive.strokeWidth = 2;
    }
    if (config.ui.circleActive.strokeColor == undefined) {
      config.ui.circleActive.strokeColor = config.ui.circle.strokeColor;
    }
    if (config.ui.circleActive.opacity == undefined) {
      config.ui.circleActive.opacity = config.ui.circle.opacity;
    }
    if (!config.ui.handle) {
      config.ui.handle = {};
    }
    if (config.ui.handle.size == undefined) {
      config.ui.handle.size = 8;
    }
    if (config.ui.handle.strokeWidth == undefined) {
      config.ui.handle.strokeWidth = 1;
    }
    if (config.ui.handle.strokeColor == undefined) {
      config.ui.handle.strokeColor = config.ui.color2;
    }
    if (config.ui.handle.fillColor == undefined) {
      config.ui.handle.fillColor = config.ui.handle.strokeColor;
    }
    if (config.ui.handle.opacity == undefined) {
      config.ui.handle.opacity = 1.0;
    }
    if (!config.ui.current) {
      config.ui.current = {};
    }
    if (config.ui.current.strokeWidth == undefined) {
      config.ui.current.strokeWidth = 1;
    }
    if (config.ui.current.strokeColor == undefined) {
      config.ui.current.strokeColor = config.ui.handle.strokeColor;
    }
    if (config.ui.current.opacity == undefined) {
      config.ui.current.opacity = config.ui.handle.opacity;
    }
    if (!config.ui.slices) {
      config.ui.slices = {};
    }
    if (config.ui.slices.opacity == undefined) {
      config.ui.slices.opacity = 0.5;
    }
    if (config.ui.slices.hideCircle == undefined) {
      config.ui.slices.hideCircle = true;
    }
    if (config.ui.slices.circles == undefined || config.ui.slices.circles === true) {
      config.ui.slices.circles = {};
    }
    if (config.ui.slices.circles) {
      if (config.ui.slices.circles.distance == undefined) {
        config.ui.slices.circles.distance = 1.0;
      }
      if (config.ui.slices.circles.size == undefined) {
        config.ui.slices.circles.size = 6;
      }
      if (config.ui.slices.circles.strokeWidth == undefined) {
        config.ui.slices.circles.strokeWidth = 1;
      }
      if (config.ui.slices.circles.strokeColor == undefined) {
        config.ui.slices.circles.strokeColor = config.ui.circle.strokeColor;
      }
      if (config.ui.slices.circles.opacity == undefined) {
        config.ui.slices.circles.opacity = config.ui.slices.opacity;
      }
    }
    if (config.ui.slices.lines == undefined || config.ui.slices.lines === true) {
      config.ui.slices.lines = {};
    }
    if (config.ui.slices.lines) {
      if (config.ui.slices.lines.distance == undefined) {
        config.ui.slices.lines.distance = 1.0;
      }
      if (config.ui.slices.lines.strokeWidth == undefined) {
        config.ui.slices.lines.strokeWidth = 1;
      }
      if (config.ui.slices.lines.strokeColor == undefined) {
        config.ui.slices.lines.strokeColor = config.ui.circle.strokeColor;
      }
      if (config.ui.slices.lines.opacity == undefined) {
        config.ui.slices.lines.opacity = config.ui.slices.opacity;
      }
    }
    return config;
  }
  reset() {
    if (!this.initialized) {
      return;
    }
    super.reset();
    this.resetState();
    this.resetUI();
  }
  resetState() {
    this.State.rotation = this.Calc.degNormalize(0);
    for (let prop of Object.keys(this.State.Mouse.Hover)) {
      this.State.Mouse.Hover[prop] = undefined;
      delete this.State.Mouse.Hover[prop];
    }
    this.State.Mouse.Dragging = false;
  }
  get activationPriority() {
    if (this.State.Mouse.Hover.ui) {
      return 50;
    }
    return -1;
  }
  get currentAngle() {
    return (this.State.rotation || this.State.rotation === 0) ? this.State.rotation : -90.0;
  }
  get currentAngleRad() {
    return this.Calc.degToRad(this.currentAngle);
  }
  get degPerSlice() {
    if (this.config.slices) {
      return (360.0 / this.config.slices);
    }
  }
  refreshUI() {
    let Select = this.Belt.Belt.Select;
    if (Select && Select.hasItems()) {
      // @TODO: need to check minimum vs size of Select.Group.bounds
      let radius = Math.max(Math.min(Select.Group.bounds.width, Select.Group.bounds.height) / 3.0, 25);
      let position = Select.Group.bounds.center;
      if (!this.UI.circle) {
        this.UI.circle = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:this.SL.Paper.Layers['UI']-1}, paper.Shape.Circle, position, radius);
      }
      if (!this.State.Mouse.Dragging) {
        this.UI.circle.size.set({width: radius, height: radius});
        this.UI.circle.position.set(position);
      }
    }
    else {
      this.resetUI();
    }
    if (this.isActive()) {
      if (this.UI.circle) {
        this.UI.circle.strokeWidth = this.config.ui.circleActive.strokeWidth;
        this.UI.circle.strokeColor = this.config.ui.circleActive.strokeColor;
        this.UI.circle.opacity = this.config.ui.circleActive.opacity;
        this.refreshUISlices();
        this.refreshUIHandle();
      }
      this.SL.UI.Mouse.Cursor.activateCursor('rotate');
    }
    else {
      if (this.UI.circle) {
        this.UI.circle.strokeWidth = this.config.ui.circle.strokeWidth;
        this.UI.circle.strokeColor = this.config.ui.circle.strokeColor;
        this.UI.circle.opacity = this.config.ui.circle.opacity;
      }
      this.resetUIHandle();
      this.resetUISlices();
    }
  }
  resetUI() {
    if (this.UI.circle) {
      this.SL.Paper.destroyPaperItem(this.UI.circle);
      this.UI.circle = undefined;
    }
    this.resetUIHandle();
    this.resetUISlices();
  }

  refreshUIHandle() {
    if (!this.UI.circle) {
      return;
    }
    let handlePosition = this.Calc.pointOnCircle(this.currentAngle, this.UI.circle.bounds.center, this.UI.circle.strokeBounds.width/2.0);
    if (!this.UI.handle) {
      this.UI.handle = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:'UI_FG'}, paper.Shape.Circle, handlePosition, this.config.ui.handle.size);
    }
    this.UI.handle.position.set(handlePosition);
    this.UI.handle.strokeWidth = this.config.ui.handle.strokeWidth;
    this.UI.handle.strokeColor = this.config.ui.handle.strokeColor;
    this.UI.handle.fillColor = this.config.ui.handle.fillColor;
    this.UI.handle.opacity = this.config.ui.handle.opacity;

    if (this.config.ui.current) {
      if (!this.UI.current) {
        this.UI.current = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:this.SL.Paper.Layers['UI_FG']-1}, paper.Path.Line, this.UI.circle.bounds.center, handlePosition);
      }
      this.UI.current.strokeWidth = this.config.ui.current.strokeWidth;
      this.UI.current.strokeColor = this.config.ui.current.strokeColor;
      this.UI.current.opacity = this.config.ui.current.opacity;
    }
    if (this.UI.current && this.UI.current.segments && this.UI.current.segments.length) {
      this.UI.current.segments[0].point.set(this.UI.circle.bounds.center);
      if (this.UI.current.segments.length > 1) {
        this.UI.current.segments[1].point.set(handlePosition);
      }
    }
  }
  resetUIHandle() {
    if (this.UI.handle) {
      this.SL.Paper.destroyPaperItem(this.UI.handle);
      this.UI.handle = undefined;
    }
    if (this.UI.current) {
      this.SL.Paper.destroyPaperItem(this.UI.current);
      this.UI.current = undefined;
    }
  }
  refreshUISlices() {
    if (!this.config.slices || (!this.config.ui.slices.circles && !this.config.ui.slices.lines)) {
      if (this.UI.slices) {
        this.resetUISlices();
      }
      return;
    }
    if (!this.UI.circle) {
      return;
    }
    if (this.config.ui.slices.hideCircle) {
      this.UI.circle.strokeWidth = 0;
    }
    let itemsPerSlice = 0;
    if (this.config.ui.slices.circles) {
      itemsPerSlice++;
    }
    if (this.config.ui.slices.lines) {
      itemsPerSlice++;
    }
    if (!this.UI.slices) {
      this.UI.slices = this.SL.Paper.generatePaperItem({Source: this, Class:'UI'}, paper.Group);
    }
    if (this.UI.slices.children.length != this.config.slices*itemsPerSlice) {
      this.UI.slices.removeChildren();
      let sliceRadius = this.UI.circle.strokeBounds.width/2.0;
      for (let i=0; i < this.config.slices; i++) {
        if (this.config.ui.slices.lines) {
          let slicePoint = this.Calc.pointOnCircle(this.Calc.degNormalize(this.degPerSlice*i),  this.UI.circle.bounds.center, sliceRadius*this.config.ui.slices.lines.distance);
          let sliceLine = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer: 'GROUPED', Type: 'Slice.Line'}, paper.Path.Line, this.UI.circle.bounds.center, slicePoint);
          sliceLine.strokeWidth = this.config.ui.slices.lines.strokeWidth;
          sliceLine.strokeColor = this.config.ui.slices.lines.strokeColor;
          sliceLine.opacity = this.config.ui.slices.lines.opacity;
          this.UI.slices.addChild(sliceLine);
        }
        if (this.config.ui.slices.circles) {
          let slicePoint = this.Calc.pointOnCircle(this.Calc.degNormalize(this.degPerSlice*i),  this.UI.circle.bounds.center, sliceRadius*this.config.ui.slices.circles.distance);
          let sliceCircle = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer: 'GROUPED', Type: 'Slice.Circle'}, paper.Shape.Circle, slicePoint, this.config.ui.slices.circles.size);
          sliceCircle.strokeWidth = this.config.ui.slices.circles.strokeWidth;
          sliceCircle.strokeColor = this.config.ui.slices.circles.strokeColor;
          sliceCircle.opacity = this.config.ui.slices.circles.opacity;
          this.UI.slices.addChild(sliceCircle);
        }
      }
    }
  }
  getUISliceAt(point) {
    if (this.UI.slices) {
      let itemsPerSlice = 0;
      if (this.config.ui.slices.circles) {
        itemsPerSlice++;
      }
      if (this.config.ui.slices.lines) {
        itemsPerSlice++;
      }
      for (let i=0; i < this.UI.slices.children.length; i++) {
        let slice =  this.UI.slices.children[i];
        if (slice && (slice.data && slice.data.Type == 'Slice.Circle') && slice.contains(point)) {
          return ((i - (this.config.ui.slices.lines ? 1 : 0)) / itemsPerSlice);
        }
      }
    }
    return -1;
  }
  resetUISlices() {
    if (this.UI.slices) {
      let destroy = [];
      for (let slice of this.UI.slices.children) {
        destroy.push(slice);
      }
      for (let slice of destroy) {
        this.SL.Paper.destroyPaperItem(slice);
      }
      this.UI.slices.removeChildren();
      this.SL.Paper.destroyPaperItem(this.UI.slices);
      this.UI.slices = undefined;
    }
  }

  setAngle(angle, snap=true) {
    if (snap && this.config.snap && this.config.slices) {
      let Snap = this.SL.Utils.get('Snap');
      if (Snap) {
        angle = Snap.Rotation(angle, { slices: this.config.slices });
      }
    }
    angle = this.Calc.degNormalize(angle);
    if (this.currentAngle != angle) {
      let delta = angle - this.currentAngle;
      this.State.rotation = angle;
      for (let item of this.Belt.Belt.Select.Items) {
        item.rotate(delta, this.UI.circle.position);
      }
      this.Belt.refreshUI();
    }
  }

  onMouseMove(event) {
    this.State.Mouse.Hover.circle = (this.SL.UI.Mouse.State.active && this.SL.UI.Mouse.State.point && this.UI.circle && this.UI.circle.contains(this.SL.UI.Mouse.State.point));
    this.State.Mouse.Hover.handle = (this.SL.UI.Mouse.State.active && this.SL.UI.Mouse.State.point && this.UI.handle && this.UI.handle.contains(this.SL.UI.Mouse.State.point));
    this.State.Mouse.Hover.slice = ((this.SL.UI.Mouse.State.active && this.SL.UI.Mouse.State.point) ? this.getUISliceAt(this.SL.UI.Mouse.State.point) : -1);
    this.State.Mouse.Hover.ui = (this.State.Mouse.Hover.circle || this.State.Mouse.Hover.handle || this.State.Mouse.Hover.slice != -1);
  }
  onMouseDrag(event) {
    if (this.isActive()) {
      if (!this.UI.circle) {
        return;
      }
      this.State.Mouse.Dragging = true;
      let rotateFrom = this.UI.circle.position;
      let rotateTo = event.point.subtract(rotateFrom);
      let angle = this.Calc.degDenormalize(rotateTo.angle);
      if (angle > 180) {
        angle -= 360.0;
      }
      this.setAngle(angle);
    }
  }
  onMouseUp(event) {
    if (this.State.Mouse.Dragging) {
      this.State.Mouse.Dragging = false;
      this.resetUI();
      this.Belt.Belt.Select.SnapSelected({
        position: true,
        size: false
      });
      this.Belt.checkActiveTool();
    }
  }
  onSelectionItemSelected(event) {
    let Select = this.Belt.Belt.Select;
    let Snap = this.SL.Utils.get('Snap');
    if (Select.Items.length == 1) {
      this.State.rotation = this.Calc.degNormalize(Select.Items[0].rotation);
    }
    else if (event.item && (
      (this.Calc.degNormalize(event.item.rotation) != this.State.rotation) 
      && (!Snap || !Snap.Equal(this.Calc.degNormalize(event.item.rotation), this.State.rotation))
      )) {
      this.State.rotation = this.Calc.degNormalize(0);
    }
  }
  onSelectionItemUnselected(event) {
    let Select = this.Belt.Belt.Select;
    if (Select.Items.length == 1) {
      this.State.rotation = this.Calc.degNormalize(Select.Items[0].rotation);
    }
  }
}
