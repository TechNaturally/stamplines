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
    if (!config.connection.default) {
      config.connection.default = {};
    }
    if (!config.connection.default.type) {
      config.connection.default.type = paper.Shape.Ellipse;
    }
    if (config.connection.default.radius == undefined) {
      config.connection.default.radius = 10;
    }

    if (config.connection.hitScale == undefined) {
      config.connection.hitScale = { x: 1.0, y: 1.0 };
    }

    if (!config.connection.style) {
      config.connection.style = {};
    }
    if (config.connection.style.strokeColor == undefined) {
      config.connection.style.strokeColor = config.color;
    }
    if (config.connection.style.strokeJoin == undefined) {
      config.connection.style.strokeJoin = 'round';
    }
    if (config.connection.style.fillColor == undefined) {
      config.connection.style.fillColor = '#FFFFFF';
    }
    if (config.connection.style.strokeColor == undefined) {
      config.connection.style.strokeColor = config.connection.color;
    }
    if (config.connection.style.strokeWidth == undefined) {
      config.connection.style.strokeWidth = 2;
    }
    if (config.connection.style.opacity == undefined) {
      config.connection.style.opacity = 0.9;
    }
    if (config.connection.style.cornerRadius == undefined) {
      config.connection.style.cornerRadius = 10;
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
    if (this.Snappers.item) {
      Snap.dropSnapper('item', this.Snappers.item.id);
      this.Snappers.item = undefined;
    }
  }
  snapPoint(point, config) {
    if (config && config.context == 'line-point') {
      let snappedTo, snappedOffset;
      for (let connectionUI of this.UI.Connections) {
        let checkConnection = connectionUI.clone({insert:false});
        if (config.interactive) {
          let hitScale = this.config.ui.connection.hitScale;
          if (checkConnection.data && checkConnection.data.hitScale) {
            hitScale = checkConnection.data.hitScale;
          }
          checkConnection.scale(hitScale.x, hitScale.y);
        }
        if (checkConnection.hitTest(config.original)) {
          snappedOffset = new paper.Point();
          if (connectionUI.data && connectionUI.data.connection) {
            if (connectionUI.data.connection.lockX === false) {
              snappedOffset.x = (config.original.x - connectionUI.bounds.left) / connectionUI.bounds.width * 2.0 - 1.0;
            }
            if (connectionUI.data.connection.lockY === false) {
              snappedOffset.y = (config.original.y - connectionUI.bounds.top) / connectionUI.bounds.height * 2.0 - 1.0;
            }
          }
          point.set(this.globalConnectionPoint(connectionUI.data.connection, connectionUI.data.connection.item, snappedOffset));
          snappedTo = connectionUI;
        }
        else if (config.segment && config.segment.data && connectionUI.data && config.segment.data.connection == connectionUI.data.connection) {
          this.DisconnectSegment(config.segment, connectionUI.data.connection);
        }
      }
      if (!config.interactive && snappedTo && config.segment) {
        this.ConnectSegment(config.segment, snappedTo.data.connection, snappedOffset);
      }
    }
    return point;
  }
  snapItem(item, config) {
    if (item.segments) {
      for (let segment of item.segments) {
        if (segment.point && segment.data && segment.data.connection && segment.data.connection.item) {
          segment.point.set(this.globalConnectionPoint(segment.data.connection, segment.data.connection.item, segment.data.connectionOffset));
        }
      }
    }
    if (item.data && item.data.Connections) {
      for (let connection of item.data.Connections) {
        for (let connected of connection.connected) {
          if (connected.point) {
            connected.point.set(this.globalConnectionPoint(connection, item, (connected.data && connected.data.connectionOffset)));
          }
        }
      }
    }
    return item;
  }
  ConnectSegment(segment, connection, offset) {
    if (!segment || !connection) {
      return;
    }
    if (!segment.data) {
      segment.data = {};
    }
    segment.data.connectionOffset = offset;
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
  drawConnectionsForItem(item) {
    if (item && item.data && item.data.Connections && item.data.Connections.length) {
      for (let connection of item.data.Connections) {
        // temporarily straighten item for calculations
        let rotation = item.rotation;
        let rotationPoint = item.bounds.center;
        if (rotation) {
          item.rotate(-rotation, rotationPoint);
        }

        // calculate the actual connection point
        let connectionPoint = this.globalConnectionPoint(connection, item);
        let connectShape = this.config.ui.connection.default.type;

        // configure the connection point
        let connectConfig = {
          position: connectionPoint,
          width: this.config.ui.connection.default.radius*2.0,
          height: this.config.ui.connection.default.radius*2.0
        };

        // handle custom widths and heights
        if (connection.width > 0 || connection.height > 0) {
          connectShape = paper.Shape.Rectangle;
          if (connection.width > 0) {
            if (connection.width <= 1.0) {
              connectConfig.width = item.bounds.width * connection.width;
            }
            else {
              connectConfig.width = connection.width;
            }
          }
          if (connection.height > 0) {
            if (connection.height <= 1.0) {
              connectConfig.height = item.bounds.height * connection.height;
            }
            else {
              connectConfig.height = connection.height;
            }
          }
        }

        // configure the connection point style
        let connectStyle = $.extend({}, this.config.ui.connection.style, connection.style);
        if (connectStyle.cornerRadius) {
          if (connectShape == paper.Shape.Rectangle) {
            connectStyle.radius = connectStyle.cornerRadius;
          }
          connectStyle.cornerRadius = undefined;
          delete connectStyle.cornerRadius;
        }

        // rotate item back
        if (rotation) {
          item.rotate(rotation, rotationPoint);
        }

        // create the connection point
        let connectionUI = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:this.SL.Paper.Layers['UI_FG']+5}, connectShape, connectConfig);
        this.SL.Paper.applyStyle(connectionUI, connectStyle);

        // the cornerRadius style would mess up width and height, so fix it here
        if (connectShape == paper.Shape.Rectangle && connectStyle.radius) {
          if (connectConfig.width) {
            connectionUI.bounds.width = connectConfig.width;
          }
          if (connectConfig.height) {
            connectionUI.bounds.height = connectConfig.height;
          }
          // make sure it stays at position
          connectionUI.bounds.center = connectionPoint;
        }

        // rotate the connection point with the item
        if (item.rotation) {
          connectionUI.rotate(item.rotation, item.bounds.center);
        }

        // local rotation offset for the connection point
        if (connection.angle) {
          connectionUI.rotate(connection.angle);
        }

        // link it to the item and track it
        connectionUI.data.item = item;
        connectionUI.data.connection = connection;
        this.UI.Connections.push(connectionUI);
      }
    }
  }
  globalConnectionPoint(connection, item, offset) {
    let Geo = this.SL.Utils.get('Geo');
    if (item && connection && Geo) {
      let rotation = item.rotation;
      let rotationPoint = item.bounds.center;
      if (rotation) {
        item.rotate(-rotation, rotationPoint);
      }
      let point = Geo.Normalize.pointFromRectangle(connection.point, item.bounds);
      if (offset && (offset.x || offset.y)) {
        let connectionRect = {
          width: this.config.ui.connection.default.radius*2.0,
          height: this.config.ui.connection.default.radius*2.0
        };
        if (connection.width > 0.0) {
          if (connection.width <= 1.0) {
            connectionRect.width = connection.width * item.bounds.width;
          }
          else {
            connectionRect.width = connection.width;
          }
        }
        if (connection.height > 0.0) {
          if (connection.height <= 1.0) {
            connectionRect.height = connection.height * item.bounds.height;
          }
          else {
            connectionRect.height = connection.height;
          }
        }
        if (offset.x) {
          point.x += (connectionRect.width * offset.x * 0.5);
        }
        if (offset.y) {
          point.y += (connectionRect.height * offset.y * 0.5);
        }
      }
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
