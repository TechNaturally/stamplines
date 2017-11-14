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
        this.eventHandlers.GenerateItem = this.SL.Paper.on('Generate', {}, (args, item) => {
          this.InitLabels(item);
        }, 'LabelConnector.Generate.Item');
      }
      if (!this.eventHandlers.DestroyItem) {
        this.eventHandlers.DestroyItem = this.SL.Paper.on('Destroy', {}, (args, item) => {
          this.DetachLabels(item);
        }, 'LabelConnector.Destroy.Item');
      }
      if (!this.eventHandlers.SelectionItemSelected) {
        this.eventHandlers.SelectionItemSelected = this.SL.Paper.on('SelectionItemSelected', undefined, (args) => {
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

  shouldSnapPoint(point, config) {
    return (config && config.context == 'text-point' && config.item && config.item.data && config.item.data.Type == 'Text');
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
          let snapPoint = this.connectionPoint(target, item, lineOffset);

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
        }
      }
      else if (hitCheck && hitCheck.oldTarget) {
        //console.log(`[${this.constructor.name}]->SnapPoint DISCONNECT`, hitCheck.oldTarget);
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
    if (item && item.data && item.data.Type == 'Text' && item.data.labeling) {
      // @TODO: snap to the labeling slot
    }
  }
  SnapItemLabels(item, config) {
    if (item && item.data && item.data.Labels) {
      for (let label of item.data.Labels) {
        for (let connected of label.connected) {
          if (connected.point) {
            connected.point.set(this.globalTargetPoint(connection, item, (connected.data && connected.data.connectionOffset)));
          }
        }
      }
    }
  }

  AttachLabel(label, target, offset) {
    // @TODO: link the label + target and set the labelOffset
    console.log('ATTACH LABEL to TARGET =>', label, target, offset);
  }
  DetachLabels(item) {
    // @TODO: check item.data to decide if it IS a label or HAS a label
  }
}
