import Util from '../../core/util.js';
export class Snap extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'Snap';
    this.Snappers = {};
    this.Snaps = {
      item: { map: {}, order: [] },
      point: { map: {}, order: [] },
      pointMin: { map: {}, order: [] },
      pointMax: { map: {}, order: [] },
      rectangle: { map: {}, order: [] },
      rotation: { map: {}, order: [] }
    };
    this.configure();
  }
  configure(config) {
    config = super.configure(config);
    this.registerSnappers();
    return config;
  }
  reset() {
    super.reset();
    this.unregisterSnappers();
    for (let type in this.Snaps) {
      this.Snaps[type].map = {};
      this.Snaps[type].order = [];
    }
  }

  Around(target, value, threshold=1.0/10000000.0) {
    if (value >= (target-threshold) && value <= (target+threshold)) {
      return target;
    }
    return value;
  }
  Equal(value1, value2, threshold=1.0/10000000.0) {
    return (this.Around(value2, value1, threshold) == value2);
  }
  Item(item, config={}) {
    // support for items to supply a custom Snapping method
    if (this.SL.Paper.Item.hasCustomMethod(item, 'SnapItem')) {
      return this.SL.Paper.Item.callCustomMethod(item, 'SnapItem', config);
    }
    return this.runSnappers('item', item, $.extend(config, {original: item.clone({insert:false})}));
  }
  Point(point, config={}) {
    return this.runSnappers('point', new paper.Point(point), $.extend(config, {original: point}));
  }
  PointMin(point, config={}) {
    return this.runSnappers('pointMin', new paper.Point(point), $.extend(config, {original: point}));
  }
  PointMax(point, config={}) {
    return this.runSnappers('pointMax', new paper.Point(point), $.extend(config, {original: point}));
  }
  PointsEqual(point1, point2, threshold=1.0/10000000.0) {
    return (this.Equal(point1.x, point2.x, threshold) && this.Equal(point1.y, point2.y, threshold));
  }
  Rectangle(rectangle, config={}) {
    return this.runSnappers('rectangle', new paper.Rectangle(rectangle), $.extend(config, {original: rectangle}));
  }
  Rotation(angle, config={}) {
    return this.runSnappers('rotation', angle, $.extend(config, {original: angle}));
  }

  addSnapper(type, config) {
    if (!this.hasSnapType(type)) {
      throw `Cannot add Snapper of invalid type: "${type}"!`;
    }
    if (!config) {
      throw 'Cannot add a Snapper with no configuration!';
    }
    if (typeof config.callback != 'function') {
      throw 'Cannot add a Snapper with no callback!';
    }
    let ID = this.SL.Utils.gets('Identity');
    if (ID) {
      config.id = ID.getUnique((config.id || type.toLowerCase()), this.Snaps[type].map);
    }
    if (config.id) {
      if (!this.Snaps[type].map[config.id]) {
        this.Snaps[type].map[config.id] = config;
        if (this.Snaps[type].order.indexOf(config.id) == -1) {
          this.Snaps[type].order.push(config.id);
        }
        this.refreshSnapOrder(type);
      }
      this.Snaps[type].map[config.id].id = config.id;
      return this.Snaps[type].map[config.id];
    }
  }
  runSnappers(type, value, config={}) {
    if (this.hasSnapType(type)) {
      this.Snaps[type].order.forEach((id) => {
        let snapper = this.Snaps[type].map[id];
        if (typeof snapper.callback == 'function') {
          let newValue = snapper.callback(value, config);
          if (newValue !== undefined) {
            value = newValue;
          }
        }
      });
      return value;
    }
  }
  dropSnapper(type, id) {
    if (!this.hasSnapType(type)) {
      throw `Cannot drop Snapper of invalid type: "${type}"!`;
    }
    if (id) {
      let orderIdx = this.Snaps[type].order.indexOf(id);
      if (orderIdx != -1) {
        this.Snaps[type].order.splice(orderIdx, 1);
      }
      let snapper = this.Snaps[type].map[id];
      this.Snaps[type].map[id] = undefined;
      delete this.Snaps[type].map[id];
      return snapper;
    }
  }
  hasSnapType(type) {
    return !!(this.Snaps[type] && this.Snaps[type].map && this.Snaps[type].order);
  }
  refreshSnapOrder(type) {
    if (this.hasSnapType(type)) {
      this.Snaps[type].order.sort((id1, id2) => {
        let prio1 = this.Snaps[type].map[id1].priority;
        let prio2 = this.Snaps[type].map[id2].priority;
        if ((prio1 == -1 || prio1 === undefined) && prio2 >= 0) {
          return 1;
        }
        else if ((prio2 == -1 || prio2 === undefined) && prio1 >= 0) {
          return -1;
        }
        return (prio1 - prio2);
      });
    }
  }
  
  snapRotation(angle, config={}) {
    if (!config.angleIncrement && config.slices) {
      config.angleIncrement = 360.0/config.slices;
    }
    if (config.angleIncrement) {
      angle = Math.round(angle / config.angleIncrement) * config.angleIncrement;
    }
    return angle;
  }
  registerSnappers() {
    let Snap = this;
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.rotation = Snap.addSnapper('rotation', {
        priority: 0,
        callback: (angle, config) => {
          return this.snapRotation(angle, config);
        }
      });
    }
  }
  unregisterSnappers() {
    let Snap = this;
    if (!Snap || !this.Snappers) {
      return;
    }
    if (this.Snappers.item) {
      Snap.dropSnapper('item', this.Snappers.item.id);
      this.Snappers.item = undefined;
    }
    if (Snap && this.Snappers.rotation) {
      Snap.dropSnapper('rotation', this.Snappers.rotation.id);
      this.Snappers.rotation = undefined;
    }
  }
}
