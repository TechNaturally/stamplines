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
        callback: (point, config) => {
          return this.snapPoint(point, config);
        }
      });
      this.Snappers.rectangle = Snap.addSnapper('rectangle', {
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
    if (Snap && this.Snappers.rectangle) {
      Snap.dropSnapper('rectangle', this.Snappers.rectangle.id);
      this.Snappers.rectangle = undefined;
    }
  }
  snapPoint(point, config) {
    if (config && config.interactive) {
      return;
    }
    let def = this.getCurrentDefinition();
    let newPoint = new paper.Point(def.offset).add(point);
    let targetCol = Math.round(newPoint.x / def.cell.width);
    let targetRow = Math.round(newPoint.y / def.cell.height);
    newPoint.set({
      x: (targetCol * def.cell.width) - def.offset.x,
      y: (targetRow * def.cell.height) - def.offset.y
    });
    point.set(newPoint);
    return point;
  }
  snapRectangle(rectangle, config) {
    if (config && config.interactive) {
      return;
    }
    let rectangleWidth = rectangle.width;
    let rectangleHeight = rectangle.height;
    let def = this.getCurrentDefinition();
    let topLeft = this.snapPoint(new paper.Point({ x:rectangle.left, y:rectangle.top }));
    let bottomRight = this.snapPoint(new paper.Point({x:topLeft.x+rectangleWidth, y:topLeft.y+rectangleHeight}));
    rectangle.set({
      left: topLeft.x,
      top: topLeft.y,
      right: bottomRight.x,
      bottom: bottomRight.y
    });
    return rectangle;
  }

  renderGrid(style) {
    style = style || this.config.style || Grid.DEFAULT.style;
    let def = this.getCurrentDefinition();
    let grid = this.SL.Paper.generatePaperItem({Class:'UI', Layer:'BG', Grid:'GRID', Source: this}, paper.Group);
    let n, pt1, pt2;

    // render vertical lines
    n = 0;
    pt1 = new paper.Point(def.offset.x, def.offset.y);
    pt2 = new paper.Point(def.offset.x, def.offset.y+def.height);
    while (n <= def.cols) {
      pt2.x = pt1.x;
      let gridLine = this.SL.Paper.generatePaperItem({Class:'UI.Grid', Layer:'GROUPED', Grid:'COL-'+n}, paper.Path.Line, pt1, pt2);
      this.SL.Paper.applyStyle(gridLine, style);
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
      let gridLine = this.SL.Paper.generatePaperItem({Class:'UI.Grid', Layer:'GROUPED', Grid:'ROW-'+n}, paper.Path.Line, pt1, pt2);
      this.SL.Paper.applyStyle(gridLine, style);
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
