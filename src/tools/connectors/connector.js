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

  registerSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
    }
  }
  unregisterSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (!Snap || !this.Snappers) {
      return;
    }
  }

  resetUI() {
    this.resetUITargets();
  }
  resetUITargets() {
    for (let target of this.UI.Targets) {
      this.SL.Paper.destroyPaperItem(target);
    }
    this.UI.Targets.length = 0;
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

  drawRectangleItemTarget(item, target) {
    // calculate the actual target point
    let targetPoint = this.globalTargetPoint(target, item);
    let targetShape = this.config.ui.target.default.type;

    // configure the target point
    let targetConfig = {
      position: targetPoint,
      width: this.config.ui.target.default.radius*2.0,
      height: this.config.ui.target.default.radius*2.0
    };

    // handle custom widths and heights
    if (target.width > 0 || target.height > 0) {
      targetShape = paper.Shape.Rectangle;
      if (target.width > 0) {
        if (target.width <= 1.0) {
          targetConfig.width = item.bounds.width * target.width;
        }
        else {
          targetConfig.width = target.width;
        }
      }
      if (target.height > 0) {
        if (target.height <= 1.0) {
          targetConfig.height = item.bounds.height * target.height;
        }
        else {
          targetConfig.height = target.height;
        }
      }
    }

    // configure the target point style
    let targetStyle = $.extend({}, this.config.ui.target.style, target.style);
    if (targetStyle.cornerRadius) {
      if (targetShape == paper.Shape.Rectangle) {
        targetStyle.radius = targetStyle.cornerRadius;
      }
      targetStyle.cornerRadius = undefined;
      delete targetStyle.cornerRadius;
    }

    // create the target point
    let targetUI = this.SL.Paper.generatePaperItem({Source: this, Class:'UI', Layer:this.SL.Paper.Layers['UI_FG']+5}, targetShape, targetConfig);
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
  drawLineItemTarget(item, target) {
    console.log('DRAW TARGET ON LINE =>', item, target);
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
  globalTargetPoint(target, item, offset) {
    let Geo = this.SL.Utils.get('Geo');
    if (item && target && Geo) {
      let rotation = item.rotation;
      let rotationPoint = item.bounds.center;
      if (rotation) {
        item.rotate(-rotation, rotationPoint);
      }
      let point = Geo.Normalize.pointFromRectangle(target.point, item.bounds);
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
      if (rotation) {
        item.rotate(rotation, rotationPoint);
        point = point.rotate(rotation, rotationPoint);
      }
      return point;
    }
  }
  isTargetHit(target, point, hitScaling=true) {
    let checkTarget = target.clone({insert:false});
    if (hitScaling) {
      let hitScale = this.config.ui.target.hitScale;
      if (checkTarget.data && checkTarget.data.hitScale) {
        hitScale = checkTarget.data.hitScale;
      }
      checkTarget.scale(hitScale.x, hitScale.y);
    }
    return checkTarget.hitTest(point);
  }
}
