import Tool from '../../core/tool.js';
export class Scale extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.initialized = true;
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
  snapItem(item, config={}) {
    if (config.size) {
      let Geo = this.SL.Utils.get('Geo');
      if (!Geo) {
        return;
      }
      let rotation = item.rotation;
      let rotationPoint = item.bounds.center;
      if (rotation) {
        item.rotate(-rotation, rotationPoint);
      }
      let bounds = item.bounds;
      let snapped = this.snapRectangle(bounds.clone(), {});

      if (bounds.width != snapped.width || bounds.height != snapped.height) {
        let delta = {
          x: snapped.width - bounds.width,
          y: snapped.height - bounds.height
        };
        let Snap = this.SL.Utils.get('Snap');

        let anchor = config.anchor || item.bounds.center;
        if (config.anchorEdge) {
          anchor = Geo.Direction.edgePoint(config.anchorEdge, item.bounds);
        }

        let targetBounds = {
          x: item.bounds.x,
          y: item.bounds.y,
          width: snapped.width,
          height: snapped.height
        };
        item.bounds.set(targetBounds);

        let anchorCheck = config.anchor || item.bounds.center;
        if (config.anchorEdge) {
          anchorCheck = Geo.Direction.edgePoint(config.anchorEdge, item.bounds);
        }
        let anchorDelta = new paper.Point({
          x: (anchor.x - anchorCheck.x),
          y: (anchor.y - anchorCheck.y)
        });
        item.bounds.set({
          x: (item.bounds.x + anchorDelta.x),
          y: (item.bounds.y + anchorDelta.y),
          width: snapped.width,
          height: snapped.height
        });
      }
      if (rotation) {
        item.rotate(rotation, rotationPoint);
      }      
    }
    return item;
  }
  snapRectangle(rectangle, config={}) {
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
    let Geo = this.SL.Utils.get('Geo');
    if (!Geo) {
      return;
    }
    if (typeof edge == 'string') {
      edge = Geo.Direction.vector(edge);
    }
    let Snap = this.SL.Utils.get('Snap');
    if (items && edge) {
      let rotationPoint = Geo.Direction.edgePoint(edge, this.Belt.Belt.Select.UI.outline.bounds, true);

      for (let item of items) {
        let scaleDelta = delta.clone();
        let scaleEdge = edge.clone();
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
        let anchor = Geo.Direction.edgePoint(scaleEdge, item.bounds, true);
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

        // perform the scale
        let targetBounds = {
          x: item.bounds.left,
          y: item.bounds.top,
          width: (item.bounds.width + scaleDelta.x*deltaMulti.x),
          height: (item.bounds.height + scaleDelta.y*deltaMulti.y)
        };
        item.bounds.set(targetBounds);

        // check the anchor
        let anchorCheck = Geo.Direction.edgePoint(scaleEdge, item.bounds, true);
        if (!anchorCheck) {
          anchorCheck = item.bounds.center;
        }
        let anchorDelta = new paper.Point({
          x: (anchor.x - anchorCheck.x),
          y: (anchor.y - anchorCheck.y)
        });
        item.bounds.set({
          x: item.bounds.left + anchorDelta.x,
          y: item.bounds.top + anchorDelta.y,
          width: item.bounds.width,
          height: item.bounds.height
        });

        Snap.Item(item, {
          interactive: true,
          size: true,
          position: false,
          anchor: anchor,
          anchorEdge: scaleEdge.rotate(180.0)
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
