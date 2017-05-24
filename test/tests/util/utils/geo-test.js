describe('Utils.Geo', () => {
  let Geo;
  before(() => {
    Test.assertSL();
    Geo = new Test.Lib.Utils.Geo(Test.SL, Test.SL.Utils.config.Geo);
  });
  after(() => {
    Geo.destroy();
    Geo = undefined;
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Geo).to.exist;
    });
    it('should be constructed by Geo', () => {
      expect(Geo.constructor.name).to.equal('Geo');
    });
  });
  describe('Utils.Geo.Normalize', () => {
    let rectangle;
    let testPoints;
    before(() => {
      rectangle = new paper.Rectangle(0, 0, 160, 150);
      testPoints = [
        {normal: {x: -1.0, y: -1.0}, global: {x: 0, y: 0}},
        {normal: {x: 0.0, y: 0.0}, global: {x: 80, y: 75}},
        {normal: {x: 1.0, y: -1.0}, global: {x: 160, y: 0}},
        {normal: {x: 1.0, y: 0.0}, global: {x: 160, y: 75}},
        {normal: {x: 1.0, y: 1.0}, global: {x: 160, y: 150}},
        {normal: {x: 0.0, y: 1.0}, global: {x: 80, y: 150}},
        {normal: {x: -1.0, y: 1.0}, global: {x: 0, y: 150}},
        {normal: {x: -1.0, y: 0.0}, global: {x: 0, y: 75}},
        {normal: {x: 0.0, y: -1.0}, global: {x: 80, y: 0}}
      ];
    });
    after(() => {
      rectangle = undefined;
    });
    function runTests(testFunction, tests, rectangle, testProp, expectProp, shiftGlobal) {
      if (typeof testFunction != 'function') {
        throw 'Invalid testFunction supplied!';
      }
      tests.forEach((test, index) => {
        let shiftPoint = new paper.Point();
        if (shiftGlobal) {
          shiftPoint.set({
            x: rectangle.width/2.0,
            y: rectangle.height/2.0
          });
        }
        // establish the expectations
        let expectResult = new paper.Point(test[expectProp]);
        if (shiftGlobal && expectProp == 'global') {
          expectResult = expectResult.subtract(shiftPoint);
        }

        // establish the test point
        let testPoint = new paper.Point(test[testProp]);
        if (shiftGlobal && testProp == 'global') {
          testPoint = testPoint.subtract(shiftPoint);
        }

        // run the function
        let checkResult = testFunction(testPoint, rectangle);

        // check the expectations
        try {
          expect(checkResult).to.eql(expectResult);
        }
        catch (error) {
          throw `Failed on test [${index+1}/${tests.length}]: ${error}`;
        }
      });
    }
    describe('#pointToRectangle', () => {
      describe('when called with values outside of -1.0 to 1.0 range', () => {
        it('should normalize them based on the rectangle\'s size', () => {
          runTests(Geo.Normalize.pointToRectangle, testPoints, rectangle, 'global', 'normal', true);
        });
      });
      describe('when called with values within the -1.0 to 1.0 range', () => {
        it('should return the point unchanged', () => {
          runTests(Geo.Normalize.pointToRectangle, testPoints, rectangle, 'normal', 'normal');
        });
      });
    });
    describe('#pointFromRectangle', () => {
      it('should transform a point that is local to the rectangle into a global point', () => {
        runTests(Geo.Normalize.pointFromRectangle, testPoints, rectangle, 'normal', 'global');
      });
    });
  });
});
