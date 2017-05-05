describe('Utils.Snap', () => {
  let Snap;
  let testType;
  let testConfigBase;
  let testSnapper;
  let testSnappers;
  let testSnappersOrder;
  before(() => {
    Test.assertSL();
    Snap = new Test.Lib.Utils.Snap(Test.SL);

    testType = 'point';
    testConfigBase = {
      callback: function snapTest(value, config) {
        // this is a completely facetious example
        return value + (config.increment || 1);
      }
    };

    // a very basic Snapper which should be ordered first in multi-snapper cases
    testSnapper = $.extend({'id': 'test-1', 'priority': 0}, testConfigBase);

    // list of Snappers carefully mis-ordered to test priority-based sorting
    testSnappers = {
      'test-5': $.extend({'id': 'test-5', 'priority': -1}, testConfigBase),
      'test-6': $.extend({'id': 'test-6'}, testConfigBase), // defaults priority -1 to the end of list
      'test-3': $.extend({'id': 'test-3', 'priority': 7}, testConfigBase),
      'test-2': $.extend({'id': 'test-2', 'priority': 5}, testConfigBase),
      'test-7': $.extend({'id': 'test-7', 'priority': -1}, testConfigBase),
      'test-4': $.extend({'id': 'test-4', 'priority': 7}, testConfigBase),
      'test-1': $.extend({}, testSnapper)
    };
    testSnappersOrder = ['test-1', 'test-2', 'test-3', 'test-4', 'test-5', 'test-6', 'test-7'];

    // Note to avoid cross-case-contamination:
    // - when using test objects, always use a copy:  $.extend({}, testSnapper)
  });
  after(() => {
    Snap.destroy();
    Snap = undefined;
  });
  beforeEach(() => {
    Snap.reset();
  });

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Snap).to.exist;
    });
    it('should be constructed by Snap', () => {
      expect(Snap.constructor.name).to.equal('Snap');
    });
    it('should have Snappers with keys: [point, rectangle, rotation]', () => {
      expect(Snap.Snappers).to.contain.all.keys(['point', 'rectangle', 'rotation']);
    });
  });
  describe('#reset', () => {
    it('should empty all Snapper maps and order lists', () => {
      let testType2 = 'rectangle';
      for (let id in testSnappers) {
        Snap.addSnapper(testType, $.extend({}, testSnappers[id]));
        Snap.addSnapper(testType2, $.extend({}, testSnappers[id]));
      }
      Snap.reset();
      expect(Snap.Snappers[testType].map).to.be.empty;
      expect(Snap.Snappers[testType].order).to.be.empty;
      expect(Snap.Snappers[testType2].map).to.be.empty;
      expect(Snap.Snappers[testType2].order).to.be.empty;
    });
  });

  describe('#addSnapper', () => {
    it('should return the added snapper', () => {
      let testSnapper1 = Snap.addSnapper(testType, $.extend({}, testSnapper));
      expect(testSnapper1).to.eql(testSnapper);
    });
    it('should add and track a Snapper by id', () => {
      Snap.addSnapper(testType, $.extend({}, testSnapper));
      expect(Snap.Snappers[testType].map['test-1']).to.exist;
    });
    it('should add and track a Snapper\'s id in the order list', () => {
      Snap.addSnapper(testType, $.extend({}, testSnapper));
      expect(Snap.Snappers[testType].order).to.contain('test-1');
    });
    it('should generate a sequential id if a Snapper with the same id already exists', () => {
      let testSnapper1 = Snap.addSnapper(testType, $.extend({}, testSnapper));
      let testSnapper2 = Snap.addSnapper(testType, $.extend({}, testSnapper));
      expect(testSnapper2.id).to.eql(testSnapper1.id+'-1');
    });
    it('should add and sort Snappers of the same type based on their priority', () => {
      for (let id in testSnappers) {
        Snap.addSnapper(testType, $.extend({}, testSnappers[id]));
      }
      expect(Snap.Snappers[testType].order).to.eql(testSnappersOrder);
    });
    it('should throw an error when given invalid type', () => {
      expect(() => {
        Snap.addSnapper('fake', $.extend({'id': 'test-1', 'priority': 0}, testConfigBase));
      }).to.throw(/Snapper of invalid type/);
    });
    it('should throw an error when given no config', () => {
      expect(() => {
        Snap.addSnapper(testType);
      }).to.throw(/Snapper with no configuration/);
    });
    it('should throw an error when config does not have a callback', () => {
      expect(() => {
        Snap.addSnapper(testType, {id: 'test-1', 'priority': 0});
      }).to.throw(/Snapper with no callback/);
    });
  });
  describe('#dropSnapper', () => {
    it('should remove a Snapper by id from its type\'s map and order list', () => {
      let testSnapper1 = Snap.addSnapper(testType, $.extend({}, testSnapper));
      Snap.dropSnapper(testType, testSnapper1.id);
      expect(Snap.Snappers[testType].map[testSnapper1.id]).to.not.exist;
      expect(Snap.Snappers[testType].order.indexOf(testSnapper1.id)).to.eql(-1);
    });
    it('should return the removed Snapper', () => {
      let testSnapper1 = Snap.addSnapper(testType, $.extend({}, testSnapper));
      let testSnapper2 = Snap.dropSnapper(testType, testSnapper1.id);
      expect(testSnapper2).to.equal(testSnapper1);
    });
    it('should return nothing if the given id does not exist', () => {
      let testSnapper1 = Snap.dropSnapper(testType, 'fake');
      expect(testSnapper1).to.not.exist;
    });
    it('should throw an error when given invalid type', () => {
      let testSnapper1 = Snap.addSnapper(testType, $.extend({}, testSnapper));
      expect(() => {
        Snap.dropSnapper('fake', testSnapper1.id);
      }).to.throw(/Snapper of invalid type/);
    });
  });
  describe('#refreshSnapperOrder', () => {
    it('should sort Snappers by priority', () => {
      // similar to #addSnapper test case, but inject Snappers manually
      // #refreshSnapperOrder is intended to be a lower-level method so this is for testing only
      for (let id in testSnappers) {
        Snap.Snappers[testType].map[id] = $.extend({}, testSnappers[id]);
        Snap.Snappers[testType].order.push(id);
      }
      Snap.refreshSnapperOrder(testType);
      expect(Snap.Snappers[testType].order).to.eql(testSnappersOrder);
    });
  });
  describe('#runSnappers', () => {
    beforeEach(() => {
      for (let id in testSnappers) {
        Snap.addSnapper(testType, $.extend({}, testSnappers[id]));
      }
    });
    afterEach(() => {
      Snap.reset();
    });
    it('should run Snappers in order', () => {
      // spy on the callbacks
      let spies = [];
      let spied = [];
      Snap.Snappers[testType].order.forEach((id) => {
        let snapper = Snap.Snappers[testType].map[id];
        if (typeof snapper.callback == 'function') {
          let spy = sinon.spy(snapper, 'callback');
          spied.push(snapper.callback);
          spies.push(spy);
        }
      });

      // run the snappers
      Snap.runSnappers(testType, 0);

      // calling with .apply allows us to pass array of spies
      sinon.assert.callOrder.apply(sinon.assert, spies);

      // restore the spied on functions
      spied.forEach((spied) => {
        spied.restore();
      });
    });
    it('should chain the snapper value', () => {
      let value = Snap.runSnappers(testType, 0);
      expect(value).to.eql(Snap.Snappers[testType].order.length);
      // remember the facetious example callback simply increments by 1
    });
    it('should be configurable and chain the snapper value', () => {
      let value = Snap.runSnappers(testType, 0, {increment: 10});
      expect(value).to.eql(Snap.Snappers[testType].order.length*10);
      // remember the facetious example callback allows us to pass an increment
    });
  });

  describe('#Point', () => {
    it('should return a paper.Point', () => {
      let checkPoint = Snap.Point();
      expect(checkPoint.constructor).equal(paper.Point);
    });
    it('should return a clone of a point', () => {
      let testPoint = new paper.Point;
      let checkPoint = Snap.Point(testPoint);
      expect(checkPoint).to.not.equal(testPoint);
    });
  });
  describe('#PointMin', () => {
    it('should return a paper.Point', () => {
      let checkPoint = Snap.PointMin();
      expect(checkPoint.constructor).equal(paper.Point);
    });
    it('should return a clone of a point', () => {
      let testPoint = new paper.Point;
      let checkPoint = Snap.PointMin(testPoint);
      expect(checkPoint).to.not.equal(testPoint);
    });
  });
  describe('#PointMax', () => {
    it('should return a paper.Point', () => {
      let checkPoint = Snap.PointMax();
      expect(checkPoint.constructor).equal(paper.Point);
    });
    it('should return a clone of a point', () => {
      let testPoint = new paper.Point;
      let checkPoint = Snap.PointMax(testPoint);
      expect(checkPoint).to.not.equal(testPoint);
    });
  });
  describe('#Rectangle', () => {
    it('should return a paper.Rectangle', () => {
      let checkRect = Snap.Rectangle();
      expect(checkRect.constructor).equal(paper.Rectangle);
    });
    it('should return a clone of a rectangle', () => {
      let testRect = new paper.Rectangle;
      let checkRect = Snap.Rectangle(testRect);
      expect(checkRect).to.not.equal(testRect);
    });
    describe('- when called with config.scheme==\'move\'', () => {
      it('should reposition the rectangle to fit in bounds');
    });
    describe('- when called with config.scheme==\'scale\'', () => {
      // @TODO: need to consider scaling from different sides/corners
      it('should resize the rectangle to fit in bounds');
    });
  });
  describe('#Rotation', () => {
    it('should return a snapped angle');
  });

  
});
