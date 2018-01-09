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
          style: labelSlot.style,
          point: Geo.Normalize.pointToRectangle(new paper.Point({x: (labelSlot.x || 0), y: (labelSlot.y || 0)}), stamp.bounds),
          width: labelSlot.width,
          height: labelSlot.height,
          angle: labelSlot.angle,
          lockX: labelSlot.lockX,
          lockY: labelSlot.lockY
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
          start: labelSlot.start,
          end: labelSlot.end,
          position: labelSlot.position,
          length: labelSlot.length,
          style: labelSlot.style,
          width: labelSlot.width,
          height: labelSlot.height,
          angle: labelSlot.angle,
          distance: labelSlot.distance,
          lockX: labelSlot.lockX,
          lockY: labelSlot.lockY,
          lockDistance: labelSlot.lockDistance,
          targetStyle: labelSlot.targetStyle
        };
        line.data.Labels.push(labelConfig);
      }
    }
  }

  bringLabelsToFront(item) {
    if (item && item.data && item.data.Labels) {
      for (let Label of item.data.Labels) {
        for (let connection of Label.connected) {
          if (connection && connection.label) {
            connection.label.moveAbove(item);
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
        return true;
      }
    }
    return false;
  }
  drawItemTargets(item) {
    if (item && item.data && item.data.Labels) {
      for (let labelSlot of item.data.Labels) {
        labelSlot = $.extend({}, labelSlot);
        labelSlot.style = {};
        if (labelSlot.targetStyle) {
          labelSlot.style = labelSlot.targetStyle;
          delete labelSlot.targetStyle;
        }
        this.drawItemTarget(item, labelSlot);
      }
    }
  }
  getLabelTargetConnectionIndex(label, target) {
    if (target && label && label.data && label.data.labeling && label.data.labeling.length) {
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
    return (config && ['create', 'move'].includes(config.context) && config.type == 'text-point' && config.item && config.item.data && config.item.data.Type == 'Text');
  }
  SnapPoint(point, config) {
    if (this.shouldSnapPoint(point, config)) {
      let mousePoint = this.SL.UI.Mouse.State.point;
      if (mousePoint) {
        config.original = mousePoint;
      }

      let hitCheck = this.getTargetHit(config.original, config.interactive, config);
      if (hitCheck && hitCheck.target) {
        if (hitCheck.target.data && hitCheck.offset.point) {
          let target = hitCheck.target.data.target;
          let item = hitCheck.target.data.item;
          let lineOffset = hitCheck.offset.point;
          let linePoint = hitCheck.offset.closestPoint;
          let snapPoint = this.connectionPoint(target, item, {
            offset: lineOffset,
            atSegment: (hitCheck.offset && hitCheck.offset.atSegment && hitCheck.offset.segment)
          });
          let Snap = this.SL.Utils.get('Snap');
          if (Snap && item && item.data && item.data.Type == 'Line' && snapPoint && linePoint) {
            let offset = new paper.Point(0, 0);
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
          point.set(snapPoint);

          if (!point.equals(config.original) && !config.interactive) {
            this.ConnectPoint(target, hitCheck.offset.point, config);
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
  
  shouldSnapItem(item, config) {
    return (item && item.data && ((item.data.Type == 'Text' && item.data.labeling) || item.data.Labels));
  }
  SnapItem(item, config) {
    if (this.shouldSnapItem(item, config) && item.data) {
      if (item.data.Type == 'Text' && item.data.labeling) {
        this.SnapItemAsLabel(item, config);
      }
      if (item.data.Labels) {
        this.SnapItemLabels(item, config);
      }
    }
    return item;
  }
  SnapItemAsLabel(item, config) {
    if (item && item.data && item.data.Type == 'Text' && item.data.labeling && item.data.labeling.length) {
      let connection = item.data.labeling[0];

      console.log('[LabelConnector]->SnapItemAsLabel', item);
      // @TODO: snap to the connection slot
    }
  }
  SnapItemLabels(item, config) {
    if (item && item.data && item.data.Labels) {
      for (let Label of item.data.Labels) {
        for (let connection of Label.connected) {
          console.log('[LabelConnector]->SnapItemLabel', connection);
          // @TODO: need to fix up Label connection.offset so this can calculate properly for Lines and for Shapes

          //connection.label.point.set(this.globalTargetPoint(connection.target, connection.target.item, connection.offset));
        }
      }
    }
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
    if (target && label && label.data && label.data.labeling && label.data.labeling.length) {
      let index = this.getLabelTargetConnectionIndex(label, target);
      if (index >= 0) {
        label.data.labeling.splice(index, 1);
      }
    }
    // @TODO: snap label's point (it WAS snapped to the connection, but is now disconnected)
  }
  DetachLabels(item) {
    if (item && item.data) {
      if (item.data.Labels) {
        // item has Labels
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
      if (item.data.Type == 'Text' && item.data.labeling && item.data.labeling.length) {
        // item is a Label
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
