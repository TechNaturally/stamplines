import Util from '../../core/util.js';
export class Bounds extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'Bounds';
    this.configure();
  }
  reset() {
    super.reset();
    this.unregisterSnappers();
  }

  configure(config) {
    config = super.configure(config);

    this.setPadding(config.padding);

    this.elemenet = $(config.element);

    this.registerSnappers();

    return this.config;
  }

  setPadding(padding=0) {
    if (!this.padding) {
      this.padding = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };
    }
    if (padding && padding.constructor === Array) {
      if (padding.length > 0) {
        this.padding.top = padding[0];
        this.padding.right = (padding.length > 1) ? padding[1] : this.padding.top;
        this.padding.bottom = (padding.length > 2) ? padding[2] : this.padding.top;
        this.padding.left = (padding.length > 3) ? padding[3] : this.padding.right;
      }
    }
    else if (typeof padding == 'object') {
      this.padding.top = padding.top || this.padding.top;
      this.padding.right = padding.right || this.padding.right;
      this.padding.bottom = padding.bottom || this.padding.bottom;
      this.padding.left = padding.left || this.padding.left;
    }
    else {
      this.padding.top = this.padding.right = this.padding.bottom = this.padding.left = (padding || 0);
    }
  }

  snapPoint(point, config) {
    let shift = {x: 0, y: 0};
    let check;

    // check horizontal
    check = ((this.SL.Paper.view.size.width-this.padding.right) - (shift.x+point.x));
    if (check < 0) {
      shift.x = check;
    }
    check = (this.padding.left - (shift.x+point.x));
    if (check > 0) {
      shift.x = check;
    }

    // check vertical
    check = ((this.SL.Paper.view.size.height-this.padding.bottom) - (shift.y+point.y));
    if (check < 0) {
      shift.y = check;
    }
    check = (this.padding.top - (shift.y+point.y));
    if (check > 0) {
      shift.y = check;
    }

    // apply shift
    point.set({
      x: point.x + shift.x,
      y: point.y + shift.y
    });
    return point;
  }
  snapPointMin(point, config) {
    point.set({
      x: this.padding.left,
      y: this.padding.top
    });
    return point;
  }
  snapPointMax(point, config) {
    point.set({
      x: (this.SL.Paper.view.size.width-this.padding.right),
      y: (this.SL.Paper.view.size.height-this.padding.bottom)
    });
    return point;
  }
  snapRectangle(rectangle, config) {
    let shift = {x: 0, y: 0};
    let point = new paper.Point(0, 0);
    point.set({
      x: shift.x + rectangle.right,
      y: shift.y + rectangle.bottom
    });
    this.snapPoint(point, config);
    shift.x = point.x - (shift.x + rectangle.right);
    shift.y = point.y - (shift.y + rectangle.bottom);
    rectangle.set({
      x: rectangle.x + shift.x,
      y: rectangle.y + shift.y,
      width: rectangle.width,
      height: rectangle.height
    });

    point.set({
      x: shift.x + rectangle.left,
      y: shift.y + rectangle.top
    });
    this.snapPoint(point, config);
    shift.x = point.x - (shift.x + rectangle.left);
    shift.y = point.y - (shift.y + rectangle.top);
    rectangle.set({
      x: rectangle.x + shift.x,
      y: rectangle.y + shift.y,
      width: rectangle.width,
      height: rectangle.height
    });
    return rectangle;
  }

  registerSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.point = Snap.addSnapper('point', {
        priority: 100,
        callback: (point, config) => {
          return this.snapPoint(point, config);
        }
      });
      this.Snappers.pointMin = Snap.addSnapper('pointMin', {
        priority: 100,
        callback: (point, config) => {
          return this.snapPointMin(point, config);
        }
      });
      this.Snappers.pointMax = Snap.addSnapper('pointMax', {
        priority: 100,
        callback: (point, config) => {
          return this.snapPointMax(point, config);
        }
      });
      this.Snappers.rectangle = Snap.addSnapper('rectangle', {
        priority: 100,
        callback: (rectangle, config) => {
          return this.snapRectangle(rectangle, config);
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
    if (this.Snappers.pointMin) {
      Snap.dropSnapper('pointMin', this.Snappers.pointMin.id);
      this.Snappers.pointMin = undefined;
    }
    if (this.Snappers.pointMax) {
      Snap.dropSnapper('pointMax', this.Snappers.pointMax.id);
      this.Snappers.pointMax = undefined;
    }
    if (Snap && this.Snappers.rectangle) {
      Snap.dropSnapper('rectangle', this.Snappers.rectangle.id);
      this.Snappers.rectangle = undefined;
    }
  }
}
