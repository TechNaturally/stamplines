import Util from '../../core/util.js';
export class Grid extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'Grid';
    this.configure();
  }
  reset() {
    super.reset();
    this.unregisterSnappers();
  }

  configure(config) {
    config = super.configure(config);

    // base definition
    this.definition = {
      offset: { x: 0, y: 0 },
      width: '100%',
      height: '100%',
      cell: {},
      cols: '+',
      rows: '+'
    };

    // use config to customize the definition
    if (config.offset) {
      this.definition.offset.x = config.offset.x || this.definition.offset.x;
      this.definition.offset.y = config.offset.y || this.definition.offset.y;
    }
    this.definition.width = config.width || this.definition.width;
    this.definition.height = config.height || this.definition.height;

    this.definition.cell.width = (config.cell && config.cell.width) || (config.cell && config.cell.size) || config.size || this.definition.cell.width;
    this.definition.cell.height = (config.cell && config.cell.height) || (config.cell && config.cell.size) || config.size || this.definition.cell.height;

    this.definition.cols = config.cols || this.definition.cols;
    this.definition.rows = config.rows || this.definition.rows;

    // set things up
    this.registerSnappers();
    this.renderGrid();

    return this.config;
  }

  getCurrentDefinition() {
    let currentDef = {};
    let Parser = this.SL.Utils.gets('ConfigParser');
    let View = this.SL.Paper.view;
    let Def = this.definition;
    let parsed;

    // parse grid offset
    currentDef.offset = { x: 0, y: 0 };
    parsed = Parser.parseNumber(Def.offset.x);
    currentDef.offset.x = parsed.value;
    if (parsed.percent) {
      currentDef.offset.x *= View.size.width;
    }
    parsed = Parser.parseNumber(Def.offset.y);
    currentDef.offset.y = parsed.value;
    if (parsed.percent) {
      currentDef.offset.y *= View.size.height;
    }

    // parse grid width
    currentDef.width = View.size.width;
    parsed = Parser.parseNumber(Def.width);
    if (!parsed.value) {
      parsed.value = 1.0;
      parsed.percent = true;
    }
    if (parsed.percent) {
      currentDef.width *= parsed.value;
    }
    else if (parsed.value) {
      currentDef.width = parsed.value;
    }

    // parse grid height
    currentDef.height = View.size.height;
    parsed = Parser.parseNumber(Def.height);
    if (!parsed.value) {
      parsed.value = 1.0;
      parsed.percent = true;
    }
    if (parsed.percent) {
      currentDef.height *= parsed.value;
    }
    else if (parsed.value) {
      currentDef.height = parsed.value;
    }

    // read row and col preferences
    let cols = Parser.parseNumber(Def.cols);
    let rows = Parser.parseNumber(Def.rows);
    currentDef.cell = {};

    // calculate cell width + cols
    parsed = Parser.parseNumber(Def.cell.width);
    currentDef.cell.width = parsed.value;
    if (!parsed.value) {
      if (cols.value) {
        currentDef.cell.width = currentDef.width / cols.value;
      }
    }
    else if (parsed.percent) {
      currentDef.cell.width = currentDef.width * parsed.value;
    }
    currentDef.cell.width = Parser.unparseNumber(currentDef.cell.width, parsed);

    // calculate cell height + rows
    parsed = Parser.parseNumber(Def.cell.height);
    currentDef.cell.height = parsed.value;
    if (!parsed.value) {
      if (rows.value) {
        currentDef.cell.height = currentDef.height / rows.value;
      }
    }
    else if (parsed.percent) {
      currentDef.cell.height = currentDef.height * parsed.value;
    }
    currentDef.cell.height = Parser.unparseNumber(currentDef.cell.height, parsed);

    // if width or height is missing, try to use the other
    currentDef.cell.width = currentDef.cell.width || currentDef.cell.height;
    currentDef.cell.height = currentDef.cell.height || currentDef.cell.width;

    // finalize number of cols
    currentDef.cols = currentDef.width / currentDef.cell.width;
    currentDef.cols = Parser.unparseNumber(currentDef.cols, cols);
    // finalize number of rows
    currentDef.rows = currentDef.height / currentDef.cell.height;
    currentDef.rows = Parser.unparseNumber(currentDef.rows, rows);

    return currentDef;
  }

  registerSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.point = Snap.addSnapper('point', {
        priority: 75,
        callback: (point, config) => {
          return this.snapPoint(point, config);
        }
      });
      this.Snappers.rectangle = Snap.addSnapper('rectangle', {
        priority: 75,
        callback: (rectangle, config) => {
          return this.snapRectangle(rectangle, config);
        }
      });
      this.Snappers.item = Snap.addSnapper('item', {
        priority: 75,
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
    if (Snap && this.Snappers.rectangle) {
      Snap.dropSnapper('rectangle', this.Snappers.rectangle.id);
      this.Snappers.rectangle = undefined;
    }
    if (Snap && this.Snappers.item) {
      Snap.dropSnapper('item', this.Snappers.item.id);
      this.Snappers.item = undefined;
    }
  }
  snapPoint(point, config={}) {
    if (config && config.interactive) {
      return point;
    }
    let def = this.getCurrentDefinition();
    let min = { Col: -1, Row: -1 };
    let max = { Col: -1, Row: -1 };
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      let pointMin = Snap.PointMin(new paper.Point);
      min.Col = Math.ceil(pointMin.x / def.cell.width);
      min.Row = Math.ceil(pointMin.y / def.cell.height);

      let pointMax = Snap.PointMax(new paper.Point);
      max.Col = Math.floor(pointMax.x / def.cell.width);
      max.Row = Math.floor(pointMax.y / def.cell.height);
    }
    let newPoint = new paper.Point(def.offset).add(point);
    let target = {
      Col: Math.round(newPoint.x / def.cell.width),
      Row: Math.round(newPoint.y / def.cell.height)
    };
    if (min.Col >= 0 && target.Col < min.Col) {
      target.Col = min.Col;
    }
    else if (max.Col >= 0 && target.Col > max.Col) {
      target.Col = max.Col;
    }
    if (min.Row >= 0 && target.Row < min.Row) {
      target.Row = min.Row;
    }
    else if (max.Row >= 0 && target.Row > max.Row) {
      target.Row = max.Row;
    }
    newPoint.set({
      x: (target.Col * def.cell.width) - def.offset.x,
      y: (target.Row * def.cell.height) - def.offset.y
    });
    point.set(newPoint);
    return point;
  }
  snapRectangle(rectangle, config={}) {
    if (config && config.size === false) {
      return rectangle;
    }
    let interactive = !!(config && config.interactive);
    let Geo = this.SL.Utils.get('Geo');
    let anchor = config.anchor || rectangle.center;
    if (config.anchorEdge && Geo) {
      anchor = Geo.Direction.edgePoint(config.anchorEdge, rectangle);
    }
    let rectangleWidth = rectangle.width;
    let rectangleHeight = rectangle.height;
    let topLeft = new paper.Point({x: rectangle.left, y: rectangle.top});
    let bottomRight = new paper.Point({x: rectangle.right, y: rectangle.bottom});
    let pointMin, pointMax;
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      pointMin = Snap.PointMin(new paper.Point);
      pointMax = Snap.PointMax(new paper.Point);
    }
    let snapped = {
      left: undefined,
      top: undefined,
      right: undefined,
      bottom: undefined
    };

    // horizontal snapping
    if (anchor.x > rectangle.center.x) {
      // anchored at right, snap right edge first
      snapped.right = this.snapPoint(new paper.Point(bottomRight));
      if (!interactive) {
        snapped.left = this.snapPoint(new paper.Point(snapped.right.x-rectangleWidth, topLeft.y));
      }
      else {
        snapped.left = topLeft.clone();
      }
      if (pointMin != undefined && (snapped.left.x) < pointMin.x) {
        // if horizontal snapping by Right would exceed pointMin, re-snap horizontally based on Left
        snapped.left = this.snapPoint(new paper.Point(topLeft));
        if (!interactive) {
          snapped.right = this.snapPoint(new paper.Point(snapped.left.x+rectangleWidth, bottomRight.y));
        }
        else {
          snapped.right = bottomRight.clone();
        }
      }
    }
    else {
      // otherwise, snap left edge first
      // first try horizontal snapping based on Left
      snapped.left = this.snapPoint(new paper.Point(topLeft));
      if (!interactive) {
        snapped.right = this.snapPoint(new paper.Point(snapped.left.x+rectangleWidth, bottomRight.y));
      }
      else {
        snapped.right = bottomRight.clone();
      }
      if (pointMax != undefined && (snapped.left.x+rectangleWidth) > pointMax.x) {
        // if horizontal snapping by Left would exceed pointMax, re-snap horizontally based on Right
        snapped.right = this.snapPoint(new paper.Point(bottomRight));
        if (!interactive) {
          snapped.left = this.snapPoint(new paper.Point(snapped.right.x-rectangleWidth, topLeft.y));
        }
        else {
          snapped.left = topLeft.clone();
        }
      }
    }

    // vertical snapping
    if (anchor.y > rectangle.center.y) {
      // anchored at bottom, snap bottom edge first
      snapped.bottom = this.snapPoint(new paper.Point(bottomRight));
      if (!interactive) {
        snapped.top = this.snapPoint(new paper.Point(topLeft.x, snapped.bottom.y-rectangleHeight));
      }
      else {
        snapped.top = topLeft.clone();
      }
      if (pointMin != undefined && (snapped.top.y) < pointMin.y) {
        // if vertical snapping by Bottom would exceed pointMin, re-snap vertically based on Top
        snapped.top = this.snapPoint(new paper.Point(topLeft));
        if (!interactive) {
          snapped.bottom = this.snapPoint(new paper.Point(bottomRight.x, snapped.top.y+rectangleHeight));
        }
        else {
          snapped.bottom = bottomRight.clone();
        }
      }
    }
    else {
      // otherwise, snap top edge first
      // first try vertical snapping based on Top
      snapped.top = this.snapPoint(new paper.Point(topLeft));
      if (!interactive) {
        snapped.bottom = this.snapPoint(new paper.Point(bottomRight.x, snapped.top.y+rectangleHeight));
      }
      else {
        snapped.bottom = bottomRight.clone();
      }
      if (pointMax != undefined && (snapped.top.y+rectangleHeight) > pointMax.y) {
        // if vertical snapping by Top would exceed pointMax, re-snap vertically based on Bottom
        snapped.bottom = this.snapPoint(new paper.Point(bottomRight));
        if (!interactive) {
          snapped.top = this.snapPoint(new paper.Point(topLeft.x, snapped.bottom.y-rectangleHeight));
        }
        else {
          snapped.top = topLeft.clone();
        }
      }
    }

    // apply the snapped sides
    rectangle.set({
      top: snapped.top.y,
      left: snapped.left.x,
      bottom: snapped.bottom.y,
      right: snapped.right.x
    });
    return rectangle;
  }
  snapItem(item, config={}) {
    if (config && config.interactive) {
      return item;
    }
    let rotation = item.rotation;
    if (rotation) {
      item.rotate(-rotation);
    }

    if (item.segments) {
      for (let segment of item.segments) {
        let snapped = this.snapPoint(segment.point.clone(), config);
        segment.point.set(snapped);
      }
    }
    else if (item.bounds) {
      let snapped = this.snapRectangle(item.bounds.clone(), config);
      item.bounds.set(snapped);
    }

    if (rotation) {
      item.rotate(rotation);
    }
    return item;
  }

  renderGrid(style) {
    style = style || this.config.style || Grid.DEFAULT.style;
    let def = this.getCurrentDefinition();
    let grid = this.SL.Paper.generatePaperItem({Class:'UI', Layer:this.SL.Paper.Layers['BG']+1, Grid:'GRID', Source: this}, paper.Group);
    let n, pt1, pt2;
    let strong = this.config.strong;
    let strongStyle = $.extend({}, style, 
      { strokeWidth: (style.strokeWidth ? style.strokeWidth*2.0 : 2.0) },
      this.config.strongStyle);

    // render vertical lines
    n = 0;
    pt1 = new paper.Point(def.offset.x, def.offset.y);
    pt2 = new paper.Point(def.offset.x, def.offset.y+def.height);
    while (n <= def.cols) {
      pt2.x = pt1.x;
      let gridLine = this.SL.Paper.generatePaperItem({Class:['UI','UI.Grid'], Layer:'GROUPED', Grid:'COL-'+n}, paper.Path.Line, pt1, pt2);
      let applyStyle = style;
      if (strong && n % strong == 0) {
        applyStyle = strongStyle;
      }
      this.SL.Paper.applyStyle(gridLine, applyStyle);
      grid.addChild(gridLine);
      pt1.x += def.cell.width;
      n++;
    }

    // render horizontal lines
    n = 0;
    pt1 = new paper.Point(def.offset.x, def.offset.y);
    pt2 = new paper.Point(def.offset.x+def.width, def.offset.y);
    while (n <= def.rows) {
      pt2.y = pt1.y;
      let gridLine = this.SL.Paper.generatePaperItem({Class:['UI','UI.Grid'], Layer:'GROUPED', Grid:'ROW-'+n}, paper.Path.Line, pt1, pt2);
      let applyStyle = style;
      if (strong && n % strong == 0) {
        applyStyle = strongStyle;
      }
      this.SL.Paper.applyStyle(gridLine, applyStyle);
      grid.addChild(gridLine);
      pt1.y += def.cell.height;
      n++;
    }

    return grid;
  }
}
Grid.DEFAULT = {
  style: { strokeWidth: 1.5, strokeColor: (2.0/3.0), opacity: 0.25 }
};
