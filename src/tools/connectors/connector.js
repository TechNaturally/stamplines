import Tool from '../../core/tool.js';
export class Connector extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.eventHandlers = {};
    this.UI = {
      Targets: []
    };
    this.initialized = true;
    this.configure();
  }
  configure(config) {
    if (!this.initialized) {
      return;
    }
    config = super.configure(config);
    this.configureUI(config.ui);
    this.initEventHandlers();
    this.registerSnappers();
    return config;
  }
  configureUI(config={}) {
    this.config.ui = config;
    if (!config.color) {
      config.color = '#0066AA';
    }
    if (!config.target)  {
      config.target = {};
    }
    if (!config.target.default) {
      config.target.default = {};
    }
    if (!config.target.default.type) {
      config.target.default.type = paper.Shape.Ellipse;
    }
    if (config.target.default.radius == undefined) {
      config.target.default.radius = 10;
    }

    if (config.target.hitScale == undefined) {
      config.target.hitScale = { x: 1.0, y: 1.0 };
    }

    if (!config.target.style) {
      config.target.style = {};
    }
    if (config.target.style.strokeColor == undefined) {
      config.target.style.strokeColor = config.color;
    }
    if (config.target.style.strokeWidth == undefined) {
      config.target.style.strokeWidth = 2;
    }
    if (config.target.style.strokeJoin == undefined) {
      config.target.style.strokeJoin = 'round';
    }
    if (config.target.style.miterLimit == undefined) {
      config.target.style.miterLimit = 5;
    }
    if (config.target.style.fillColor == undefined) {
      config.target.style.fillColor = '#FFFFFF';
    }
    if (config.target.style.opacity == undefined) {
      config.target.style.opacity = 0.9;
    }
    if (config.target.style.cornerRadius == undefined) {
      config.target.style.cornerRadius = 10;
    }
  }

  reset() {
    super.reset();
    this.resetEventHandlers();
    this.unregisterSnappers();
    this.resetUI();
  }

  initEventHandlers() {
    if (!this.initialized) {
      return;
    }
  }
  resetEventHandlers() {
    if (!this.initialized) {
      return;
    }
  }

  registerSnappers(snaps) {
    let Snap = this.SL.Utils.get('Snap');
    if (!snaps || !Snap) {
      return;
    }
    if (!this.Snappers) {
      this.Snappers = {};
    }
    if (snaps.length) {
      if (snaps.includes('point')) {
        this.Snappers.point = Snap.addSnapper('point', {
          priority: 250,
          callback: (point, config) => {
            return this.SnapPoint(point, config);
          }
        });
      }
      if (snaps.includes('item')) {
        this.Snappers.item = Snap.addSnapper('item', {
          priority: 250,
          callback: (item, config) => {
            return this.SnapItem(item, config);
          }
        });
      }
    }
  }
  unregisterSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (!Snap || !this.Snappers) {
      return;
    }
    if (this.Snappers.point) {
      Snap.dropSnapper('point', this.Snappers.point.id);
      this.Snappers.point = undefined;
    }
    if (this.Snappers.item) {
      Snap.dropSnapper('item', this.Snappers.item.id);
      this.Snappers.item = undefined;
    }
  }
  shouldSnapPoint(point, config) {
    return false;
  }
  shouldSnapItem(item, config) {
    return false;
  }

  SnapPoint(point, config) {
    if (this.shouldSnapPoint(config.original, config)) {
      let hitCheck = this.getTargetHit(config.original, config.interactive, config);
      if (hitCheck && hitCheck.target) {
        if (hitCheck.target.data && hitCheck.offset.point) {
          let target = hitCheck.target.data.target;
          let item = hitCheck.target.data.item;
          let offset = hitCheck.offset.point;
          let snapPoint = this.connectionPoint(target, item, { offset: offset });
          if (snapPoint) {
            point.set(snapPoint);
          }
          if (!config.interactive || !point.equals(config.original)) {
            this.ConnectPoint(target, offset, config);
          }
        }
      }
      else if (hitCheck && hitCheck.oldTarget) {
        if (hitCheck.oldTarget.data && hitCheck.oldTarget.data.target) {
          let oldTarget = hitCheck.oldTarget.data.target;
          this.DisconnectPoint(oldTarget, config);
        }
      }
    }
    return point;
  }
  SnapItem(item, config) {
    return item;
  }

  isTargetConnected(target, config) {
    // implementing class should override this
    return false;
  }
  ConnectPoint(target, offset, config) {
    // implementing class should override this
  }
  DisconnectPoint(target, config) {
    // implementing class should override this
  }

  resetUI() {
    this.resetUITargets();
  }
  resetUITargets() {
    for (let targetUI of this.UI.Targets) {
      this.SL.Paper.destroyPaperItem(targetUI);
    }
    this.UI.Targets.length = 0;
  }
  targetsEqual(target1, target2) {
    if (target1 == target2) {
      return true;
    }
    else if (target1 && target2) {
      if (target1.id == target2.id && target1.item == target2.item) {
        return true;
      }
    }
    return false;
  }
  refreshTargets(args) {
    if (this.shouldShowTargets(args)) {
      this.showTargets();
    }
    else {
      this.hideTargets();
    }
  }
  shouldShowTargets(args) {
    throw new Error(`Abstract method: ${this.constructor.name}::shouldShowTargets is not implemented!`);
  }
  showTargets() {
    this.resetUITargets();
    this.SL.Paper.Item.forEachOfClass('Content', (item, args) => {
      this.drawItemTargets(item);
    });
  }
  hideTargets() {
    this.resetUITargets();
  }
  drawItemTargets(item) {
    throw new Error(`Abstract method: ${this.constructor.name}::drawItemTargets is not implemented!`);
  }
  drawItemTarget(item, target) {
    // temporarily straighten item for calculations
    let rotation = item.rotation;
    let rotationPoint = item.bounds.center;
    if (rotation) {
      item.rotate(-rotation, rotationPoint);
    }

    // draw the target depending on which type of item it is
    let targetUI;
    if (item.data && item.data.Type == 'Line') {
      targetUI = this.drawLineItemTarget(item, target);
    }
    else {
      targetUI = this.drawRectangleItemTarget(item, target);
    }

    // rotate item back
    if (rotation) {
      item.rotate(rotation, rotationPoint);
    }

    if (targetUI) {
      // rotate the target point with the item
      if (item.rotation) {
        targetUI.rotate(item.rotation, item.bounds.center);
      }

      // link it to the item and track it
      targetUI.data.item = item;
      targetUI.data.target = target;
      this.UI.Targets.push(targetUI);
    }
  }
  drawRectangleItemTarget(item, target) {
    // calculate the actual target point
    return this.drawTargetShape(target, this.globalTargetPoint(target, item), item.bounds, item);
  }
  drawLineItemTarget(item, target) {
    if (!item || !item.segments || !item.segments.length) {
      return;
    }
    let Geo = this.SL.Utils.get('Geo');

    // normalize start and end positions on line
    let section = Geo.Line.defineSection(target);
    let start = section.start;
    let end = section.end;

    // calculate distance from line
    let distance = target.distance || 0;
    let flipSide = (distance < 0);
    let normalAngle = (flipSide ? -90.0 : 90.0);
    distance = Math.abs(distance);
    if (distance) {
      distance += (item.strokeWidth / 2.0);
    }

    if (start != null && end != null && start != end) {
      if (end < start) {
        let temp = start;
        start = end;
        end = temp;
      }

      // determine the segments the target covers
      let startAt = Geo.Normalize.pointOnLine(item, start, true);
      let endAt = Geo.Normalize.pointOnLine(item, end, true);
      let targetUI;
      let targetStyle = $.extend({}, this.config.ui.target.style, target.targetStyle);
      let targetWidth = target.width || (this.config.ui.target.default.radius*2.0);
      let targetRadius = targetWidth/2.0;

      // build two sets of points
      let pointsA = []; // start -> end @ distance + targetRadius ("outside")
      let pointsB = []; // end -> start @ distance - targetRadius ("inside")
      let point, vector;

      // add the start point
      vector = startAt.vector.clone();
      vector.angle += normalAngle;

      vector.length = distance + targetRadius;
      pointsA.push(startAt.point.add(vector));

      vector.length = distance - targetRadius;
      pointsB.unshift(startAt.point.add(vector));

      // add all points in between start and end segments
      for (let i=startAt.segment.index+1; i < item.segments.length-1 && i <= endAt.segment.index; i++) {
        point = item.segments[i].point.clone();

        // create a vector for the angle
        vector = Geo.Line.normalAtCorner(item.segments[i]);
        if (flipSide) {
          vector.angle -= 180.0;
        }

        // add points
        vector.length = distance - targetRadius + Geo.Line.mitreLengthAtCorner(item.segments[i], targetWidth);
        pointsA.push(point.add(vector));

        vector.length = distance - targetRadius;
        pointsB.unshift(point.add(vector));
      }

      // add the end point
      vector = endAt.vector.clone();
      vector.angle += normalAngle;
      vector.length = distance + targetRadius;
      pointsA.push(endAt.point.add(vector));
      vector.length = distance - targetRadius;
      pointsB.unshift(endAt.point.add(vector));

      // create the target item using pointsA + pointsB
      let layer = ((item.data && item.data.Layer != null) ? item.data.Layer+1 : this.SL.Paper.Layers['UI_FG']+5);
      targetUI = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:layer}, paper.Path, pointsA.concat(pointsB));
      targetUI.closed = true;

      if (targetUI) {
        this.SL.Paper.applyStyle(targetUI, targetStyle);
        targetUI.data.item = item;
        targetUI.data.target = target;
        this.UI.Targets.push(targetUI);
      }
    }
    else  {
      // a single connection point
      let position;
      if (target.position != null) {
        position = target.position;
      }
      else if (start != null) {
        position = start;
      }
      else if (end != null) {
        position = end;
      }

      if (position != null) {
        let point = this.globalTargetPoint({
          position: position,
          distance: target.distance
        }, item);
        let targetUI = this.drawTargetShape({targetStyle: target.targetStyle}, point, null, item);
        // link it to the item and track it
        targetUI.data.item = item;
        targetUI.data.target = target;
        this.UI.Targets.push(targetUI);
      }
    }
  }
  drawTargetShape(target, targetPoint, sourceBounds=null, item=null) {
    let targetShape = this.config.ui.target.default.type;
    let targetConfig = {
      position: targetPoint,
      width: this.config.ui.target.default.radius*2.0,
      height: this.config.ui.target.default.radius*2.0
    };

    // handle custom widths and heights
    if (target.width > 0 || target.height > 0) {
      targetShape = paper.Shape.Rectangle;
      if (target.width > 0) {
        if (target.width <= 1.0 && sourceBounds) {
          targetConfig.width = sourceBounds.width * target.width;
        }
        else {
          targetConfig.width = target.width;
        }
      }
      if (target.height > 0) {
        if (target.height <= 1.0 && sourceBounds) {
          targetConfig.height = sourceBounds.height * target.height;
        }
        else {
          targetConfig.height = target.height;
        }
      }
    }

    // configure the target style
    let targetStyle = $.extend({}, this.config.ui.target.style, target.targetStyle);
    if (targetStyle.cornerRadius) {
      if (targetShape == paper.Shape.Rectangle) {
        targetStyle.radius = targetStyle.cornerRadius;
      }
      targetStyle.cornerRadius = undefined;
      delete targetStyle.cornerRadius;
    }

    // create the target point
    let layer = ((item.data && item.data.Layer != null) ? item.data.Layer+1 : this.SL.Paper.Layers['UI_FG']+5);
    let targetUI = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:layer}, targetShape, targetConfig);
    this.SL.Paper.applyStyle(targetUI, targetStyle);

    // the cornerRadius style would mess up width and height, so fix it here
    if (targetShape == paper.Shape.Rectangle && targetStyle.radius) {
      if (targetConfig.width) {
        targetUI.bounds.width = targetConfig.width;
      }
      if (targetConfig.height) {
        targetUI.bounds.height = targetConfig.height;
      }
      // make sure it stays at position
      targetUI.bounds.center = targetPoint;
    }

    // local rotation offset for the target point
    if (target.angle) {
      targetUI.rotate(target.angle);
    }

    return targetUI;
  }
  canScaleTarget(target) {
    return (target && target.constructor.name != 'Path');
  }

  getTargetHit(point, hitScaling, config) {
    let result = {
      target: null,
      offset: null,
      oldTarget: null
    };
    for (let targetUI of this.UI.Targets) {
      if (this.isTargetHit(targetUI, point, hitScaling)) {
        result.target = targetUI;
        result.offset = this.getTargetOffset(targetUI, point);
      }
      else if (this.isTargetConnected(targetUI, config)) {
        result.oldTarget = targetUI;
      }
    }
    return result;
  }

  isTargetHit(target, point, hitScaling=true) {
    let checkTarget = target.clone({insert:false});
    if (hitScaling && this.canScaleTarget(target)) {
      let hitScale = this.config.ui.target.hitScale;
      if (checkTarget.data && checkTarget.data.hitScale) {
        hitScale = checkTarget.data.hitScale;
      }
      checkTarget.scale(hitScale.x, hitScale.y);
    }
    return checkTarget.hitTest(point);
  }

  getTargetOffset(target, point) {
    if (target.constructor.name == 'Path') {
      return this.getTargetLineOffset(target, point);
    }
    else {
      return this.getTargetShapeOffset(target, point);
    }
  }
  getTargetLineOffset(target, point) {
    let Geo = this.SL.Utils.get('Geo');
    let offset = {
      point: new paper.Point(),
      segment: null,
      segmentOffset: null,
      atSegment: false,
      closestPoint: null
    };
    if (target.data.item && target.data.item.data && target.data.item.data.Type == 'Line') {
      let line = target.data.item;
      let pointOnLine = line.getNearestLocation(point);
      if (pointOnLine) {
        let segmentIndex = pointOnLine.segment.index;
        if (pointOnLine.time >= 0.5 && pointOnLine.time < 1.0 && segmentIndex > 0) {
          segmentIndex -= 1;
        }
        offset.segment = line.segments[segmentIndex];

        let positionNormal = (pointOnLine.offset / line.length);
        let pointDistance = point.subtract(pointOnLine.point);
        let section = Geo.Line.defineSection(target.data.target);
        offset.point.x = (positionNormal - section.middle) / (section.length/2.0);
        offset.point.y = pointDistance.length;
        offset.segmentOffset = pointOnLine.time;
        offset.atSegment = pointOnLine.point.equals(pointOnLine.segment.point);
        offset.closestPoint = pointOnLine.point;

        let checkQuadrant = offset.segment.curve.line.vector.quadrant;
        if (checkQuadrant == 4 && offset.segment.curve.line.vector.angle == -90) {
          checkQuadrant = 3;
        }

        if (offset.atSegment) {
          offset.point.y = Math.abs(offset.point.y) * (target.data.target.distance < 0.0 ? -1.0 : 1.0);
        }

        if (!offset.atSegment && offset.segment.curve && offset.segment.curve.line && offset.segment.curve.line.vector && (
          (checkQuadrant == 1 && (point.x > Math.round(pointOnLine.point.x) || point.y < Math.round(pointOnLine.point.y))) ||
          (checkQuadrant == 2 && (point.x > Math.round(pointOnLine.point.x) || point.y > Math.round(pointOnLine.point.y))) ||
          (checkQuadrant == 3 && (point.x < Math.round(pointOnLine.point.x) || point.y > Math.round(pointOnLine.point.y))) ||
          (checkQuadrant == 4 && (point.x < Math.round(pointOnLine.point.x) || point.y < Math.round(pointOnLine.point.y)))
          )) {
          offset.point.y *= -1.0;
        }
        if (target.data.target.lockDistance === true || target.data.target.lockY === true) {
          offset.point.y = target.data.target.distance || 0.0;
        }
      }
    }
    return offset;
  }
  getTargetShapeOffset(target, point) {
    let offset = {
      point: new paper.Point()
    };
    if (target.data && target.data.target) {
      let checkPoint = point.clone();
      let rotation, rotationPoint;
      if (target.data.item && target.data.item.rotation) {
        rotation = target.data.item.rotation;
        rotationPoint = target.data.item.bounds.center;
        target.rotate(-rotation, rotationPoint);
        checkPoint.set(checkPoint.rotate(-rotation, rotationPoint));
      }

      if (target.data.target.lockX === false) {
        offset.point.x = (checkPoint.x - target.position.x) / target.width * 2.0;
      }
      if (target.data.target.lockY === false) {
        offset.point.y = (checkPoint.y - target.position.y) / target.height * 2.0;
      }

      if (rotation) {
        target.rotate(rotation, rotationPoint);
        checkPoint.set(checkPoint.rotate(rotation, rotationPoint));
      }
    }
    return offset;
  }

  connectionPoint(target, item, args) {
    let offset = args.offset || new paper.Point(0, 0);
    if (item.data && item.data.Type == 'Line') {
      let Geo = this.SL.Utils.get('Geo');
      let section = Geo.Line.defineSection(target);
      let pointTarget = {
        position: section.middle + (offset.x*section.length/2.0),
        distance: offset.y
      };
      if (args.atSegment) {
        pointTarget.position = args.atSegment.location.offset / args.atSegment.path.length;
      }
      return this.globalTargetPoint(pointTarget, item);
    }
    else {
      return this.globalTargetPoint(target, item, offset);
    }
  }

  globalTargetPoint(target, item, offset) {
    let Geo = this.SL.Utils.get('Geo');
    let Snap = this.SL.Utils.get('Snap');
    if (item && target && Geo && Snap) {
      let rotation = item.rotation;
      let rotationPoint = item.bounds.center;
      if (rotation) {
        item.rotate(-rotation, rotationPoint);
      }
      let point, pivotPoint;
      if (item.data && item.data.Type == 'Line') {
        let position = (target.position != null ? target.position : 0.5);
        let distance = target.distance || 0;
        if (offset) {
          if (offset.x) {
            position += offset.x;
          }
          if (offset.y) {
            distance += offset.y;
          }
        }
        let pointOnLine = Geo.Normalize.pointOnLine(item, position, true);
        point = pointOnLine.point;

        if (distance) {
          // move the point out perpendicularly by distance
          pointOnLine.vector.length = distance;

          // check if it is the corner point
          if (pointOnLine.segment.next && Snap.PointsEqual(pointOnLine.point, pointOnLine.segment.point)) {
            // use the corner normal
            let cornerNormal = Geo.Line.normalAtCorner(pointOnLine.segment);
            let cornerSeg2 = pointOnLine.segment.next.point.subtract(pointOnLine.segment.point);
            pointOnLine.vector.angle = cornerNormal.angle;
            //console.log(`globalTargetPoint on CORNER (${cornerSeg2.angle} @ [${pointOnLine.segment.point.x}, ${pointOnLine.segment.point.y}]) in QUAD #${pointOnLine.vector.quadrant} @ ${pointOnLine.vector.angle} -> ${pointOnLine.vector.length} with DISTANCE [${distance}]`);
            if ((distance < 0.0 && (![1,2].includes(pointOnLine.vector.quadrant) || (pointOnLine.vector.quadrant == 1 && cornerSeg2.angle <= 0) || cornerSeg2.angle >= 0 || pointOnLine.vector.angle == 0))
              || (distance > 0.0 && ((pointOnLine.vector.quadrant == 1 && cornerSeg2.angle >= 0.0) || (pointOnLine.vector.quadrant == 2 && cornerSeg2.angle >= 90.0)))) {
              pointOnLine.vector.angle += 180.0;
              //console.log(`* FLIPPED TO QUAD #${pointOnLine.vector.quadrant} @ ${pointOnLine.vector.angle} -> ${pointOnLine.vector.length}`);
            }
          }
          else {
            // point on line segment, move out 90 degrees
            pointOnLine.vector.angle += 90;
          }
          point = point.add(pointOnLine.vector);
        }
      }
      else {
        point = Geo.Normalize.pointFromRectangle(target.point, item.bounds);
        pivotPoint = point.clone();
        if (offset && (offset.x || offset.y)) {
          let targetRect = {
            width: this.config.ui.target.default.radius*2.0,
            height: this.config.ui.target.default.radius*2.0
          };
          if (target.width > 0.0) {
            if (target.width <= 1.0) {
              targetRect.width = target.width * item.bounds.width;
            }
            else {
              targetRect.width = target.width;
            }
          }
          if (target.height > 0.0) {
            if (target.height <= 1.0) {
              targetRect.height = target.height * item.bounds.height;
            }
            else {
              targetRect.height = target.height;
            }
          }
          if (offset.x) {
            point.x += (targetRect.width * offset.x * 0.5);
          }
          if (offset.y) {
            point.y += (targetRect.height * offset.y * 0.5);
          }
        }
      }
      if (target.angle) {
        point.set(point.rotate(target.angle, pivotPoint));
      }
      if (rotation) {
        item.rotate(rotation, rotationPoint);
        point.set(point.rotate(rotation, rotationPoint));
      }
      return point;
    }
  }
}
