import {Connector} from './connector.js';
export class LabelConnector extends Connector {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
  }

  initEventHandlers() {
    super.initEventHandlers();
    if (!this.initialized) {
      return;
    }
    if (this.SL.Paper) {
      if (!this.eventHandlers.GenerateItem) {
        this.eventHandlers.GenerateItem = this.SL.Paper.on('Generate', {Type: ['Stamp', 'Line']}, (args, item) => {
          this.InitLabels(item);
        }, 'LabelConnector.Generate.Item');
      }
      if (!this.eventHandlers.DestroyItem) {
        this.eventHandlers.DestroyItem = this.SL.Paper.on('Destroy', {Type: ['Stamp', 'Line', 'Text']}, (args, item) => {
          this.DetachLabels(item);
        }, 'LabelConnector.Destroy.Item');
      }
      if (!this.eventHandlers.SelectionItemSelected) {
        this.eventHandlers.SelectionItemSelected = this.SL.Paper.on('SelectionItemSelected', undefined, (args) => {
          if (args && args.item) {
            this.bringLabelsToFront(args.item);
          }
          this.refreshTargets(args);
        }, 'LabelConnector.SelectionItemSelected');
      }
      if (!this.eventHandlers.SelectionItemUnselected) {
        this.eventHandlers.SelectionItemUnselected = this.SL.Paper.on('SelectionItemUnselected', undefined, (args) => {
          this.refreshTargets(args);
        }, 'LabelConnector.SelectionItemUnselected');
      }
    }
  }
  resetEventHandlers() {
    super.resetEventHandlers();
    if (!this.initialized || !this.eventHandlers) {
      return;
    }
    if (this.eventHandlers.GenerateItem) {
      this.SL.Paper.off('Generate', this.eventHandlers.GenerateItem.id);
      delete this.eventHandlers.GenerateItem;
      this.eventHandlers.GenerateItem = undefined;
    }
    if (this.eventHandlers.DestroyItem) {
      this.SL.Paper.off('Destroy', this.eventHandlers.DestroyItem.id);
      delete this.eventHandlers.DestroyItem;
      this.eventHandlers.DestroyItem = undefined;
    }
    if (this.eventHandlers.SelectionItemSelected) {
      this.SL.Paper.off('SelectionItemSelected', this.eventHandlers.SelectionItemSelected.id);
      delete this.eventHandlers.SelectionItemSelected;
      this.eventHandlers.SelectionItemSelected = undefined;
    }
    if (this.eventHandlers.SelectionItemUnselected) {
      this.SL.Paper.off('SelectionItemUnselected', this.eventHandlers.SelectionItemUnselected.id);
      delete this.eventHandlers.SelectionItemUnselected;
      this.eventHandlers.SelectionItemUnselected = undefined;
    }
  }

  registerSnappers() {
    super.registerSnappers(['point', 'item']);
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.linePoint = Snap.addSnapper('point', {
        priority: 1000, // high priority so it runs after all others
        callback: (point, config) => {
          if (config && config.context == 'line-point') {
            return this.SnapLinePoint(point, config);
          }
          return point;
        }
      });
    }
  }
  unregisterSnappers() {
    super.unregisterSnappers();
    let Snap = this.SL.Utils.get('Snap');
    if (!Snap || !this.Snappers) {
      return;
    }
    if (this.Snappers.linePoint) {
      Snap.dropSnapper('point', this.Snappers.linePoint.id);
      this.Snappers.linePoint = undefined;
    }
  }

  InitLabels(item) {
    if (item && item.data) {
      if (item.data.Type == 'Stamp') {
        this.initStampLabels(item);
      }
      else if (item.data.Type == 'Line') {
        this.initLineLabels(item);
      }
    }
  }
  initStampLabels(stamp) {
    if (stamp && stamp.data && stamp.data.Type == 'Stamp' && stamp.data.Stamp && stamp.data.Stamp.labels && stamp.data.Stamp.labels.length) {
      let Geo = this.SL.Utils.get('Geo');
      if (!Geo) {
        return;
      }
      stamp.data.Labels = [];
      for (let labelSlot of stamp.data.Stamp.labels) {
        stamp.data.Labels.push({
          id: stamp.data.Labels.length,
          item: stamp,
          connected: [],
          targetStyle: labelSlot.targetStyle,
          point: Geo.Normalize.pointToRectangle(new paper.Point({x: (labelSlot.x || 0), y: (labelSlot.y || 0)}), stamp.bounds),
          width: labelSlot.width,
          height: labelSlot.height,
          angle: labelSlot.angle,
          lockX: labelSlot.lockX,
          lockY: labelSlot.lockY,
          labelOffset: labelSlot.labelOffset,
          labelStyle: labelSlot.labelStyle
        });
      }
    }
  }
  initLineLabels(line) {
    if (line && line.data && line.data.Type == 'Line' && line.data.Line && line.data.Line.labels && line.data.Line.labels.length) {
      let Geo = this.SL.Utils.get('Geo');
      if (!Geo) {
        return;
      }
      line.data.Labels = [];
      for (let labelSlot of line.data.Line.labels) {
        let labelConfig = {
          id: line.data.Labels.length,
          item: line,
          connected: [],
          targetStyle: labelSlot.targetStyle,
          start: labelSlot.start,
          end: labelSlot.end,
          position: labelSlot.position,
          length: labelSlot.length,
          width: labelSlot.width,
          height: labelSlot.height,
          angle: labelSlot.angle,
          distance: labelSlot.distance,
          lockX: labelSlot.lockX,
          lockY: labelSlot.lockY,
          lockDistance: labelSlot.lockDistance,
          labelOffset: labelSlot.labelOffset,
          labelStyle: labelSlot.labelStyle
        };
        line.data.Labels.push(labelConfig);
      }
    }
  }

  bringLabelsToFront(item) {
    let Select = this.Belt.Belt.Select;
    if (Select && Select.Group && this.itemHasLabels(item)) {
      for (let Label of item.data.Labels) {
        for (let connection of Label.connected) {
          if (connection && connection.label) {
            connection.label.moveAbove(Select.Group);
          }
        }
      }
    }
  }

  shouldShowTargets(args) {
    let Select = this.Belt.Belt.Select;
    if (Select && Select.Items && Select.Items.length == 1) {
      let checkItem = Select.Items[0];
      if (checkItem && checkItem.data && checkItem.data.Type == 'Text') {
        // show the Label targets when a single Text item is selected
        return true;
      }
    }
    return false;
  }
  drawItemTargets(item) {
    if (this.itemHasLabels(item)) {
      for (let labelSlot of item.data.Labels) {
        this.drawItemTarget(item, labelSlot);
      }
    }
  }
  getLabelTargetConnectionIndex(label, target) {
    if (target && this.itemIsLabel(label)) {
      let index = label.data.labeling.findIndex( (connection) => {
        return (connection && this.targetsEqual(connection.target, target));
      });
      return index;
    }
    return -1;
  }
  labelHasTarget(label, target) {
    return (this.getLabelTargetConnectionIndex(label, target) >= 0);
  }
  getTargetLabelConnectionIndex(target, label) {
    if (label && target && target.connected && target.connected.length) {
      let index = target.connected.findIndex( (connection) => {
        return (connection && connection.label == label);
      });
      return index;
    }
    return -1;
  }
  targetHasLabel(target, label) {
    return (this.getTargetLabelConnectionIndex(target, label) >= 0);
  }

  shouldSnapPoint(point, config) {
    return (config && ['create', 'move', 'label'].includes(config.context) && config.type == 'text-point' && config.item && config.item.data && config.item.data.Type == 'Text');
  }
  SnapPoint(point, config) {
    if (this.shouldSnapPoint(point, config)) {
      // make sure no other Point snappers interfere with the label's original point
      if (config.context == 'label') {
        // label context is already snapped and its parent is being manipulated
        point.set(config.original);
      }
      else {
        // this is a text-point, which snaps the top-left corner.  make it interactive with the mouse point instead
        // @TODO: if other cursors/triggers, should add config.source and use config.source.point
        let mousePoint = this.SL.UI.Mouse.State.point;
        if (mousePoint) {
          config.original = mousePoint;
        }
      }

      let Geo = this.SL.Utils.get('Geo');
      let target, item, targetOffset, linePoint;
      let atSegment = false;
      let hitCheck = null;
      if (config.context == 'label') {
        item = config.target.item;
        target = config.target;
        targetOffset = config.offset;
        if (Geo && item && item.data && item.data.Type == 'Line') {
          let section = Geo.Line.defineSection(target);
          let pointOffset = section.start + (targetOffset.x * 0.5 + 0.5) * (section.end - section.start);
          let pol = Geo.Normalize.pointOnLine(item, pointOffset, true);
          if (section.start != section.end) {
            linePoint = pol.point;
          }
          atSegment = (pol.point.equals(pol.segment.point) && pol.segment);
        }
      }
      else {
        // no lineOffset, check if we hit a target
        hitCheck = this.getTargetHit(config.original, config.interactive, config);
        if (hitCheck && hitCheck.target) {
          if (hitCheck.target.data && hitCheck.offset.point) {
            item = hitCheck.target.data.item;
            target = hitCheck.target.data.target;
            targetOffset = hitCheck.offset.point;
            atSegment = (hitCheck.offset && hitCheck.offset.atSegment && hitCheck.offset.segment);
            linePoint = hitCheck.offset.closestPoint;
          }
        }
      }

      if (target && item && targetOffset) {
        let snapPoint = this.connectionPoint(target, item, {
          offset: targetOffset,
          atSegment: atSegment
        });
        if (snapPoint) {
          let Snap = this.SL.Utils.get('Snap');
          let offset = new paper.Point(0, 0);

          // manually configured offset
          if (target.labelOffset) {
            if (target.labelOffset.x) {
              offset.x += config.item.bounds.width * target.labelOffset.x;
            }
            if (target.labelOffset.y) {
              offset.y += config.item.bounds.height * target.labelOffset.y;
            }
            snapPoint.set(snapPoint.add(offset));
          }

          // automatic offset for Line targets
          if (Snap && item.data && item.data.Type == 'Line' && linePoint) {
            offset.set(0, 0);
            if (Snap.Equal(snapPoint.x, linePoint.x, 1.0)) {
              offset.x = config.item.bounds.width/2.0;
            }
            else if (snapPoint.x < linePoint.x) {
              offset.x = config.item.bounds.width;
            }
            if (Snap.Equal(snapPoint.y, linePoint.y, 1.0)) {
              offset.y = config.item.bounds.height/2.0;
            }
            else if (snapPoint.y < linePoint.y) {
              offset.y = config.item.bounds.height;
            }
            snapPoint.set(snapPoint.subtract(offset));
          }

          // update the point
          point.set(snapPoint);
        }

        if (hitCheck && hitCheck.offset && config.context != 'label') {
          this.ConnectPoint(target, hitCheck.offset.point, config);
        }
      }
      else if (hitCheck && hitCheck.oldTarget && config.context != 'label') {
        if (hitCheck.oldTarget.data && hitCheck.oldTarget.data.target) {
          let oldTarget = hitCheck.oldTarget.data.target;
          this.DisconnectPoint(oldTarget, config);
        }
      }
    }
    return point;
  }

  itemHasLabels(item) {
    return (item && item.data && item.data.Labels) ? true : false;
  }
  itemIsLabel(item) {
    return (item && item.data && item.data.Type == 'Text' && item.data.labeling) ? true : false;
  }
  
  shouldSnapItem(item, config) {
    return (item && item.data && (this.itemIsLabel(item) || this.itemHasLabels(item)));
  }
  SnapItem(item, config) {
    if (this.shouldSnapItem(item, config)) {
      if (this.itemIsLabel(item)) {
        this.SnapItemAsLabel(item, config);
      }
      if (this.itemHasLabels(item)) {
        this.SnapItemLabels(item, config);
      }
    }
    return item;
  }
  SnapItemAsLabel(item, config) {
    if (this.itemIsLabel(item) && item.data.labeling.length) {
      let connection = item.data.labeling[0];
      console.log('[LabelConnector]->SnapItemAsLabel', item);
      // @TODO: snap to the connection slot
      // - this has apparently never been called so far
    }
  }
  SnapItemLabels(item, config) {
    if (this.itemHasLabels(item)) {
      let Snap = this.SL.Utils.get('Snap');
      let Geo = this.SL.Utils.get('Geo');
      for (let Label of item.data.Labels) {
        for (let connection of Label.connected) {
          if (connection.label) {
            let offset = new paper.Point(connection.offset);

            if (Geo && item && item.data && item.data.Type == 'Line') {              
              let section = Geo.Line.defineSection(connection.target);
              let start = section.start;
              let end = section.end;

              offset.x = ((end - start) / 2.0) * (offset.x);

              if (connection.target.distance) {
                offset.y -= connection.target.distance;
              }
            }

            let point = this.globalTargetPoint(connection.target, item, offset);
            connection.label.bounds.topLeft.set(point);

            if (Snap) {
              let snapConfig = {
                context: 'label',
                interactive: config.interactive,
                move: true,
                scale: false,
                target: connection.target,
                offset: connection.offset
              };
              if (this.SL.Paper.Item.hasCustomMethod(connection.label, 'SnapItem')) {
                this.SL.Paper.Item.callCustomMethod(connection.label, 'SnapItem', snapConfig);
              }
              else {
                Snap.Item(connection.label, snapConfig);
              }
            }
          }
        }
      }
    }
  }
  SnapLinePoint(point, config) {
    if (config && config.segment && config.segment.path) { 
      var line = config.segment.path;
      this.SnapItemLabels(line, config);

      if (!config.interactive) {
        // the actual line point gets set after all line-point snappers run (ie. after this function finishes)
        // wait a few cycles and snap the line's labels again
        // in most cases the change is unnoticeable, but can be apparent for labels positioned at line corners
        var _this = this;
        setTimeout(() => {
          _this.SnapItemLabels(line, config);
        }, 10);
      }
    }
    return point;
  }

  isTargetConnected(target, config) {
    if (target && target.data && target.data.target && config && config.item) {
      if (this.targetHasLabel(target.data.target, config.item)) {
        return true;
      }
    }
    return false;
  }
  ConnectPoint(target, offset, config) {
    if (target && offset && config && config.item && config.item.data && config.item.data.Type == 'Text') {
      this.AttachLabel(config.item, target, offset);
    }
  }
  DisconnectPoint(target, config) {
    if (target && config && config.item) {
      this.DetachLabel(config.item, target);
    }
  }
  AttachLabel(label, target, offset) {
    let connection = undefined;
    if (label && target && target.connected) {
      // track the connection on the target
      let index = this.getTargetLabelConnectionIndex(target, label);
      if (index < 0) {
        connection = {
          target,
          label,
          offset
        };
        target.connected.push(connection);
      }
      else if (index < target.connected.length) {
        connection = target.connected[index];
        if (connection.offset) {
          connection.offset.set(offset);
        }
        else {
          connection.offset = offset;
        }
      }

      if (connection) {
        //  track the connection on the label
        if (!label.data) {
          label.data = {};
        }
        if (!label.data.labeling) {
          label.data.labeling = [];
        }
        // make sure target is only in label's labeling list once
        index = this.getLabelTargetConnectionIndex(label, target);
        if (index < 0) {
          label.data.labeling.push(connection);
        }
      }
      this.SL.Paper.removeStyle(label, 'labelStyle', true);
      if (target.labelStyle) {
        this.SL.Paper.applyStyle(label, $.extend({}, target.labelStyle, {Class: 'labelStyle'}));
      }
    }
    return connection;
  }
  DetachLabel(label, target) {
    if (label && target && target.connected && target.connected.length) {
      let index = this.getTargetLabelConnectionIndex(target, label);
      if (index >= 0) {
        target.connected.splice(index, 1);
      }
    }
    if (target && this.itemIsLabel(label)) {
      let index = this.getLabelTargetConnectionIndex(label, target);
      if (index >= 0) {
        label.data.labeling.splice(index, 1);
      }
      this.SL.Paper.removeStyle(label, 'labelStyle', true);
    }
    // @TODO: snap label's point (it WAS snapped to the connection, but is now disconnected)
  }
  DetachLabels(item) {
    if (item && item.data) {
      if (this.itemHasLabels(item)) {
        // disconnect all connected Labels
        for (let Label of item.data.Labels) {
          if (Label.connected && Label.connected.length) {
            for (let connection of Label.connected) {
              if (connection && connection.label && connection.target) {
                this.DetachLabel(connection.label, connection.target);
              }
            }
          }
        }
      }
      if (this.itemIsLabel(item)) {
        // disconnect the item from anything it's labeling
        for (let connection of item.data.labeling) {
          if (connection && connection.label && connection.target) {
            this.DetachLabel(connection.label, connection.target);
          }
        }
      }
    }
  }
}
