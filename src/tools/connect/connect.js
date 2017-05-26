import Tool from '../../core/tool.js';
export class Connect extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.eventHandlers = {};
    this.UI = {
      Connections: []
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
    if (config.color == undefined) {
      config.color = '#0066AA';
    }
    if (!config.connection) {
      config.connection = {};
    }
    if (config.connection.radius == undefined) {
      config.connection.radius = 8;
    }
    if (config.connection.color == undefined) {
      config.connection.color = config.color;
    }
    if (config.connection.fillColor == undefined) {
      config.connection.fillColor = '#FFFFFF';
    }
    if (config.connection.strokeColor == undefined) {
      config.connection.strokeColor = config.connection.color;
    }
    if (config.connection.strokeWidth == undefined) {
      config.connection.strokeWidth = 2;
    }
    if (config.connection.opacity == undefined) {
      config.connection.opacity = 0.9;
    }
    if (config.connection.hitScale == undefined) {
      config.connection.hitScale = { x: 1.0, y: 1.0 };
    }
  }
  initEventHandlers() {
    if (!this.initialized) {
      return;
    }
    if (this.SL.Paper) {
      if (!this.eventHandlers.GenerateStamp) {
        this.eventHandlers.GenerateStamp = this.SL.Paper.on('Generate', {Type: 'Stamp'}, (args, stamp) => {
          this.initStampConnections(stamp);
        }, 'Connect.Generate.Stamp');
      }
      if (!this.eventHandlers.DestroyItem) {
        this.eventHandlers.DestroyItem = this.SL.Paper.on('Destroy', {}, (args, item) => {
          this.DisconnectItem(item);
        }, 'Connect.Destroy.Item');
      }
      if (!this.eventHandlers.LineEndTarget) {
        this.eventHandlers.LineEndTarget = this.SL.Paper.on('LineEndTarget', undefined, (args) => {
          if (args.toggle) {
            this.showConnections();
          }
          else {
            this.hideConnections();
          }
        }, 'Connect.LineEndTarget');
      }
      if (!this.eventHandlers.LineSegmentAdded) {
        this.eventHandlers.LineSegmentAdded = this.SL.Paper.on('LineSegmentAdded', undefined, (args) => {
          if (args.from && args.from.path && args.from.path.segments && args.from.data && args.from.data.connection) {
            let segmentIndex = args.from.path.segments.indexOf(args.from);
            if (segmentIndex > 0 && segmentIndex < args.from.path.segments.length-1) {
              this.DisconnectSegment(args.from);
            }
          }
        }, 'Connect.LineSegmentAdded');
      }
    }
  }
  reset() {
    super.reset();
    this.resetEventHandlers();
    this.unregisterSnappers();
    this.resetUI();
  }
  resetEventHandlers() {
    if (!this.initialized) {
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
  resetUI() {
    this.resetUIConnections();
  }
  resetUIConnections() {
    for (let connection of this.UI.Connections) {
      this.SL.Paper.destroyPaperItem(connection);
    }
    this.UI.Connections.length = 0;
  }

  registerSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.point = Snap.addSnapper('point', {
        priority: 250,
        callback: (point, config) => {
          return this.snapPoint(point, config);
        }
      });
      this.Snappers.item = Snap.addSnapper('item', {
        priority: 250,
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
    if (this.Snappers.point) {
      Snap.dropSnapper('point', this.Snappers.point.id);
      this.Snappers.point = undefined;
    }
  }
  snapPoint(point, config) {
    if (config && config.context == 'line-point') {
      let snappedTo;
      for (let connectionUI of this.UI.Connections) {
        let checkConnection = connectionUI.clone({insert:false});
        if (config.interactive) {
          checkConnection.scale(this.config.ui.connection.hitScale.x, this.config.ui.connection.hitScale.y);
        }
        if (checkConnection.hitTest(config.original)) {
          point.set(connectionUI.position);
          snappedTo = connectionUI;
        }
        else if (config.segment && config.segment.data && connectionUI.data && config.segment.data.connection == connectionUI.data.connection) {
          this.DisconnectSegment(config.segment, connectionUI.data.connection);
        }
      }
      if (!config.interactive && snappedTo && config.segment) {
        this.ConnectSegment(config.segment, snappedTo.data.connection);
      }
    }
    return point;
  }
  snapItem(item, config) {
    if (item.segments) {
      for (let segment of item.segments) {
        if (segment.point && segment.data && segment.data.connection && segment.data.connection.item) {
          segment.point.set(this.globalConnectionPoint(segment.data.connection, segment.data.connection.item));
        }
      }
    }
    if (item.data && item.data.Connections) {
      for (let connection of item.data.Connections) {
        for (let connected of connection.connected) {
          if (connected.point) {
            connected.point.set(this.globalConnectionPoint(connection, item));
          }
        }
      }
    }
    return item;
  }
  ConnectSegment(segment, connection) {
    if (!segment || !connection) {
      return;
    }
    if (!segment.data) {
      segment.data = {};
    }
    if (segment.data.connection == connection) {
      return;
    }
    if (segment.data.connection) {
      this.DisconnectSegment(segment);
    }
    segment.data.connection = connection;
    if (!connection.connected) {
      connection.connected = [];
    }
    if (connection.connected.indexOf(segment) == -1) {
      connection.connected.push(segment);
    }
  }
  DisconnectSegment(segment, connection) {
    if (segment && segment.data && segment.data.connection && (!connection || segment.data.connection == connection)) {
      let connection = segment.data.connection;
      let segmentIdx = connection.connected.indexOf(segment);
      if (segmentIdx != -1) {
        connection.connected.splice(segmentIdx, 1);
      }
      segment.data.connection = undefined;
    }
  }
  DisconnectItem(item) {
    let disconnect = [];
    if (item && item.segments) {
      for (let segment of item.segments) {
        if (segment && segment.data && segment.data.connection) {
          this.DisconnectSegment(segment, segment.data.connection);
        }
      }
    }
    if (item && item.data) {
      if (item.data.Connections) {
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

  initStampConnections(stamp) {
    if (stamp && stamp.data && stamp.data.Stamp && stamp.data.Stamp.connections && stamp.data.Stamp.connections.length) {
      let Geo = this.SL.Utils.get('Geo');
      if (!Geo) {
        return;
      }
      stamp.data.Connections = [];
      for (let connection of stamp.data.Stamp.connections) {
        stamp.data.Connections.push({
          item: stamp,
          point: Geo.Normalize.pointToRectangle(new paper.Point(connection), stamp.bounds),
          connected: []
        });
      }
    }
  }
  drawConnectionsForItem(item) {
    if (item && item.data && item.data.Connections && item.data.Connections.length) {
      for (let connection of item.data.Connections) {
        let connectionPoint = this.globalConnectionPoint(connection, item);
        let connectionUI = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:this.SL.Paper.Layers['UI_FG']+5}, paper.Shape.Circle, connectionPoint, 10);
        this.SL.Paper.applyStyle(connectionUI, this.config.ui.connection);
        connectionUI.data.item = item;
        connectionUI.data.connection = connection;
        this.UI.Connections.push(connectionUI);
      }
    }
  }
  globalConnectionPoint(connection, item) {
    let Geo = this.SL.Utils.get('Geo');
    if (item && connection && Geo) {
      let rotation = item.rotation;
      let rotationPoint = item.bounds.center;
      if (rotation) {
        item.rotate(-rotation, rotationPoint);
      }
      let point = Geo.Normalize.pointFromRectangle(connection.point, item.bounds);
      if (rotation) {
        item.rotate(rotation, rotationPoint);
        point = point.rotate(rotation, rotationPoint);
      }
      return point;
    }
  }
  showConnections() {
    this.SL.Paper.Item.forEachOfClass('Content', (item, args) => {
      if (item && item.data && item.data.Connections && item.data.Connections.length) {
        this.drawConnectionsForItem(item);
      }
    });
  }
  hideConnections() {
    this.resetUIConnections();
  }
}
