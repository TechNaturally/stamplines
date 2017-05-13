import Tool from '../../core/tool.js';
export class Scale extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.initCalc();
    this.initialized = true;
  }
  initCalc() {
    this.VectorMap = {
      'N': new paper.Point(0.0, -1.0),
      'S': new paper.Point(0.0, 1.0),
      'E': new paper.Point(1.0, 0.0),
      'W': new paper.Point(-1.0, 0.0),
      'NE': new paper.Point(1.0, -1.0),
      'SW': new paper.Point(-1.0, 1.0),
      'SE': new paper.Point(1.0, 1.0),
      'NW': new paper.Point(-1.0, -1.0)
    };
    let self = this;
    this.Calc = {
      directionVector: function(direction, magnitude=1.0) {
        let vector = self.VectorMap[direction];
        if (vector) {
          vector = vector.multiply(magnitude);
        }
        return vector;
      },
      directionEqual: function(vect1, vect2) {
        let Snap = self.SL.Utils.get('Snap');
        return Snap.Equal(vect1.angle, vect2.angle);
      },
      oppositePoint: function(edge, rectangle) {
        let result = rectangle.center.clone();
        if (edge.x < 0) {
          result.x = rectangle.right;
        }
        else if (edge.x > 0) {
          result.x = rectangle.left;
        }
        if (edge.y < 0) {
          result.y = rectangle.bottom;
        }
        else if (edge.y > 0) {
          result.y = rectangle.top;
        }
        return result;
      }
    };
  }
  configure(config) {
    config = super.configure(config);
    if (!config.edgeWidth) {
      config.edgeWidth = 6;
    }
    this.registerSnappers();
    return config;
  }
  reset() {
    if (!this.initialized) {
      return;
    }
    super.reset();
    this.unregisterSnappers();
    this.resetState();
  }
  resetState() {
    if (this.Belt.State.Mouse.Hover.selectionEdge) {
      for (let prop of Object.keys(this.Belt.State.Mouse.Hover.selectionEdge)) {
        this.Belt.State.Mouse.Hover.selectionEdge[prop] = undefined;
        delete this.Belt.State.Mouse.Hover.selectionEdge[prop];
      }
    }
  }
  registerSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.rectangle = Snap.addSnapper('rectangle', {
        priority: 75,
        callback: (rectangle, config) => {
          return this.snapRectangle(rectangle, config);
        }
      });
      this.Snappers.item = Snap.addSnapper('item', {
        priority: 75,
        callback: (item, config) => {
          return this.snapItem(item, config);
        }
      });
    }
  }
  unregisterSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (!Snap || !this.Snappers) {
      return;
    }
    if (this.Snappers.rectangle) {
      Snap.dropSnapper('rectangle', this.Snappers.rectangle.id);
      this.Snappers.rectangle = undefined;
    }
    if (this.Snappers.item) {
      Snap.dropSnapper('item', this.Snappers.item.id);
      this.Snappers.item = undefined;
    }
  }
  snapItem(item, config) {
    // @TODO: maybe move to StampPalette?
    // @TODO: support item.rotation
    // @TODO: support config.size
    // use this.snapRectangle(item.bounds, {});
    return item;
  }
  snapRectangle(rectangle, config) {
    if (this.config.minSize) {
      if (this.config.minSize.width && rectangle.width < this.config.minSize.width) {
        rectangle.width = this.config.minSize.width;
      }
      else if (rectangle.width < 1) {
        rectangle.width = 1;
      }
      if (this.config.minSize.height && rectangle.height < this.config.minSize.height) {
        rectangle.height = this.config.minSize.height;
      }
      else if (rectangle.height < 1) {
        rectangle.height = 1;
      }
    }
    return rectangle;
  }
  get activationPriority() {
    if (this.isEdgeHovered()) {
      return 45;
    }
    return -1;
  }
  isEdgeHovered() {
    return !!(this.Belt.State.Mouse.Hover.selectionEdge &&
      (this.Belt.State.Mouse.Hover.selectionEdge.top
      || this.Belt.State.Mouse.Hover.selectionEdge.bottom
      || this.Belt.State.Mouse.Hover.selectionEdge.left
      || this.Belt.State.Mouse.Hover.selectionEdge.right)
      );
  }
  refreshUI() {
    if (this.isActive() && this.Belt.State.Mouse.Hover.selectionEdge) {
      var cursor;
      switch (this.Belt.State.Mouse.Hover.selectionEdge.direction) {
      case 'N':
      case 'S':
        cursor = 'expand-ns';
        break;
      case 'E':
      case 'W':
        cursor = 'expand-ew';
        break;
      case 'NE':
      case 'SW':
        cursor = 'expand-nesw';
        break;
      case 'SE':
      case 'NW':
        cursor = 'expand-senw';
        break;
      }
      if (cursor) {
        this.SL.UI.Mouse.Cursor.activateCursor(cursor);
      }
    }
  }

  Scale(items, delta, edge) {
    if (typeof edge == 'string') {
      edge = this.Calc.directionVector(edge);
    }
    let Snap = this.SL.Utils.get('Snap');
    if (items && edge) {
      let dragEdge = edge.clone();
      let rotationPoint = this.Calc.oppositePoint(dragEdge, this.Belt.Belt.Select.UI.outline.bounds);

      for (let item of items) {
        let scaleDelta = delta.clone();
        let scaleEdge = dragEdge.clone();
        let rotation = item.rotation;

        // reset rotation to pevent skewing
        if (rotation) {
          item.rotate(-rotation, rotationPoint);
          scaleDelta = scaleDelta.rotate(-rotation);
          scaleEdge = scaleEdge.rotate(-rotation);
        }

        // make true 0.0 values (rotate sometimes gives "almost" 0 values)
        if (Snap) {
          scaleDelta.x = Snap.Around(0.0, scaleDelta.x);
          scaleDelta.y = Snap.Around(0.0, scaleDelta.y);

          scaleEdge.x = Snap.Around(0.0, scaleEdge.x);
          scaleEdge.y = Snap.Around(0.0, scaleEdge.y);
        }

        // lock for single-axis scaling
        if (scaleEdge.x == 0.0) {
          scaleDelta.x = 0.0;
        }
        if (scaleEdge.y == 0.0) {
          scaleDelta.y = 0.0;
        }

        // determine the scale anchor point
        let anchor = this.Calc.oppositePoint(scaleEdge, item.bounds);
        if (!anchor) {
          anchor = item.bounds.center;
        }

        // scale multiplier
        let deltaMulti = {
          x: 1.0,
          y: 1.0
        };
        // deltas get flipped for stretches towards N and W
        if (scaleEdge.y < 0.0) {
          deltaMulti.y = -1.0;
        }
        if (scaleEdge.x < 0.0) {
          deltaMulti.x = -1.0;
        }

        // calculate scale factor (as multiplier of existing dimension)
        let bounds = item.bounds;
        let scale = new paper.Size({
          width: (bounds.width + scaleDelta.x*deltaMulti.x) / bounds.width,
          height: (bounds.height + scaleDelta.y*deltaMulti.y) / bounds.height
        });

        // perform the scale
        item.scale(scale.width, scale.height, anchor);

        Snap.Item(item, {
          interactive: true,
          size: true,
          position: false,
          anchor: anchor
        });

        // rotate the item back
        if (rotation) {
          item.rotate(rotation, rotationPoint);
        }
      }
    }
  }

  onMouseDown(event) {
    if (this.isActive()) {
//      console.log(`mouse DOWN [${event.point.x}, ${event.point.y}] WITH EDGE => "${this.Belt.State.Mouse.Hover.selectionEdge.direction}"`);
    }
  }
  onMouseDrag(event) {
    if (this.isActive() && this.Belt.State.Mouse.Hover.selectionEdge.direction) {
      // perform the scale (also Snaps each item as it scales them)
      this.Scale(this.Belt.Belt.Select.Items, event.delta, this.Belt.State.Mouse.Hover.selectionEdge.direction);
      this.Belt.refreshUI();
    }
  }
  onMouseUp(event) {
    if (this.isActive()) {
      // finalize the scale by snapping all items in non-interactive mode
      // @TODO: need to determine anchorEdge
      let anchorEdge = undefined;
      this.Belt.Belt.Select.SnapSelected({
        interactive: false,
        size: true,
        position: false,
        anchor: anchorEdge
      });
      this.finish();
      this.onMouseMove(event);
      this.refreshUI();
    }
  }

  onMouseMove(event) {
    var edgeWidth = this.config.edgeWidth;
    if (!this.Belt.State.Mouse.Hover.selectionEdge) {
      this.Belt.State.Mouse.Hover.selectionEdge = {};
    }
    let wasDirection = this.Belt.State.Mouse.Hover.selectionEdge.direction;
    this.Belt.State.Mouse.Hover.selectionEdge.top = false;
    this.Belt.State.Mouse.Hover.selectionEdge.bottom = false;
    this.Belt.State.Mouse.Hover.selectionEdge.left = false;
    this.Belt.State.Mouse.Hover.selectionEdge.right = false;
    this.Belt.State.Mouse.Hover.selectionEdge.direction = undefined;
    if (this.SL.UI.Mouse.State.active && this.SL.UI.Mouse.State.point && this.Belt.Belt.Select.UI.outline) {
      var checkBounds = this.Belt.Belt.Select.UI.outline.handleBounds.expand(edgeWidth);
      if (checkBounds.contains(this.SL.UI.Mouse.State.point)) {
        var checkRect = new paper.Rectangle();
        var checkPoint = new paper.Point();

        checkPoint.set(checkBounds.right, checkBounds.top+edgeWidth);
        checkRect.set(checkBounds.topLeft, checkPoint);
        this.Belt.State.Mouse.Hover.selectionEdge.top = checkRect.contains(this.SL.UI.Mouse.State.point);

        checkPoint.set(checkBounds.left, checkBounds.bottom-edgeWidth);
        checkRect.set(checkPoint, checkBounds.bottomRight);
        this.Belt.State.Mouse.Hover.selectionEdge.bottom = checkRect.contains(this.SL.UI.Mouse.State.point);

        checkPoint.set(checkBounds.left+edgeWidth, checkBounds.bottom);
        checkRect.set(checkBounds.topLeft, checkPoint);
        this.Belt.State.Mouse.Hover.selectionEdge.left = checkRect.contains(this.SL.UI.Mouse.State.point);

        checkPoint.set(checkBounds.right-edgeWidth, checkBounds.top);
        checkRect.set(checkPoint, checkBounds.bottomRight);
        this.Belt.State.Mouse.Hover.selectionEdge.right = checkRect.contains(this.SL.UI.Mouse.State.point);
      }
    }
    if (this.Belt.State.Mouse.Hover.selectionEdge.top && this.Belt.State.Mouse.Hover.selectionEdge.right) {
      this.Belt.State.Mouse.Hover.selectionEdge.direction = 'NE';
    }
    else if (this.Belt.State.Mouse.Hover.selectionEdge.bottom && this.Belt.State.Mouse.Hover.selectionEdge.right) {
      this.Belt.State.Mouse.Hover.selectionEdge.direction = 'SE';
    }
    else if (this.Belt.State.Mouse.Hover.selectionEdge.bottom && this.Belt.State.Mouse.Hover.selectionEdge.left) {
      this.Belt.State.Mouse.Hover.selectionEdge.direction = 'SW';
    }
    else if (this.Belt.State.Mouse.Hover.selectionEdge.top && this.Belt.State.Mouse.Hover.selectionEdge.left) {
      this.Belt.State.Mouse.Hover.selectionEdge.direction = 'NW';
    }
    else if (this.Belt.State.Mouse.Hover.selectionEdge.top) {
      this.Belt.State.Mouse.Hover.selectionEdge.direction = 'N';
    }
    else if (this.Belt.State.Mouse.Hover.selectionEdge.right) {
      this.Belt.State.Mouse.Hover.selectionEdge.direction = 'E';
    }
    else if (this.Belt.State.Mouse.Hover.selectionEdge.bottom) {
      this.Belt.State.Mouse.Hover.selectionEdge.direction = 'S';
    }
    else if (this.Belt.State.Mouse.Hover.selectionEdge.left) {
      this.Belt.State.Mouse.Hover.selectionEdge.direction = 'W';
    }
    if (this.Belt.State.Mouse.Hover.selectionEdge.direction != wasDirection) {
      this.refreshUI();
      this.Belt.checkActiveTool();
    }
  }
}
