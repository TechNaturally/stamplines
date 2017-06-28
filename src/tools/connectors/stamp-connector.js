import {Connector} from './connector.js';
export class StampConnector extends Connector {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
  }

  initEventHandlers() {
    super.initEventHandlers();
    if (!this.initialized) {
      return;
    }
    if (this.SL.Paper) {
      if (!this.eventHandlers.GenerateStamp) {
        this.eventHandlers.GenerateStamp = this.SL.Paper.on('Generate', {Type: 'Stamp'}, (args, stamp) => {
          this.initStampConnections(stamp);
        }, 'StampConnector.Generate.Stamp');
      }
      if (!this.eventHandlers.DestroyItem) {
        this.eventHandlers.DestroyItem = this.SL.Paper.on('Destroy', {}, (args, item) => {
          this.DisconnectItem(item);
        }, 'StampConnector.Destroy.Item');
      }
      if (!this.eventHandlers.LineEndTarget) {
        this.eventHandlers.LineEndTarget = this.SL.Paper.on('LineEndTarget', undefined, (args) => {
          if (args.toggle) {
            this.showTargets();
          }
          else {
            this.hideTargets();
          }
        }, 'StampConnector.LineEndTarget');
      }
      if (!this.eventHandlers.LineSegmentAdded) {
        this.eventHandlers.LineSegmentAdded = this.SL.Paper.on('LineSegmentAdded', undefined, (args) => {
          if (args.from && args.from.path && args.from.path.segments && args.from.data && args.from.data.connection) {
            // process line segments that have data.connection
            let segmentIndex = args.from.path.segments.indexOf(args.from);
            if (segmentIndex > 0 && segmentIndex < args.from.path.segments.length-1) {
              // disconnect points that are not an end point
              this.DisconnectSegment(args.from);
            }
          }
        }, 'StampConnector.LineSegmentAdded');
      }
    }
  }
  resetEventHandlers() {
    super.resetEventHandlers();
    if (!this.initialized || !this.eventHandlers) {
      return;
    }
    if (this.eventHandlers.GenerateStamp) {
      this.SL.Paper.off('Generate', this.eventHandlers.GenerateStamp.id);
      delete this.eventHandlers.GenerateStamp;
      this.eventHandlers.GenerateStamp = undefined;
    }
    if (this.eventHandlers.DestroyItem) {
      this.SL.Paper.off('Destroy', this.eventHandlers.DestroyItem.id);
      delete this.eventHandlers.DestroyItem;
      this.eventHandlers.DestroyItem = undefined;
    }
    if (this.eventHandlers.LineEndTarget) {
      this.SL.Paper.off('LineEndTarget', this.eventHandlers.LineEndTarget.id);
      delete this.eventHandlers.LineEndTarget;
      this.eventHandlers.LineEndTarget = undefined;
    }
    if (this.eventHandlers.LineSegmentAdded) {
      this.SL.Paper.off('LineSegmentAdded', this.eventHandlers.LineSegmentAdded.id);
      delete this.eventHandlers.LineSegmentAdded;
      this.eventHandlers.LineSegmentAdded = undefined;
    }
  }

  registerSnappers() {
    super.registerSnappers();
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.point = Snap.addSnapper('point', {
        priority: 250,
        callback: (point, config) => {
          return this.SnapPoint(point, config);
        }
      });
      this.Snappers.item = Snap.addSnapper('item', {
        priority: 250,
        callback: (item, config) => {
          return this.SnapItem(item, config);
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
    if (this.Snappers.point) {
      Snap.dropSnapper('point', this.Snappers.point.id);
      this.Snappers.point = undefined;
    }
    if (this.Snappers.item) {
      Snap.dropSnapper('item', this.Snappers.item.id);
      this.Snappers.item = undefined;
    }
  }

  initStampConnections(stamp) {
    if (stamp && stamp.data && stamp.data.Type == 'Stamp' && stamp.data.Stamp && stamp.data.Stamp.connections && stamp.data.Stamp.connections.length) {
      let Geo = this.SL.Utils.get('Geo');
      if (!Geo) {
        return;
      }
      stamp.data.Connections = [];
      for (let connection of stamp.data.Stamp.connections) {
        stamp.data.Connections.push({
          item: stamp,
          point: Geo.Normalize.pointToRectangle(new paper.Point({x: (connection.x || 0), y: (connection.y || 0)}), stamp.bounds),
          connected: [],
          style: connection.style,
          width: connection.width,
          height: connection.height,
          angle: connection.angle,
          lockX: connection.lockX,
          lockY: connection.lockY
        });
      }
    }
  }

  drawItemTargets(item) {
    if (item && item.data && item.data.Type == 'Stamp' && item.data.Connections) {
      for (let connection of item.data.Connections) {
        this.drawItemTarget(item, connection);
      }
    }
  }

  SnapPoint(point, config) {
    if (config && config.context == 'line-point') {
      let snappedTo, snappedOffset;
      for (let targetUI of this.UI.Targets) {
        if (this.isTargetHit(targetUI, config.original, config.interactive)) {
          snappedOffset = new paper.Point();
          if (targetUI.data && targetUI.data.target) {
            let checkPoint = config.original.clone();

            let rotation, rotationPoint;
            if (targetUI.data.item && targetUI.data.item.rotation) {
              rotation = targetUI.data.item.rotation;
              rotationPoint = targetUI.data.item.bounds.center;
              targetUI.rotate(-rotation, rotationPoint);
              checkPoint.set(checkPoint.rotate(-rotation, rotationPoint));
            }

            if (targetUI.data.target.lockX === false) {
              snappedOffset.x = (checkPoint.x - targetUI.bounds.left) / targetUI.bounds.width * 2.0 - 1.0;
            }
            if (targetUI.data.target.lockY === false) {
              snappedOffset.y = (checkPoint.y - targetUI.bounds.top) / targetUI.bounds.height * 2.0 - 1.0;
            }

            if (rotation) {
              targetUI.rotate(rotation, rotationPoint);
              checkPoint.set(checkPoint.rotate(rotation, rotationPoint));
            }
          }
          point.set(this.globalTargetPoint(targetUI.data.target, targetUI.data.target.item, snappedOffset));
          snappedTo = targetUI;
        }
        else if (config.segment && config.segment.data && targetUI.data && config.segment.data.connection == targetUI.data.target) {
          this.DisconnectSegment(config.segment, targetUI.data.target);
        }        
      }
      if (!config.interactive && snappedTo && config.segment) {
        this.ConnectSegment(config.segment, snappedTo.data.target, snappedOffset);
      }
    }
    return point;
  }
  SnapItem(item, config) {
    if (item.segments) {
      this.SnapItemSegments(item, config);
    }
    if (item.data && item.data.Connections) {
      this.SnapItemConnections(item, config);
    }
    return item;
  }
  SnapItemSegments(item, config) {
    if (item.segments) {
      for (let segment of item.segments) {
        if (segment.point && segment.data && segment.data.connection && segment.data.connection.item) {
          segment.point.set(this.globalTargetPoint(segment.data.connection, segment.data.connection.item, segment.data.connectionOffset));
        }
      }
    }
  }
  SnapItemConnections(item, config) {
    if (item.data && item.data.Connections) {
      for (let connection of item.data.Connections) {
        for (let connected of connection.connected) {
          if (connected.point) {
            connected.point.set(this.globalTargetPoint(connection, item, (connected.data && connected.data.connectionOffset)));
          }
        }
      }
    }
  }

  ConnectSegment(segment, target, offset) {
    if (!segment || !target) {
      return;
    }
    if (!segment.data) {
      segment.data = {};
    }
    segment.data.connectionOffset = offset;
    if (segment.data.connection == target) {
      return;
    }
    if (segment.data.connection) {
      this.DisconnectSegment(segment);
    }
    segment.data.connection = target;
    if (!target.connected) {
      target.connected = [];
    }
    if (target.connected.indexOf(segment) == -1) {
      target.connected.push(segment);
    }
  }
  DisconnectSegment(segment, target) {
    if (segment && segment.data && segment.data.connection && (!target || segment.data.connection == target)) {
      let target = segment.data.connection;
      let segmentIdx = target.connected.indexOf(segment);
      if (segmentIdx != -1) {
        target.connected.splice(segmentIdx, 1);
      }
      segment.data.connection = undefined;
    }
  }
  DisconnectItem(item) {
    let disconnect = [];
    if (item && item.segments) {
      this.DisconnectItemSegments(item);
    }
    if (item && item.data && item.data.Connections) {
      this.DisconnectItemConnections(item);
    }
  }
  DisconnectItemSegments(item) {
    if (item && item.segments) {
      for (let segment of item.segments) {
        if (segment && segment.data && segment.data.connection) {
          this.DisconnectSegment(segment, segment.data.connection);
        }
      }
    }
  }
  DisconnectItemConnections(item) {
    if (item && item.data && item.data.Connections) {
      for (let connection of item.data.Connections) {
        if (connection.connected) {
          for (let connected of connection.connected) {
            if (connected.data && connected.data.connection == connection) {
              connected.data.connection = undefined;
              delete connected.data.connection;
            }
          }
          connection.connected.length = 0;
        }
      }
    }
  }
}
