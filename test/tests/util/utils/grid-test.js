describe('Utils.Grid', () => {
  let Grid;
  let gridDefKeys = ['offset', 'width', 'height', 'cell', 'rows', 'cols'];
  before(() => {
    Test.assertSL();
    Grid = new Test.Lib.Utils.Grid(Test.SL, Test.SL.Utils.config.Grid);
  });
  after(() => {
    Grid.destroy();
    Grid = undefined;
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Grid).to.exist;
    });
    it('should be constructed by Grid', () => {
      expect(Grid.constructor.name).to.equal('Grid');
    });
  });

  describe('#configure', () => {
    let origConfig;
    let testConfig, testConfig1, testConfig2;
    after(() => {
      Grid.configure(origConfig);
    });
    before(() => {
      origConfig = Grid.config;
      testConfig = {
        offset: {x: 10, y: 10},
        width: '50%',
        height: '50%',
        cell: {
          size: 40
        },
        cols: '_',
        rows: '_'
      };
      testConfig1 = $.extend({}, testConfig, {cell: {
        width: '50',
        height: '50'
      }});
      testConfig2 = $.extend({}, testConfig, {cell: {}, size: 42});
    });
    it('should initialize Grid.definition with keys: '+JSON.stringify(gridDefKeys), () => {
      Grid.configure(testConfig);
      expect(Grid.definition).to.have.all.keys(gridDefKeys);
    });
    it('should initialize Grid.definition.offset from config.offset', () => {
      Grid.configure(testConfig);
      expect(Grid.definition.offset).to.eql(testConfig.offset);
    });
    it('should initialize Grid.definition.width from config.width', () => {
      Grid.configure(testConfig);
      expect(Grid.definition.width).to.eql(testConfig.width);
    });
    it('should initialize Grid.definition.height from config.height', () => {
      Grid.configure(testConfig);
      expect(Grid.definition.height).to.eql(testConfig.height);
    });
    it('should initialize Grid.definition.cell.width from config.cell.width', () => {
      Grid.configure(testConfig1);
      expect(Grid.definition.cell.width).to.eql(testConfig1.cell.width);
    });
    it('should initialize Grid.definition.cell.height from config.cell.height', () => {
      Grid.configure(testConfig1);
      expect(Grid.definition.cell.height).to.eql(testConfig1.cell.height);
    });
    it('should initialize Grid.definition.cell.width from config.cell.size (when config.cell.width is not given)', () => {
      Grid.configure(testConfig);
      expect(Grid.definition.cell.width).to.eql(testConfig.cell.size);
    });
    it('should initialize Grid.definition.cell.height from config.cell.size (when config.cell.height is not given)', () => {
      Grid.configure(testConfig);
      expect(Grid.definition.cell.height).to.eql(testConfig.cell.size);
    });
    it('should initialize Grid.definition.cell.width from config.size (when config.cell.width is not given)', () => {
      Grid.configure(testConfig2);
      expect(Grid.definition.cell.width).to.eql(testConfig2.size);
    });
    it('should initialize Grid.definition.cell.height from config.size (when config.cell.height is not given)', () => {
      Grid.configure(testConfig2);
      expect(Grid.definition.cell.height).to.eql(testConfig2.size);
    });
    it('should initialize Grid.definition.cols from config.cols', () => {
      Grid.configure(testConfig);
      expect(Grid.definition.cols).to.eql(testConfig.cols);
    });
    it('should initialize Grid.definition.rows from config.rows', () => {
      Grid.configure(testConfig);
      expect(Grid.definition.rows).to.eql(testConfig.rows);
    });
  });

  describe('#getCurrentDefinition', () => {
    let origConfig;
    let testConfig, testConfig1, testConfig2, testConfig3, testConfig4;
    let ViewSize;
    after(() => {
      Grid.configure(origConfig);
    });
    before(() => {
      origConfig = Grid.config;
      // base config
      testConfig = {
        offset: {x: 10, y: 10},
        width: 500,
        height: 400,
        cell: {
          size: 40
        },
        cols: '_',
        rows: '_'
      };
      // percentages
      testConfig1 = $.extend({}, testConfig, {
        offset: {x:'25%', y:0.25},
        width: 0.75,
        height: '75%',
        cell: {
          width: '10%',
          height: 0.1
        },
        cols: '+',
        rows: '+'
      });
      // empty cell config
      testConfig2 = $.extend({}, testConfig, {
        width: 493,
        height: 527,
        cell: {},
        cols: '10',
        rows: '10'
      });
      // round up
      testConfig3 = $.extend({}, testConfig, {
        cell: {
          width: '+',
          height: '+'
        },
        cols: '13',
        rows: '13'
      });
      // round down
      testConfig4 = $.extend({}, testConfig, {
        cell: {
          width: '_',
          height: '_'
        },
        cols: '13',
        rows: '13'
      });

      ViewSize = Grid.SL.Paper.view.size;
    });
    it('should return a grid definition with keys: '+JSON.stringify(gridDefKeys), () => {
      Grid.configure(testConfig);
      let definition = Grid.getCurrentDefinition();
      expect(definition).to.have.all.keys(gridDefKeys);
    });
    it('should read offset from Grid.definition.offset', () => {
      Grid.configure(testConfig);
      let definition = Grid.getCurrentDefinition();
      expect(definition.offset).to.eql(Grid.definition.offset);
    });
    it('should read offset.x as a percentage of Grid.SL.Paper.view.size.width', () => {
      Grid.configure(testConfig1);
      let definition = Grid.getCurrentDefinition();
      expect(definition.offset.x).to.eql(ViewSize.width*0.25);
    });
    it('should read offset.y as a percentage of Grid.SL.Paper.view.size.height', () => {
      Grid.configure(testConfig1);
      let definition = Grid.getCurrentDefinition();
      expect(definition.offset.y).to.eql(ViewSize.height*0.25);
    });
    it('should read width from Grid.definition.width', () => {
      Grid.configure(testConfig);
      let definition = Grid.getCurrentDefinition();
      expect(definition.width).to.eql(Grid.definition.width);
    });
    it('should read width as a percentage of Grid.SL.Paper.view.size.width', () => {
      Grid.configure(testConfig1);
      let definition = Grid.getCurrentDefinition();
      expect(definition.width).to.eql(ViewSize.width*0.75);
    });
    it('should read height from Grid.definition.height', () => {
      Grid.configure(testConfig);
      let definition = Grid.getCurrentDefinition();
      expect(definition.height).to.eql(Grid.definition.height);
    });
    it('should read height as a percentage of Grid.SL.Paper.view.size.height', () => {
      Grid.configure(testConfig1);
      let definition = Grid.getCurrentDefinition();
      expect(definition.height).to.eql(ViewSize.height*0.75);
    });
    it('should calculate cell.width based on Grid.definition.cols when cell.width is not configured', () => {
      Grid.configure(testConfig2);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.width).to.eql(definition.width/Grid.definition.cols);
    });
    it('should calculate cell.width as a percentage of definition.width', () => {
      Grid.configure(testConfig1);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.width).to.eql(definition.width*0.1);
    });
    it('should round cell.width up when prefixed with +', () => {
      Grid.configure(testConfig3);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.width).to.eql(Math.ceil(definition.width/Grid.definition.cols));
    });
    it('should round cell.width down when prefixed with _', () => {
      Grid.configure(testConfig4);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.width).to.eql(Math.floor(definition.width/Grid.definition.cols));
    });
    it('should calculate cell.height based on Grid.definition.rows when cell.height is not configured', () => {
      Grid.configure(testConfig2);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.height).to.eql(definition.height/Grid.definition.rows);
    });
    it('should calculate cell.height as a percentage of Grid.SL.Paper.view.size.height', () => {
      Grid.configure(testConfig1);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.height).to.eql(definition.height*0.1);
    });
    it('should round cell.height up when prefixed with +', () => {
      Grid.configure(testConfig3);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.height).to.eql(Math.ceil(definition.height/Grid.definition.rows));
    });
    it('should round cell.height down when prefixed with _', () => {
      Grid.configure(testConfig4);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.height).to.eql(Math.floor(definition.height/Grid.definition.rows));
    });
    it('should read cell.width from cell.height when cell.width is not configured', () => {
      Grid.configure($.extend({}, testConfig, {
        cell: {
          height: '24'
        }
      }));
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.width).to.eql(definition.cell.height);
    });
    it('should read cell.height from cell.width when cell.height is not configured', () => {
      Grid.configure($.extend({}, testConfig, {
        cell: {
          width: '24'
        }
      }));
      let definition = Grid.getCurrentDefinition();
      expect(definition.cell.height).to.eql(definition.cell.width);
    });
    it('should calculate cols based on width and cell.width', () => {
      Grid.configure(testConfig);
      let definition = Grid.getCurrentDefinition();
      expect(definition.cols).to.eql(Math.floor(definition.width/definition.cell.width));
    });
    it('should calculate rows based on height and cell.height', () => {
      Grid.configure(testConfig);
      let definition = Grid.getCurrentDefinition();
      expect(definition.rows).to.eql(Math.floor(definition.height/definition.cell.height));
    });
    it('should round cols up when prefixed with +', () => {
      Grid.configure($.extend({}, testConfig2, {
        cols: '+10.3'
      }));
      let definition = Grid.getCurrentDefinition();
      expect(definition.cols).to.eql(11);
    });
    it('should round cols down when prefixed with _', () => {
      Grid.configure($.extend({}, testConfig2, {
        cols: '_10.7'
      }));
      let definition = Grid.getCurrentDefinition();
      expect(definition.cols).to.eql(10);
    });
    it('should round rows up when prefixed with +', () => {
      Grid.configure($.extend({}, testConfig2, {
        rows: '+10.3'
      }));
      let definition = Grid.getCurrentDefinition();
      expect(definition.rows).to.eql(11);
    });
    it('should round rows down when prefixed with _', () => {
      Grid.configure($.extend({}, testConfig2, {
        rows: '_10.7'
      }));
      let definition = Grid.getCurrentDefinition();
      expect(definition.cols).to.eql(10);
    });
  });

  describe('#registerSnappers', () => {
    let Snap;
    before(() => {
      Snap = Grid.SL.Utils.get('Snap');
    });
    beforeEach(() => {
      Grid.unregisterSnappers();
    });
    it('should initialize the point snapper', () => {
      Grid.registerSnappers();
      expect(Grid.Snappers.point).to.exist;
    });
    it('should register the point snapper', () => {
      Grid.registerSnappers();
      expect(Snap.Snaps.point.map[Grid.Snappers.point.id]).to.equal(Grid.Snappers.point);
    });
    it('should initialize the rectangle snapper', () => {
      Grid.registerSnappers();
      expect(Grid.Snappers.rectangle).to.exist;
    });
    it('should register the rectangle snapper', () => {
      Grid.registerSnappers();
      expect(Snap.Snaps.rectangle.map[Grid.Snappers.rectangle.id]).to.equal(Grid.Snappers.rectangle);
    });
  });
  describe('#unregisterSnappers', () => {
    let Snap;
    before(() => {
      Snap = Grid.SL.Utils.get('Snap');
    });
    afterEach(() => {
      Grid.registerSnappers();
    });
    it('should stop tracking the point snapper', () => {
      Grid.unregisterSnappers();
      expect(Grid.Snappers.point).to.not.exist;
    });
    it('should unregister the point snapper', () => {
      let snapper = Grid.Snappers.point;
      Grid.unregisterSnappers();
      expect(Snap.Snaps.point.map[snapper.id]).to.not.exist;
    });
    it('should stop tracking the rectangle snapper', () => {
      Grid.unregisterSnappers();
      expect(Grid.Snappers.rectangle).to.not.exist;
    });
    it('should unregister the rectangle snapper', () => {
      let snapper = Grid.Snappers.rectangle;
      Grid.unregisterSnappers();
      expect(Snap.Snaps.rectangle.map[snapper.id]).to.not.exist;
    });
  });
  describe('#snapPoint', () => {
    let origConfig;
    let tests1 = [
      { point: {x: 7, y: 7}, expect: {col: 0, row: 0} },
      { point: {x: 17, y: 17}, expect: {col: 1, row: 1} },
      { point: {x: 23, y: 23}, expect: {col: 1, row: 1} },
      { point: {x: 31, y: 31}, expect: {col: 2, row: 2} }
    ];
    let testConfig2;
    let tests2 = [
      { point: {x: 7, y: 7}, expect: {col: 1, row: 1} },
      { point: {x: 17, y: 17}, expect: {col: 1, row: 1} },
      { point: {x: 23, y: 23}, expect: {col: 2, row: 2} },
      { point: {x: 31, y: 31}, expect: {col: 2, row: 2} }
    ];
    before(() => {
      origConfig = Grid.config;
      testConfig2 = $.extend({}, origConfig, {
        offset: {
          x: -10,
          y: -10
        }
      });
    });
    after(() => {
      Grid.configure(origConfig);
    });
    function runTests(tests) {
      let def = Grid.getCurrentDefinition();
      let testPoint = new paper.Point(0, 0);
      let checkPoint = new paper.Point(0, 0);
      tests.forEach((test, index) => {
        checkPoint.set({
          x: test.expect.col * def.cell.width + def.offset.x,
          y: test.expect.row * def.cell.height + def.offset.y
        });
        testPoint.set(test.point);
        Grid.snapPoint(testPoint);
        try {
          expect(testPoint.x).to.equal(checkPoint.x);
          expect(testPoint.y).to.equal(checkPoint.y);
        }
        catch (error) {
          throw `Failed on test [${index+1}/${tests.length}]: ${error}`;
        }
      });
      testPoint = undefined;
      checkPoint = undefined;
    }
    it('should snap the point to the current grid definition', () => {
      runTests(tests1);
    });
    it('should allow for an offset', () => {
      Grid.configure(testConfig2);
      runTests(tests2);
      Grid.configure(origConfig);
    });
  });
  describe('#snapRectangle', () => {
    let origConfig;
    let tests1 = [
      { rect: {x: 7, y: 7, width: 42, height: 52}, expect: {col: 0, row: 0, width: 40, height: 60} },
      { rect: {x: 17, y: 17, width: 52, height: 42}, expect: {col: 1, row: 1, width: 60, height: 40} },
      { rect: {x: 23, y: 23, width: 42, height: 42}, expect: {col: 1, row: 1, width: 40, height: 40} },
      { rect: {x: 31, y: 31, width: 52, height: 52}, expect: {col: 2, row: 2, width: 60, height: 60} }
    ];
    let testConfig2;
    let tests2 = [
      { rect: {x: 7, y: 7, width: 42, height: 52}, expect: {col: 1, row: 1, width: 40, height: 60} },
      { rect: {x: 17, y: 17, width: 52, height: 42}, expect: {col: 1, row: 1, width: 60, height: 40} },
      { rect: {x: 23, y: 23, width: 42, height: 42}, expect: {col: 2, row: 2, width: 40, height: 40} },
      { rect: {x: 31, y: 31, width: 52, height: 52}, expect: {col: 2, row: 2, width: 60, height: 60} }
    ];
    before(() => {
      origConfig = Grid.config;
      testConfig2 = $.extend({}, origConfig, {
        offset: {
          x: -10,
          y: -10
        }
      });
    });
    after(() => {
      Grid.configure(origConfig);
    });
    function runTests(tests) {
      let def = Grid.getCurrentDefinition();
      let testRect = new paper.Rectangle(0, 0, 0, 0);
      let checkRect = new paper.Rectangle(0, 0, 0, 0);
      tests.forEach((test, index) => {
        checkRect.set({
          x: test.expect.col * def.cell.width + def.offset.x,
          y: test.expect.row * def.cell.height + def.offset.y,
          width: test.expect.width,
          height: test.expect.height
        });
        testRect.set(test.rect);
        Grid.snapRectangle(testRect);
        try {
          expect(testRect.x).to.equal(checkRect.x);
          expect(testRect.y).to.equal(checkRect.y);
          expect(testRect.width).to.equal(checkRect.width);
          expect(testRect.height).to.equal(checkRect.height);
        }
        catch (error) {
          throw `Failed on test [${index+1}/${tests.length}]: ${error}`;
        }
      });
      testRect = undefined;
      checkRect = undefined;
    }
    it('should snap the rectangle to the current grid definition', () => {
      runTests(tests1);
    });
    it('should allow for an offset', () => {
      Grid.configure(testConfig2);
      runTests(tests2);
      Grid.configure(origConfig);
    });
  });

  describe('#renderGrid', () => {
    beforeEach(() => {
      Grid.reset();
    });
    it('should track the rendered grid in its PaperItems', () => {
      let grid = Grid.renderGrid();
      expect(Grid.PaperItems).to.include(grid);
    });
    it('should render a PaperItem constructed by paper.Group', () => {
      let grid = Grid.renderGrid();
      expect(grid.constructor).to.equal(paper.Group);
    });
    it('should render a paper.Group with children of length = (rows + cols + 2)', () => {
      let definition = Grid.getCurrentDefinition();
      let grid = Grid.renderGrid();
      expect(grid.children).to.have.length(definition.rows+definition.cols+2);
    });
    it('should render and track multiple PaperItems if it is not reset in between calls', () => {
      let count0 = (Grid.PaperItems ? Grid.PaperItems.length : 0);
      let grid1 = Grid.renderGrid();
      let count1 = (Grid.PaperItems ? Grid.PaperItems.length : 0);
      let grid2 = Grid.renderGrid();
      let count2 = (Grid.PaperItems ? Grid.PaperItems.length : 0);
      expect(count2).to.be.above(count1);
      Grid.reset();
    });
  });
});
