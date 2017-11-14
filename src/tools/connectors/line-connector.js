import {Connector} from './connector.js';
export class LineConnector extends Connector {
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
          this.InitConnections(stamp);
        }, 'LineConnector.Generate.Stamp');
      }
      if (!this.eventHandlers.DestroyItem) {
        this.eventHandlers.DestroyItem = this.SL.Paper.on('Destroy', {}, (args, item) => {
          this.DisconnectItem(item);
        }, 'LineConnector.Destroy.Item');
      }
      if (!this.eventHandlers.LineEndTarget) {
        this.eventHandlers.LineEndTarget = this.SL.Paper.on('LineEndTarget', undefined, (args) => {
          this.refreshTargets(args);
        }, 'LineConnector.LineEndTarget');
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
        }, 'LineConnector.LineSegmentAdded');
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
    super.registerSnappers(['point', 'item']);
  }

  InitConnections(item) {
    if (item && item.data) {
      if (item.data.Type == 'Stamp') {
        this.initStampConnections(item);
      }
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

  shouldShowTargets(args) {
    return args.toggle;
  }
  drawItemTargets(item) {
    if (item && item.data && item.data.Connections) {
      for (let connection of item.data.Connections) {
        this.drawItemTarget(item, connection);
      }
    }
  }

  shouldSnapPoint(point, config) {
    return (config && config.context == 'line-point');
  }

  shouldSnapItem(item, config) {
    return (item && (item.segments || (item.data && item.data.Connections)));
  }
  SnapItem(item, config) {
    if (this.shouldSnapItem(item, config)) {
      if (item.segments) {
        this.SnapItemSegments(item, config);
      }
      if (item.data && item.data.Connections) {
        this.SnapItemConnections(item, config);
      }
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
  }
  DisconnectSegment(segment, target) {
  }
  DisconnectItem(item) {
  }
  DisconnectItemSegments(item) {
  }
  DisconnectItemConnections(item) {
  }
}
