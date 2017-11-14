import Util from '../../core/util.js';
export class Geo extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'Geo';
    this.configure();
    this.initialized = true;
  }
  configure(config) {
    super.configure(config);
    this.initCircle();
    this.initDirection();
    this.initLine();
    this.initNormalize();
  }
  reset() {
    super.reset();
    this.resetCircle();
    this.resetDirection();
    this.resetLine();
    this.resetNormalize();
  }
  initCircle() {
    this.resetCircle();
    this.Circle = {
      contains: function(point, center, radius) {
        return (
          Math.sqrt(
            Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
          ) <= radius);
      }
    };
  }
  resetCircle() {
    if (!this.initialized || !this.Circle) {
      return;
    }
    this.Circle = undefined;
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
        if (typeof edge == 'string') {
          edge = this.vector(edge);
        }
        if (!edge || edge.x == undefined || edge.y == undefined) {
          throw 'Invalid edge given';
        }
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
    let directions = Object.keys(this.Direction.VectorMap);
    for (let direction of directions) {
      this.Direction.VectorMap[direction].length = 1.0;
      this.Direction.VectorMap[direction].length = Math.round(this.Direction.VectorMap[direction].length);
    }
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
  initLine() {
    this.resetLine();
    let self = this;
    this.Line = {
      mitreLengthAtCorner(segment, width=1.0) {
        if (segment && segment.previous && segment.next) {
          // calculate the angle between segments
          let angle1 = segment.point.subtract(segment.previous.point).angle;
          let angle2 = segment.next.point.subtract(segment.point).angle;
          let angleDiff = angle2 - angle1;

          // calculate the width of the target at the corner
          let mitreLength = width / Math.cos((angleDiff/2.0) * (Math.PI/180.0));

          return mitreLength;
        }
        return width;
      },
      normalAtCorner(segment, length=1.0) {
        let result = new paper.Point();
        let point = segment.point;
        let prev = segment.previous;
        let next = segment.next;
        if (!prev) {
          result.angle = segment.point.angle;
        }
        else if (!next) {
          result.angle = point.subtract(prev.point).angle;
        }
        else {
          let angle1 = point.subtract(prev.point).angle;
          let angle2 = next.point.subtract(point).angle;
          result.angle = angle1 + (angle2 - angle1)/2.0 + 90.0;
        }
        result.length = length;
        return result;
      },
      defineSection(definition) {
        let section = {
          start: definition.start,
          end: definition.end,
          length: definition.length,
          middle: definition.position
        };
        if (section.start == null && section.end == null && section.length == null && section.middle != null) {
          section.start = section.end = section.middle;
          section.length = 0;
        }
        if ((section.start == null || section.end == null) && section.length != null) {
          if (section.end == null && section.start != null) {
            section.end = section.start + section.length;
          }
          else if (section.start == null && section.end != null) {
            section.start = section.end - section.length;
          }
          else if (section.middle) {
            let halfLength = section.length/2.0;
            section.start = section.middle - halfLength;
            section.end = section.middle + halfLength;
          }
        }
        if (section.start != null && section.end != null) {
          if (section.length == null) {
            section.length = section.end - section.start;
          }
          if (section.middle == null) {
            section.middle = section.start + section.length/2.0;
          }
        }
        return section;
      }
    };
  }
  resetLine() {
    if (!this.initialized || !this.Line) {
      return;
    }
    this.Line = undefined;
  }
  initNormalize() {
    this.resetNormalize();
    let self = this;
    this.Normalize = {
      pointToRectangle(point, rectangle) {
        point = new paper.Point(point);
        // normalize the point to between -1.0 and 1.0 on x & y axis
        // don't do anything with points that are already >= -1.0 and <= 1.0
        if (rectangle.width && (point.x < -1.0 || point.x > 1.0)) {
          point.x /= (rectangle.width/2.0);
        }
        if (rectangle.height && (point.y < -1.0 || point.y > 1.0)) {
          point.y /= (rectangle.height/2.0);
        }
        return point;
      },
      pointFromRectangle(point, rectangle) {
        point = new paper.Point(point);
        let bounds = new paper.Point(rectangle.width/2.0, rectangle.height/2.0);
        point = rectangle.center.add(point.multiply(bounds));
        return point;
      },
      pointOnLine(line, distance, includeMeta=false) {
        let reverse = (distance < 0);
        let length = distance;
        if (reverse) {
          length *= -1.0;
        }
        length *= line.length;
        for (let i=0; i < (line.segments.length-1); i++) {
          let p1 = line.segments[(reverse ? line.segments.length-1-i : i)].point;
          let p2 = line.segments[(reverse ? line.segments.length-2-i : i+1)].point;
          let delta = p2.subtract(p1);
          if (delta.length >= length) {
            let vector = delta.clone();
            vector.length = 1.0;
            delta.length = length;
            let p3 = p1.add(delta);
            return (includeMeta ? { point: p3, vector: vector, segment: i } : p3);
          }
          else {
            length -= delta.length;
          }
        }
        let segmentIndex = ((reverse || distance == 1.0) ? line.segments.length-1 : 0);
        let result = line.segments[segmentIndex].point.clone();
        let vector;
        if (segmentIndex) {
          vector = result.subtract(line.segments[segmentIndex-1].point);
        }
        else {
          vector = line.segments[segmentIndex+1].point.subtract(result);
        }
        vector.length = 1.0;
        return (includeMeta ? { point: result, vector: vector, segment: segmentIndex } : result);
      }
    };
  }
  resetNormalize() {
    if (!this.initialized || !this.Normalize) {
      return;
    }
    this.Normalize = undefined;
  }
};
export default Geo;
