import Util from '../../core/util.js';
export class Snap extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'Snap';

    this.Snappers = {
      point: { map: {}, order: [] },
      pointMin: { map: {}, order: [] },
      pointMax: { map: {}, order: [] },
      rectangle: { map: {}, order: [] },
      rotation: { map: {}, order: [] }
    };
  }
  reset() {
    super.reset();
    for (let type in this.Snappers) {
      this.Snappers[type].map = {};
      this.Snappers[type].order = [];
    }
  }

  Equal(value1, value2, threshold=1.0/10000000.0) {
    return (value1 >= value2-threshold && value1 <= value2+threshold);
  }
  Point(point, config={}) {
    return this.runSnappers('point', new paper.Point(point), config);
  }
  PointMin(point, config={}) {
    return this.runSnappers('pointMin', new paper.Point(point), config);
  }
  PointMax(point, config={}) {
    return this.runSnappers('pointMax', new paper.Point(point), config);
  }
  Rectangle(rectangle, config={}) {
    return this.runSnappers('rectangle', new paper.Rectangle(rectangle), config);
  }
  Rotation(angle, config={}) {
    if (!config.angleIncrement && config.slices) {
      config.angleIncrement = 360.0/config.slices;
    }
    if (config.angleIncrement) {
      angle = Math.round(angle / config.angleIncrement) * config.angleIncrement;
    }
    return this.runSnappers('rotation', angle, config);
  }

  addSnapper(type, config) {
    if (!this.hasSnapperType(type)) {
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
      config.id = ID.getUnique((config.id || type.toLowerCase()), this.Snappers[type].map);
    }
    if (config.id) {
      if (!this.Snappers[type].map[config.id]) {
        this.Snappers[type].map[config.id] = config;
        if (this.Snappers[type].order.indexOf(config.id) == -1) {
          this.Snappers[type].order.push(config.id);
        }
        this.refreshSnapperOrder(type);
      }
      this.Snappers[type].map[config.id].id = config.id;
      return this.Snappers[type].map[config.id];
    }
  }
  dropSnapper(type, id) {
    if (!this.hasSnapperType(type)) {
      throw `Cannot drop Snapper of invalid type: "${type}"!`;
    }
    if (id) {
      let orderIdx = this.Snappers[type].order.indexOf(id);
      if (orderIdx != -1) {
        this.Snappers[type].order.splice(orderIdx, 1);
      }
      let snapper = this.Snappers[type].map[id];
      this.Snappers[type].map[id] = undefined;
      delete this.Snappers[type].map[id];
      return snapper;
    }
  }
  hasSnapperType(type) {
    return !!(this.Snappers[type] && this.Snappers[type].map && this.Snappers[type].order);
  }
  refreshSnapperOrder(type) {
    if (this.hasSnapperType(type)) {
      this.Snappers[type].order.sort((id1, id2) => {
        let prio1 = this.Snappers[type].map[id1].priority;
        let prio2 = this.Snappers[type].map[id2].priority;
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
  runSnappers(type, value, config={}) {
    if (this.hasSnapperType(type)) {
      this.Snappers[type].order.forEach((id) => {
        let snapper = this.Snappers[type].map[id];
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
}
