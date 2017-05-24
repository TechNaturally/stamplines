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
    this.configureUI(config.ui);
    return config;
  }
  configureUI(config={}) {
    this.config.ui = config;
    if (config.color == undefined) {
      config.color = '#FF9933';
    }
    if (config.color2 == undefined) {
      config.color2 = '#990000';
    }
    if (!config.circle) {
      config.circle = {};
    }
    if (config.circle.strokeWidth == undefined) {
      config.circle.strokeWidth = 1;
    }
    if (config.circle.strokeColor == undefined) {
      config.circle.strokeColor = config.color;
    }
    if (config.circle.opacity == undefined) {
      config.circle.opacity = 0.6;
    }
    if (!config.circleActive) {
      config.circleActive = {};
    }
    if (config.circleActive.strokeWidth == undefined) {
      config.circleActive.strokeWidth = 2;
    }
    if (config.circleActive.strokeColor == undefined) {
      config.circleActive.strokeColor = config.circle.strokeColor;
    }
    if (config.circleActive.opacity == undefined) {
      config.circleActive.opacity = config.circle.opacity;
    }
    if (!config.handle) {
      config.handle = {};
    }
    if (config.handle.size == undefined) {
      config.handle.size = 8;
    }
    if (config.handle.strokeWidth == undefined) {
      config.handle.strokeWidth = 1;
    }
    if (config.handle.strokeColor == undefined) {
      config.handle.strokeColor = config.color2;
    }
    if (config.handle.fillColor == undefined) {
      config.handle.fillColor = config.handle.strokeColor;
    }
    if (config.handle.opacity == undefined) {
      config.handle.opacity = 1.0;
    }
    if (!config.current) {
      config.current = {};
    }
    if (config.current.strokeWidth == undefined) {
      config.current.strokeWidth = 1;
    }
    if (config.current.strokeColor == undefined) {
      config.current.strokeColor = config.handle.strokeColor;
    }
    if (config.current.opacity == undefined) {
      config.current.opacity = config.handle.opacity;
    }
    if (!config.slices) {
      config.slices = {};
    }
    if (config.slices.opacity == undefined) {
      config.slices.opacity = 0.5;
    }
    if (config.slices.hideCircle == undefined) {
      config.slices.hideCircle = true;
    }
    if (config.slices.circles == undefined || config.slices.circles === true) {
      config.slices.circles = {};
    }
    if (config.slices.circles) {
      if (config.slices.circles.distance == undefined) {
        config.slices.circles.distance = 1.0;
      }
      if (config.slices.circles.size == undefined) {
        config.slices.circles.size = 6;
      }
      if (config.slices.circles.strokeWidth == undefined) {
        config.slices.circles.strokeWidth = 1;
      }
      if (config.slices.circles.strokeColor == undefined) {
        config.slices.circles.strokeColor = config.circle.strokeColor;
      }
      if (config.slices.circles.opacity == undefined) {
        config.slices.circles.opacity = config.slices.opacity;
      }
    }
    if (config.slices.lines == undefined || config.slices.lines === true) {
      config.slices.lines = {};
    }
    if (config.slices.lines) {
      if (config.slices.lines.distance == undefined) {
        config.slices.lines.distance = 1.0;
      }
      if (config.slices.lines.strokeWidth == undefined) {
        config.slices.lines.strokeWidth = 1;
      }
      if (config.slices.lines.strokeColor == undefined) {
        config.slices.lines.strokeColor = config.circle.strokeColor;
      }
      if (config.slices.lines.opacity == undefined) {
        config.slices.lines.opacity = config.slices.opacity;
      }
    }
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
      // @TODO: rework rotate UI (don't cover whole item)
      let radius = Math.max(Math.min(Select.Group.bounds.width, Select.Group.bounds.height) / 3.0, 25);
      let position = Select.Group.bounds.center;
      if (!this.UI.circle) {
        this.UI.circle = this.SL.Paper.generatePaperItem({Source: this, Class:['UI','Tool'], Layer:this.SL.Paper.Layers['UI']-1}, paper.Shape.Circle, position, radius);
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
      this.UI.handle = this.SL.Paper.generatePaperItem({Source: this, Class:['UI','Tool'], Layer:'UI_FG'}, paper.Shape.Circle, handlePosition, this.config.ui.handle.size);
    }
    this.UI.handle.position.set(handlePosition);
    this.UI.handle.strokeWidth = this.config.ui.handle.strokeWidth;
    this.UI.handle.strokeColor = this.config.ui.handle.strokeColor;
    this.UI.handle.fillColor = this.config.ui.handle.fillColor;
    this.UI.handle.opacity = this.config.ui.handle.opacity;

    if (this.config.ui.current) {
      if (!this.UI.current) {
        this.UI.current = this.SL.Paper.generatePaperItem({Source: this, Class:['UI','Tool'], Layer:this.SL.Paper.Layers['UI_FG']-1}, paper.Path.Line, this.UI.circle.bounds.center, handlePosition);
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
      this.UI.slices = this.SL.Paper.generatePaperItem({Source: this, Class:['UI','Tool']}, paper.Group);
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
        angle = Snap.Rotation(angle, { context: 'rotate', slices: this.config.slices });
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
        context: 'rotate',
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
