import Util from '../../core/util.js';
export class Geo extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'Geo';
    this.initDirection();
    this.configure();
    this.initialized = true;
  }
  reset() {
    super.reset();
    this.resetDirection();
  }
  initDirection() {
    this.resetDirection();
    let self = this;
    this.Direction = {
      VectorMap: {
        'N': new paper.Point(0.0, -1.0),
        'S': new paper.Point(0.0, 1.0),
        'E': new paper.Point(1.0, 0.0),
        'W': new paper.Point(-1.0, 0.0),
        'NE': new paper.Point(1.0, -1.0),
        'SW': new paper.Point(-1.0, 1.0),
        'SE': new paper.Point(1.0, 1.0),
        'NW': new paper.Point(-1.0, -1.0)
      },
      vector: function(direction, magnitude=1.0) {
        let vector = this.VectorMap[direction];
        if (vector) {
          vector = vector.multiply(magnitude);
        }
        return vector;
      },
      equal: function(vect1, vect2) {
        let Snap = self.SL.Utils.get('Snap');
        return (Snap ? Snap.Equal(vect1.angle, vect2.angle) : (vect1 == vect2));
      },
      edgePoint: function(edge, rectangle, opposite=false) {
        let result = rectangle.center.clone();
        if (edge.x < 0) {
          result.x = (opposite ? rectangle.right : rectangle.left);
        }
        else if (edge.x > 0) {
          result.x = (opposite ? rectangle.left : rectangle.right);
        }
        if (edge.y < 0) {
          result.y = (opposite ? rectangle.bottom : rectangle.top);
        }
        else if (edge.y > 0) {
          result.y = (opposite ? rectangle.top : rectangle.bottom);
        }
        return result;
      }
    };
  }
  resetDirection() {
    if (!this.initialized || !this.Direction) {
      return;
    }
    if (this.Direction.VectorMap) {
      let directions = Object.keys(this.Direction.VectorMap);
      for (let direction of directions) {
        this.Direction.VectorMap[direction] = undefined;
      }
    }
    this.Direction = undefined;
  }
};
export default Geo;
