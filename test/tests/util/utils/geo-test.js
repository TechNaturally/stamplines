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
    it('should initialize with a Direction property', () => {
      expect(Geo.Direction).to.exist;
    });
    it('should initialize with a Normalize property', () => {
      expect(Geo.Normalize).to.exist;
    });
  });
  describe('Utils.Geo.Direction', () => {
    describe('#vector', () => {
      let testDirections;
      before(() => {
        testDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      });
      after(() => {
        testDirections = undefined;
      });
      it('should map a 1 or 2 character direction code to a point vector', () => {
        for (let direction of testDirections) {
          try {
            let check = Geo.Direction.vector(direction);
            expect(check instanceof paper.Point).to.be.true;
          }
          catch (error) {
            throw `Failed on test '${direction}': ${error}`;
          }
        }
      });
      it('should return a vector with a length of the given magnitude', () => {
        let testMagnitude = 5.2;
        for (let direction of testDirections) {
          try {
            let check = Geo.Direction.vector(direction, testMagnitude);
            expect(check.length).to.equal(testMagnitude);
          }
          catch (error) {
            throw `Failed on test '${direction}': ${error}`;
          }
        }
      });
      it('should return a unit vector (length == 1.0) if no magnitude is given', () => {
        for (let direction of testDirections) {
          try {
            let check = Geo.Direction.vector(direction);
            expect(check.length).to.equal(1.0);
          }
          catch (error) {
            throw `Failed on test '${direction}': ${error}`;
          }
        }
      });
      it('should return nothing if an invalid edge is given', () => {
        let check = Geo.Direction.vector('FOO');
        expect(check).to.not.exist;
      });
    });
    describe('#equal', () => {
      it('should return true if two vectors have the same angle', () => {
        let vector1 = new paper.Point(50, 50);
        let vector2 = new paper.Point(150, 150);
        expect(Geo.Direction.equal(vector1, vector2)).to.be.true;
      });
      it('should return false if two vectors have different angles', () => {
        let vector1 = new paper.Point(50, 50);
        let vector2 = new paper.Point(0, 150);
        expect(Geo.Direction.equal(vector1, vector2)).to.be.false;
      });
    });
    describe('#edgePoint', () => {
      let rectangle;
      before(() => {
        rectangle = new paper.Rectangle(0, 0, 160, 150);
      });
      after(() => {
        rectangle = undefined;
      });
      describe('when called with N', () => {
        it('should return the top-center point of the rectangle', () => {
          let checkPoint = Geo.Direction.edgePoint('N', rectangle);
          let expectPoint = new paper.Point(rectangle.topCenter);
          expect(checkPoint).to.eql(expectPoint);
        });
        it('should return the bottom-center point of the rectangle when called with opposite=true', () => {
          let checkPoint = Geo.Direction.edgePoint('N', rectangle, true);
          let expectPoint = new paper.Point(rectangle.bottomCenter);
          expect(checkPoint).to.eql(expectPoint);
        });
      });
      describe('when called with NE', () => {
        it('should return the top-right point of the rectangle', () => {
          let checkPoint = Geo.Direction.edgePoint('NE', rectangle);
          let expectPoint = new paper.Point(rectangle.topRight);
          expect(checkPoint).to.eql(expectPoint);
        });
        it('should return the bottom-left point of the rectangle when called with opposite=true', () => {
          let checkPoint = Geo.Direction.edgePoint('NE', rectangle, true);
          let expectPoint = new paper.Point(rectangle.bottomLeft);
          expect(checkPoint).to.eql(expectPoint);
        });
      });
      describe('when called with E', () => {
        it('should return the right-center point of the rectangle', () => {
          let checkPoint = Geo.Direction.edgePoint('E', rectangle);
          let expectPoint = new paper.Point(rectangle.rightCenter);
          expect(checkPoint).to.eql(expectPoint);
        });
        it('should return the left-center point of the rectangle when called with opposite=true', () => {
          let checkPoint = Geo.Direction.edgePoint('E', rectangle, true);
          let expectPoint = new paper.Point(rectangle.leftCenter);
          expect(checkPoint).to.eql(expectPoint);
        });
      });
      describe('when called with SE', () => {
        it('should return the bottom-right point of the rectangle', () => {
          let checkPoint = Geo.Direction.edgePoint('SE', rectangle);
          let expectPoint = new paper.Point(rectangle.bottomRight);
          expect(checkPoint).to.eql(expectPoint);
        });
        it('should return the top-left point of the rectangle when called with opposite=true', () => {
          let checkPoint = Geo.Direction.edgePoint('SE', rectangle, true);
          let expectPoint = new paper.Point(rectangle.topLeft);
          expect(checkPoint).to.eql(expectPoint);
        });
      });
      describe('when called with S', () => {
        it('should return the bottom-center point of the rectangle', () => {
          let checkPoint = Geo.Direction.edgePoint('S', rectangle);
          let expectPoint = new paper.Point(rectangle.bottomCenter);
          expect(checkPoint).to.eql(expectPoint);
        });
        it('should return the top-center point of the rectangle when called with opposite=true', () => {
          let checkPoint = Geo.Direction.edgePoint('S', rectangle, true);
          let expectPoint = new paper.Point(rectangle.topCenter);
          expect(checkPoint).to.eql(expectPoint);
        });
      });
      describe('when called with SW', () => {
        it('should return the bottom-left point of the rectangle', () => {
          let checkPoint = Geo.Direction.edgePoint('SW', rectangle);
          let expectPoint = new paper.Point(rectangle.bottomLeft);
          expect(checkPoint).to.eql(expectPoint);
        });
        it('should return the top-right point of the rectangle when called with opposite=true', () => {
          let checkPoint = Geo.Direction.edgePoint('SW', rectangle, true);
          let expectPoint = new paper.Point(rectangle.topRight);
          expect(checkPoint).to.eql(expectPoint);
        });
      });
      describe('when called with W', () => {
        it('should return the left-center point of the rectangle', () => {
          let checkPoint = Geo.Direction.edgePoint('W', rectangle);
          let expectPoint = new paper.Point(rectangle.leftCenter);
          expect(checkPoint).to.eql(expectPoint);
        });
        it('should return the right-center point of the rectangle when called with opposite=true', () => {
          let checkPoint = Geo.Direction.edgePoint('W', rectangle, true);
          let expectPoint = new paper.Point(rectangle.rightCenter);
          expect(checkPoint).to.eql(expectPoint);
        });
      });
      describe('when called with NW', () => {
        it('should return the top-left point of the rectangle', () => {
          let checkPoint = Geo.Direction.edgePoint('NW', rectangle);
          let expectPoint = new paper.Point(rectangle.topLeft);
          expect(checkPoint).to.eql(expectPoint);
        });
        it('should return the bottom-right point of the rectangle when called with opposite=true', () => {
          let checkPoint = Geo.Direction.edgePoint('NW', rectangle, true);
          let expectPoint = new paper.Point(rectangle.bottomRight);
          expect(checkPoint).to.eql(expectPoint);
        });
      });
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
      testPoints = undefined;
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
