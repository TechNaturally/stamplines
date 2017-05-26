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
    Snap.configure();
  });

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Snap).to.exist;
    });
    it('should be constructed by Snap', () => {
      expect(Snap.constructor.name).to.equal('Snap');
    });
    it('should have Snappers with keys: [point, rectangle, rotation]', () => {
      expect(Snap.Snaps).to.contain.all.keys(['point', 'rectangle', 'rotation']);
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
      expect(Snap.Snaps[testType].map).to.be.empty;
      expect(Snap.Snaps[testType].order).to.be.empty;
      expect(Snap.Snaps[testType2].map).to.be.empty;
      expect(Snap.Snaps[testType2].order).to.be.empty;
    });
  });

  describe('#addSnapper', () => {
    it('should return the added snapper', () => {
      let testSnapper1 = Snap.addSnapper(testType, $.extend({}, testSnapper));
      expect(testSnapper1).to.eql(testSnapper);
    });
    it('should add and track a Snapper by id', () => {
      Snap.addSnapper(testType, $.extend({}, testSnapper));
      expect(Snap.Snaps[testType].map['test-1']).to.exist;
    });
    it('should add and track a Snapper\'s id in the order list', () => {
      Snap.addSnapper(testType, $.extend({}, testSnapper));
      expect(Snap.Snaps[testType].order).to.contain('test-1');
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
      expect(Snap.Snaps[testType].order).to.eql(testSnappersOrder);
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
      expect(Snap.Snaps[testType].map[testSnapper1.id]).to.not.exist;
      expect(Snap.Snaps[testType].order.indexOf(testSnapper1.id)).to.eql(-1);
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
  describe('#refreshSnapOrder', () => {
    it('should sort Snappers by priority', () => {
      // similar to #addSnapper test case, but inject Snappers manually
      // #refreshSnapOrder is intended to be a lower-level method so this is for testing only
      for (let id in testSnappers) {
        Snap.Snaps[testType].map[id] = $.extend({}, testSnappers[id]);
        Snap.Snaps[testType].order.push(id);
      }
      Snap.refreshSnapOrder(testType);
      expect(Snap.Snaps[testType].order).to.eql(testSnappersOrder);
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
      Snap.configure();
    });
    it('should run Snappers in order', () => {
      // spy on the callbacks
      let spies = [];
      let spied = [];
      Snap.Snaps[testType].order.forEach((id) => {
        let snapper = Snap.Snaps[testType].map[id];
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
      expect(value).to.eql(Snap.Snaps[testType].order.length);
      // remember the facetious example callback simply increments by 1
    });
    it('should be configurable and chain the snapper value', () => {
      let value = Snap.runSnappers(testType, 0, {increment: 10});
      expect(value).to.eql(Snap.Snaps[testType].order.length*10);
      // remember the facetious example callback allows us to pass an increment
    });
  });
  describe('#Around', () => {
    let tests, testThreshold;
    before(() => {
      testThreshold = 1;
      tests = [
        {target: 2, value: 0, expect: 0},
        {target: 2, value: 1, expect: 2},
        {target: 2, value: 2, expect: 2},
        {target: 2, value: 3, expect: 2},
        {target: 2, value: 4, expect: 4}
      ];
    });
    function runTests(tests, threshold) {
      tests.forEach((test, index) => {
        let checkAround = Snap.Around(test.target, test.value, threshold);

        // check the expectations
        try {
          expect(checkAround).to.equal(test.expect);
        }
        catch (error) {
          throw `Failed on test [${index+1}/${tests.length}]: ${error}`;
        }
      });
    }
    it('should return the target if the value is within threshold', () => {
      runTests(tests, testThreshold);
    });
  });
  describe('#Equal', () => {
    let testsTrue, testsFalse, testThreshold;
    before(() => {
      testThreshold = 1;
      testsTrue = [
        {value1: 2, value2: 1},
        {value1: 2, value2: 2},
        {value1: 2, value2: 3}
      ];
      testsFalse = [
        {value1: 2, value2: 0},
        {value1: 2, value2: 4}
      ];
    });
    function runTests(tests, config) {
      tests.forEach((test, index) => {
        let value1 = (config.flip ? test.value2 : test.value1);
        let value2 = (config.flip ? test.value1 : test.value2);

        // snap equality
        let checkEqual = Snap.Equal(value1, value2, testThreshold);

        // check the expectations
        try {
          expect(checkEqual).to.equal(config.expect);
        }
        catch (error) {
          throw `Failed on test [${index+1}/${tests.length}]: ${error}`;
        }
      });
    }
    it('should return true if value1 is within threshold of value2', () => {
      runTests(testsTrue, {expect: true});
    });
    it('should return true if value2 is within threshold of value1', () => {
      runTests(testsTrue, {expect: true, flip: true});
    });
    it('should return false if value1 is not within threshold of value2', () => {
      runTests(testsFalse, {expect: false});
    });
    it('should return false if value2 is not within threshold of value1', () => {
      runTests(testsFalse, {expect: false, flip: true});
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
  });
  describe('#Rotation', () => {
    let tests, testSlices, testIncrement;
    before(() => {
      testSlices = 12;
      testIncrement = 360.0 / testSlices;
      tests = [
        { angle: 12.0, expect: 0 },
        { angle: 17.0, expect: 30 },
        { angle: 44.9, expect: 30 },
        { angle: 45.0, expect: 60 },
        { angle: 45.1, expect: 60 }
      ];
    });
    function runTests(tests, config={}) {
      tests.forEach((test, index) => {
        // establish expectations
        let expectAngle = test.expect;
        if (!config.angleIncrement && !config.slices) {
          expectAngle = test.angle;
        }

        // snap the angle
        let checkAngle = Snap.Rotation(test.angle, config);

        // check the expectations
        try {
          expect(checkAngle).to.equal(expectAngle);
        }
        catch (error) {
          throw `Failed on test [${index+1}/${tests.length}]: ${error}`;
        }
      });
    }
    describe('- when given no config.angleIncrement and no config.slices', () => {
      it('should return the same angle', () => {
        runTests(tests, {});
      });
    });
    describe('- when given config.slices and no config.angleIncrement', () => {
      it('should return the closest multiple of 360.0/slices', () => {
        runTests(tests, {slices: testSlices});
      });
    });
    describe('- when given config.angleIncrement', () => {
      it('should return the closest multiple of angleIncrement', () => {
        runTests(tests, {slices: testSlices, angleIncrement: testIncrement});
      });
    });
  });  
});
