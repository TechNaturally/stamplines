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
  }

  registerSnappers() {
    super.registerSnappers();
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.item = Snap.addSnapper('item', {
        priority: 250,
        callback: (item, config) => {
          return this.SnapItem(item, config);
        }
      });
      this.Snappers.point = Snap.addSnapper('point', {
        priority: 250,
        callback: (point, config) => {
          return this.SnapPoint(point, config);
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
    if (this.Snappers.item) {
      Snap.dropSnapper('item', this.Snappers.item.id);
      this.Snappers.item = undefined;
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
  AttachLabel(label, target, offset) {
    // @TODO: link the label + target and set the labelOffset
  }
  DetachLabels(item) {
    // @TODO: check item.data to decide if it IS a label or HAS a label
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
          filled: null,
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
          filled: null,
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
          targetStyle: labelSlot.targetStyle
        };
        line.data.Labels.push(labelConfig);
      }
    }
  }
  SnapPoint(point, config) {
    if (config && config.context == 'text-point' && config.item && config.item.data && config.item.data.Type == 'Text' && this.UI.Targets && this.UI.Targets.length) {
      let item = config.item;
      let mousePoint = this.SL.UI.Mouse.State.point;
      if (mousePoint) {
        for (let targetUI of this.UI.Targets) {
          if (targetUI.contains(mousePoint) && targetUI.data.item && targetUI.data.item.data && targetUI.data.item.data.Type == 'Line') {
            let line = targetUI.data.item;
            let pointOnLine = line.getNearestLocation(mousePoint);
            if (pointOnLine) {
              let Geo = this.SL.Utils.get('Geo');
              let position = pointOnLine.offset / line.length;
              let pointAtSegment = pointOnLine.point.equals(pointOnLine.segment.point);

              if (targetUI.data.target.distance) {
                let vector = pointOnLine.normal.clone();

                if (pointAtSegment) {
                  let mitreLength = Geo.Line.mitreLengthAtCorner(pointOnLine.segment, targetUI.data.target.distance);
                  vector = Geo.Line.normalAtCorner(pointOnLine.segment);
                  vector.length = Math.abs(targetUI.data.target.distance) * ((mitreLength < 0)?-1.0:1.0);
                }
                else {
                  vector.length = targetUI.data.target.distance * -1.0;
                }

                // calculate the result for the top-left corner position
                let result =  pointOnLine.point.add(vector);

                // the offset is based on which point of the item's bounds we want to snap to the connector
                let offset = new paper.Point(0, 0);
                let Snap = this.SL.Utils.get('Snap');
                if (Snap.Equal(result.x, pointOnLine.point.x, 5.0)) {
                  offset.x = item.bounds.width/2.0;
                }
                else if (result.x < pointOnLine.point.x) {
                  offset.x = item.bounds.width;
                }
                if (Snap.Equal(result.y, pointOnLine.point.y, 5.0)) {
                  offset.y = item.bounds.height/2.0;
                }
                else if (result.y < pointOnLine.point.y) {
                  offset.y = item.bounds.height;
                }
                return result.subtract(offset);
              }
              return pointOnLine.point.clone();
            }
          }
        }
      }
    }
    return point;
  }
  SnapItem(item, config) {
    // TODO: check if item has any connected labels and reposition them if so
    return item;
  }

  onSelectionItemSelected(event) {
    this.refreshTargets();
  }
  onSelectionItemUnselected(event) {
    this.refreshTargets(event.items?true:false);
  }
  refreshTargets(excludeFirst) {
    if (this.shouldShowTargets(excludeFirst)) {
      this.showTargets();
    }
    else {
      this.hideTargets();
    }
  }
  shouldShowTargets(excludeFirst) {
    let Select = this.Belt.Belt.Select;
    let checkItems = Select.Items.slice(excludeFirst?1:0);
    if (checkItems.length == 1) {
      let checkItem = checkItems[0];
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
}
