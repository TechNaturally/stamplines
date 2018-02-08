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
        this.eventHandlers.DestroyItem = this.SL.Paper.on('Destroy', {Type: ['Stamp', 'Line']}, (args, item) => {
          this.DisconnectItem(item);
        }, 'LineConnector.Destroy.Item');
      }
      if (!this.eventHandlers.LineEndTarget) {
        this.eventHandlers.LineEndTarget = this.SL.Paper.on('LineEndTarget', undefined, (args) => {
          this.refreshTargets(args, 'LineEndTarget');
        }, 'LineConnector.LineEndTarget');
      }
      if (!this.eventHandlers.LineSegmentAdded) {
        this.eventHandlers.LineSegmentAdded = this.SL.Paper.on('LineSegmentAdded', undefined, (args) => {
          if (args.from && args.from.path && args.from.path.segments && args.from.data && args.from.data.connected) {
            // process line segments that have data.connection
            let segmentIndex = args.from.path.segments.indexOf(args.from);
            if (segmentIndex > 0 && segmentIndex < args.from.path.segments.length-1) {
              // disconnect points that are not an end point
              // collect all targets that it is connected to
              let targets = [];
              for (let connection of args.from.data.connected) {
                // note: using DisconnectSegment here could be unsafe since it would remove entries from the array it loops over
                if (connection.segment == args.from && targets.indexOf(connection.target) == -1) {
                  targets.push(connection.target);
                }
              }
              // disconnect from all targets
              for (let target of targets) {
                this.DisconnectSegment(args.from, target);
              }
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
          id: stamp.data.Connections.length,
          item: stamp,
          point: Geo.Normalize.pointToRectangle(new paper.Point({x: (connection.x || 0), y: (connection.y || 0)}), stamp.bounds),
          connected: [],
          targetStyle: connection.targetStyle,
          width: connection.width,
          height: connection.height,
          angle: connection.angle,
          lockX: connection.lockX,
          lockY: connection.lockY
        });
      }
    }
  }

  shouldShowTargets(args, eventType) {
    return args.toggle;
  }
  drawItemTargets(item) {
    if (this.itemHasConnections(item)) {
      for (let connection of item.data.Connections) {
        this.drawItemTarget(item, connection);
      }
    }
  }
  getSegmentTargetConnectionIndex(segment, target) {
    if (target && this.segmentIsConnected(segment)) {
      let index = segment.data.connected.findIndex( (connection) => {
        return (connection && this.targetsEqual(connection.target, target));
      });
      return index;
    }
    return -1;
  }
  segmentHasTarget(target, segment) {
    return (this.getSegmentTargetConnectionIndex(segment, target) >= 0);
  }
  getTargetSegmentConnectionIndex(target, segment) {
    if (segment && target && target.connected && target.connected.length) {
      let index = target.connected.findIndex( (connection) => {
        return (connection && connection.segment == segment);
      });
      return index;
    }
    return -1;
  }
  targetHasSegment(target, segment) {
    return (this.getTargetSegmentConnectionIndex(target, segment) >= 0);
  }

  itemHasConnections(item) {
    return (item && item.data && item.data.Connections) ? true : false;
  }
  itemHasSegments(item) {
    return (item && item.segments) ? true : false;
  }
  segmentIsConnected(segment) {
    return (segment && segment.data && segment.data.connected) ? true : false;
  }

  shouldSnapPoint(point, config) {
    return (config && config.context == 'line-point');
  }

  shouldSnapItem(item, config) {
    return (item && (this.itemHasSegments(item) || this.itemHasConnections(item)));
  }
  SnapItem(item, config) {
    if (this.shouldSnapItem(item, config)) {
      if (this.itemHasSegments(item)) {
        this.SnapItemSegments(item, config);
      }
      if (this.itemHasConnections(item)) {
        this.SnapItemConnections(item, config);
      }
    }
    return item;
  }
  SnapItemSegments(item, config) {
    if (this.itemHasSegments(item)) {
      for (let segment of item.segments) {
        if (segment.point && this.segmentIsConnected(segment) && segment.data.connected.length) {
          let connection = segment.data.connected[0];
          if (connection) {
            segment.point.set(this.globalTargetPoint(connection.target, connection.target.item, connection.offset));
          }
        }
      }
    }
  }
  SnapItemConnections(item, config) {
    if (this.itemHasConnections(item)) {
      let Snap = this.SL.Utils.get('Snap');
      for (let Connection of item.data.Connections) {
        for (let connection of Connection.connected) {
          let point = this.globalTargetPoint(connection.target, connection.target.item, connection.offset);

          // update the connected line point
          connection.segment.point.set(point);

          if (Snap) {
            // run the line-point snap to allow other snappers respond to the adjusted line (ex. LabelConnector refreshes label positions)
            let snapConfig = {
              context: 'line-point',
              interactive: config.interactive,
              move: false,
              scale: false,
              segment: connection.segment
            };
            point = Snap.Point(point, snapConfig);
          }
        }
      }
    }
  }

  isTargetConnected(target, config) {
    if (target && target.data && target.data.target && config && config.segment) {
      if (this.targetHasSegment(target.data.target, config.segment)) {
        return true;
      }
    }
    return false;
  }
  ConnectPoint(target, offset, config) {
    if (target && offset && config && config.segment && config.segment.path && config.segment.path.data && config.segment.path.data.Type == 'Line') {
      this.ConnectSegment(config.segment, target, offset);
    }
  }
  DisconnectPoint(target, config) {
    if (target && config && config.segment) {
      this.DisconnectSegment(config.segment, target);
    }
  }

  ConnectSegment(segment, target, offset) {
    let connection = undefined;
    if (segment && target && target.connected) {
      // track the connection on the target
      let index = this.getTargetSegmentConnectionIndex(target, segment);
      if (index < 0) {
        // new connection
        connection = {
          target,
          segment,
          offset
        };
        target.connected.push(connection);
      }
      else if (index < target.connected.length) {
        // update existing connection
        connection = target.connected[index];
        if (connection.offset) {
          connection.offset.set(offset);
        }
        else {
          connection.offset = offset;
        }
      }

      if (connection) {
        //  track the connection on the segment
        if (!segment.data) {
          segment.data = {};
        }
        if (!segment.data.connected) {
          segment.data.connected = [];
        }
        // make sure target is only in segment's connected list once
        index = this.getSegmentTargetConnectionIndex(segment, target);
        if (index < 0) {
          segment.data.connected.push(connection);
        }
      }
    }
    return connection;
  }
  DisconnectSegment(segment, target) {
    if (segment && target && target.connected && target.connected.length) {
      let index = this.getTargetSegmentConnectionIndex(target, segment);
      if (index >= 0) {
        target.connected.splice(index, 1);
      }
    }
    if (target && this.segmentIsConnected(segment)) {
      let index = this.getSegmentTargetConnectionIndex(segment, target);
      if (index >= 0) {
        segment.data.connected.splice(index, 1);
      }
    }
    // @TODO: snap segment's point (it WAS snapped to the connection, but is now disconnected)
  }
  DisconnectItem(item) {
    if (item && item.data) {
      if (this.itemHasConnections(item)) {
        // disconnect all connected Connections
        for (let Connection of item.data.Connections) {
          if (Connection.connected && Connection.connected.length) {
            let segments = [];
            for (let connection of Connection.connected) {
              if (connection && connection.segment && connection.target) {
                if (connection.target == Connection && segments.indexOf(connection.segment) == -1) {
                  segments.push(connection.segment);
                }
              }
            }
            for (let segment of segments) {
              this.DisconnectSegment(segment, Connection);
            }
          }
        }
      }
      else if (this.itemHasSegments(item)) {
        // disconnect all segments from connected targets
        for (let segment of item.segments) {
          if (this.segmentIsConnected(segment)) {
            let targets = [];
            // loop through each Connection the segment is connected to
            for (let connection of segment.data.connected) {
              if (connection && connection.segment && connection.target) {
                if (connection.segment == segment && targets.indexOf(connection.target) == -1) {
                  targets.push(connection.target);
                }
              }
            }
            for (let target of targets) {
              this.DisconnectSegment(segment, target);
            }
          }
        }
      }
    }
  }
  DisconnectItemSegments(item) {
  }
  DisconnectItemConnections(item) {
  }
}
