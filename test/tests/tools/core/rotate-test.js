describe('Tools.Core.Rotate', () => {
  let Rotate;
  let testAngles;
  before(() => {
    Test.assertSL();
    Rotate = new Test.Lib.Tools.Core.Rotate(Test.SL, {slices: 6}, Test.SL.Tools);
    testAngles = [0, 45, 90, 120, 150, 180, -45, -90, -120, -150, -180];
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Rotate).to.exist;
    });
    it('should be constructed by Rotate', () => {
      expect(Rotate.constructor.name).to.equal('Rotate');
    });
  });
  describe('#initCalc', () => {
    beforeEach(() => {
      Rotate.Calc = undefined;
    });
    it('should initialize Rotate.Calc', () => {
      Rotate.initCalc();
      expect(Rotate.Calc).to.exist;
    });
    it('should initialize Rotate.Calc with a degDenormalize function', () => {
      Rotate.initCalc();
      expect(typeof Rotate.Calc.degDenormalize).to.equal('function');
    });
    it('should initialize Rotate.Calc with a degNormalize function', () => {
      Rotate.initCalc();
      expect(typeof Rotate.Calc.degNormalize).to.equal('function');
    });
    it('should initialize Rotate.Calc with a degToRad function', () => {
      Rotate.initCalc();
      expect(typeof Rotate.Calc.degToRad).to.equal('function');
    });
    it('should initialize Rotate.Calc with a pointOnCircle function', () => {
      Rotate.initCalc();
      expect(typeof Rotate.Calc.pointOnCircle).to.equal('function');
    });
  });
  describe('+Calc', () => {
    function runTests(tests, config={}) {
      tests.forEach((test, index) => {
        // establish the expectations
        let expectResult = test;
        if (typeof config.expect == 'function') {
          expectResult = config.expect(test);
        }

        // run the function
        let checkResult = test;
        if (typeof config.testFunction == 'function') {
          checkResult = config.testFunction(test);
        }

        // check the expectations
        try {
          expect(checkResult).to.eql(expectResult);
        }
        catch (error) {
          throw `Failed on test [${index+1}/${tests.length}]: ${error}`;
        }
      });
    }
    describe('#Calc.degDenormalize', () => {
      it('should denormalize an angle by adding 90.0 degrees to it', () => {
        runTests(testAngles, {
          expect: function(angle) {
            return angle + 90.0;
          },
          testFunction: Rotate.Calc.degDenormalize
        });
      });
    });
    describe('#Calc.degNormalize', () => {
      it('should normalize an angle by subtracting 90.0 degrees from it', () => {
        runTests(testAngles, {
          expect: function(angle) {
            return angle - 90.0;
          },
          testFunction: Rotate.Calc.degNormalize
        });
      });
    });
    describe('#Calc.degToRad', () => {
      it('should convert an angle from degrees to radians', () => {
        runTests(testAngles, {
          expect: function(angle) {
            return angle * Math.PI / 180;
          },
          testFunction: Rotate.Calc.degToRad
        });
      });
    });
    describe('#Calc.pointOnCircle', () => {
      it('should return a point on a circle', () => {
        let centerPoint = new paper.Point(0,0);
        let testRadius = 50.0;
        runTests(testAngles, {
          expect: function(angle) {
            angle = Rotate.Calc.degToRad(angle);
            return centerPoint.add({
              x: testRadius * Math.cos(angle),
              y: testRadius * Math.sin(angle)
            });
          },
          testFunction: (angle) => {
            return Rotate.Calc.pointOnCircle(angle, centerPoint, testRadius);
          }
        });
      });
      it('should return a point on a circle when the center is not 0,0', () => {
        let centerPoint = new paper.Point(125.0, -75.0);
        let testRadius = 50.0;
        runTests(testAngles, {
          expect: function(angle) {
            angle = Rotate.Calc.degToRad(angle);
            return centerPoint.add({
              x: testRadius * Math.cos(angle),
              y: testRadius * Math.sin(angle)
            });
          },
          testFunction: (angle) => {
            return Rotate.Calc.pointOnCircle(angle, centerPoint, testRadius);
          }
        });
      });
    });
  });
  
  describe('#configure', () => {
    let wasConfig;
    beforeEach(() => {
      wasConfig = $.extend(true, {}, Rotate.config);
    });
    afterEach(() => {
      Rotate.config = wasConfig;
    });
    it('should force config.ui to be set', () => {
      Rotate.config.ui = undefined;
      Rotate.configure();
      expect(Rotate.config.ui).to.exist;
    });
    it('should force config.ui.color to be set', () => {
      Rotate.config.ui.color = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.color).to.not.be.empty;
    });
    it('should force config.ui.color2 to be set', () => {
      Rotate.config.ui.color2 = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.color2).to.not.be.empty;
    });
    it('should force config.ui.circle to be set', () => {
      Rotate.config.ui.circle = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.circle).to.exist;
    });
    it('should force config.ui.circle.strokeWidth to be set', () => {
      Rotate.config.ui.circle.strokeWidth = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.circle.strokeWidth).to.not.be.empty;
    });
    it('should force config.ui.circle.strokeColor to be set', () => {
      Rotate.config.ui.circle.strokeColor = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.circle.strokeColor).to.not.be.empty;
    });
    it('should force config.ui.circle.opacity to be set', () => {
      Rotate.config.ui.circle.opacity = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.circle.opacity).to.not.be.empty;
    });
    it('should force config.ui.circleActive to be set', () => {
      Rotate.config.ui.circleActive = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.circleActive).to.exist;
    });
    it('should force config.ui.circleActive.strokeWidth to be set', () => {
      Rotate.config.ui.circleActive.strokeWidth = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.circleActive.strokeWidth).to.not.be.empty;
    });
    it('should force config.ui.circleActive.strokeColor to be set', () => {
      Rotate.config.ui.circleActive.strokeColor = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.circleActive.strokeColor).to.not.be.empty;
    });
    it('should force config.ui.circleActive.opacity to be set', () => {
      Rotate.config.ui.circleActive.opacity = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.circleActive.opacity).to.not.be.empty;
    });
    it('should force config.ui.handle to be set', () => {
      Rotate.config.ui.handle = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.handle).to.exist;
    });
    it('should force config.ui.handle.size to be set', () => {
      Rotate.config.ui.handle.size = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.handle.size).to.not.be.empty;
    });
    it('should force config.ui.handle.strokeWidth to be set', () => {
      Rotate.config.ui.handle.strokeWidth = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.handle.strokeWidth).to.not.be.empty;
    });
    it('should force config.ui.handle.strokeColor to be set', () => {
      Rotate.config.ui.handle.strokeColor = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.handle.strokeColor).to.not.be.empty;
    });
    it('should force config.ui.handle.fillColor to be set', () => {
      Rotate.config.ui.handle.fillColor = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.handle.fillColor).to.not.be.empty;
    });
    it('should force config.ui.handle.opacity to be set', () => {
      Rotate.config.ui.handle.opacity = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.handle.opacity).to.not.be.empty;
    });
    it('should force config.ui.current to be set', () => {
      Rotate.config.ui.current = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.current).to.exist;
    });
    it('should force config.ui.current.strokeWidth to be set', () => {
      Rotate.config.ui.current.strokeWidth = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.current.strokeWidth).to.not.be.empty;
    });
    it('should force config.ui.current.strokeColor to be set', () => {
      Rotate.config.ui.current.strokeColor = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.current.strokeColor).to.not.be.empty;
    });
    it('should force config.ui.current.opacity to be set', () => {
      Rotate.config.ui.current.opacity = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.current.opacity).to.not.be.empty;
    });
    it('should force config.ui.slices to be set', () => {
      Rotate.config.ui.slices = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices).to.exist;
    });
    it('should force config.ui.slices.opacity to be set', () => {
      Rotate.config.ui.slices.opacity = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.opacity).to.not.be.empty;
    });
    it('should force config.ui.slices.hideCircle to be set', () => {
      Rotate.config.ui.slices.hideCircle = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.hideCircle).to.not.be.empty;
    });
    it('should force config.ui.slices.circles to be set', () => {
      Rotate.config.ui.slices.circles = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.circles).to.exist;
    });
    it('should force config.ui.slices.circles.distance to be set', () => {
      Rotate.config.ui.slices.circles.distance = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.circles.distance).to.not.be.empty;
    });
    it('should force config.ui.slices.circles.size to be set', () => {
      Rotate.config.ui.slices.circles.size = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.circles.size).to.not.be.empty;
    });
    it('should force config.ui.slices.circles.strokeWidth to be set', () => {
      Rotate.config.ui.slices.circles.strokeWidth = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.circles.strokeWidth).to.not.be.empty;
    });
    it('should force config.ui.slices.circles.strokeColor to be set', () => {
      Rotate.config.ui.slices.circles.strokeColor = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.circles.strokeColor).to.not.be.empty;
    });
    it('should force config.ui.slices.circles.opacity to be set', () => {
      Rotate.config.ui.slices.circles.opacity = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.circles.opacity).to.not.be.empty;
    });
    it('should force config.ui.slices.lines to be set', () => {
      Rotate.config.ui.slices.lines = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.lines).to.exist;
    });
    it('should force config.ui.slices.lines.distance to be set', () => {
      Rotate.config.ui.slices.lines.distance = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.lines.distance).to.not.be.empty;
    });
    it('should force config.ui.slices.lines.strokeWidth to be set', () => {
      Rotate.config.ui.slices.lines.strokeWidth = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.lines.strokeWidth).to.not.be.empty;
    });
    it('should force config.ui.slices.lines.strokeColor to be set', () => {
      Rotate.config.ui.slices.lines.strokeColor = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.lines.strokeColor).to.not.be.empty;
    });
    it('should force config.ui.slices.lines.opacity to be set', () => {
      Rotate.config.ui.slices.lines.opacity = undefined;
      Rotate.configure();
      expect(Rotate.config.ui.slices.lines.opacity).to.not.be.empty;
    });
  });
  describe('#reset', () => {
    it('should call resetState', () => {
      let spy = sinon.spy(Rotate, 'resetState');
      Rotate.reset();
      expect(spy.callCount).to.equal(1);
      Rotate.resetState.restore();
    });
    it('should call resetUI', () => {
      let spy = sinon.spy(Rotate, 'resetUI');
      Rotate.reset();
      expect(spy.callCount).to.equal(1);
      Rotate.resetUI.restore();
    });
  });
  describe('#resetState', () => {
    let wasActive;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
    });
    after(() => {
      Rotate.active = wasActive;
    });
    it('should reset State.rotation', () => {
      Rotate.State.rotation = Rotate.Calc.degNormalize(135.0);
      Rotate.resetState();
      expect(Rotate.State.rotation).to.equal(Rotate.Calc.degNormalize(0));
    });
    it('should empty out State.Mouse.Hover', () => {
      Rotate.onMouseMove(); // quick way to populate State.Mouse.Hover
      Rotate.resetState();
      expect(Rotate.State.Mouse.Hover).to.be.empty;
    });
    it('should reset State.Mouse.Dragging', () => {
      Rotate.State.Mouse.Dragging = true;
      Rotate.resetState();
      expect(Rotate.State.Mouse.Dragging).to.be.false;
    });
  });
  describe('+activationPriority', () => {
    describe('- when State.Mouse.Hover.ui is true', () => {
      let wasHoverUI;
      before(() => {
        wasHoverUI = Rotate.State.Mouse.Hover.ui;
      });
      after(() => {
        Rotate.State.Mouse.Hover.ui = wasHoverUI;
      });
      it('should return 50', () => {
        Rotate.State.Mouse.Hover.ui = true;
        let checkPrio = Rotate.activationPriority;
        expect(checkPrio).to.equal(50);
      });
    });
    describe('- otherwise', () => {
      it('should return -1', () => {
        Rotate.State.Mouse.Hover.ui = false;
        expect(Rotate.activationPriority).to.equal(-1);
      });
    });
  });
  describe('+currentAngle', () => {
    let wasRotation;
    before(() => {
      wasRotation = Rotate.State.rotation;
    });
    after(() => {
      Rotate.State.rotation = wasRotation;
    });
    it('should return State.rotation when it is set', () => {
      Rotate.State.rotation = Rotate.Calc.degNormalize(135.0);
      expect(Rotate.currentAngle).to.equal(Rotate.State.rotation);
    });
    it('should return -90.0 when State.rotation is not set', () => {
      Rotate.State.rotation = undefined;
      expect(Rotate.currentAngle).to.equal(-90.0);
    });
  });
  describe('+currentAngleRad', () => {
    let wasRotation;
    before(() => {
      wasRotation = Rotate.State.rotation;
    });
    after(() => {
      Rotate.State.rotation = wasRotation;
    });
    it('should return currentAngle as radians', () => {
      Rotate.State.rotation = Rotate.Calc.degNormalize(135.0);
      expect(Rotate.currentAngleRad).to.equal(Rotate.Calc.degToRad(Rotate.State.rotation));
    });
  });
  describe('+degPerSlice', () => {
    let wasSlices;
    before(() => {
      wasSlices = Rotate.config.slices;
    });
    after(() => {
      Rotate.config.slices = wasSlices;
    });
    it('should return 360.0 degrees divided by config.slices', () => {
      Rotate.config.slices = 6;
      expect(Rotate.degPerSlice).to.equal(360.0/Rotate.config.slices);
    });
  });
  describe('#refreshUI', () => {
    let testItem;
    before(() => {
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
    });
    after(() => {
      Rotate.SL.Paper.destroyPaperItem(testItem);
    });
    beforeEach(() => {
      Rotate.Belt.Belt.Select.Select(testItem);
    });
    afterEach(() => {
      Rotate.Belt.Belt.Select.Unselect();
    });
    it('should create UI.circle if Select.hasItems()', () => {
      Rotate.resetUI();
      Rotate.refreshUI();
      expect(Rotate.UI.circle).to.exist;
    });
    it('should call resetUI() when !Select.hasItems()', () => {
      let spy = sinon.spy(Rotate, 'resetUI');
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.refreshUI();
      expect(spy.callCount).to.equal(1);
      Rotate.resetUI.restore();
    });
    describe('when it is active', () => {
      let wasActive;
      before(() => {
        wasActive = Rotate.active;
        Rotate.active = true;
      });
      after(() => {
        Rotate.active = wasActive;
      });
      it('should call refreshUISlices()', () => {
        let spy = sinon.spy(Rotate, 'refreshUISlices');
        Rotate.refreshUI();
        Rotate.refreshUISlices.restore();
      });
      it('should call refreshUIHandle()', () => {
        let spy = sinon.spy(Rotate, 'refreshUIHandle');
        Rotate.refreshUI();
        Rotate.refreshUIHandle.restore();
      });
      it('should activate the "rotate" cursor', () => {
        let spy = sinon.spy(Rotate.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('rotate');
        Rotate.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Rotate.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
    describe('when it is not active', () => {
      let wasActive;
      before(() => {
        wasActive = Rotate.active;
        Rotate.active = false;
      });
      after(() => {
        Rotate.active = wasActive;
      });
      it('should call resetUIHandle()', () => {
        let spy = sinon.spy(Rotate, 'resetUIHandle');;
        Rotate.refreshUI();
        Rotate.resetUIHandle.restore();
      });
      it('should call resetUISlices()', () => {
        let spy = sinon.spy(Rotate, 'resetUISlices');;
        Rotate.refreshUI();
        Rotate.resetUISlices.restore();
      });
    });
  });
  describe('#resetUI', () => {
    let testItem;
    before(() => {
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
    });
    after(() => {
      Rotate.SL.Paper.destroyPaperItem(testItem);
    });
    beforeEach(() => {
      Rotate.Belt.Belt.Select.Select(testItem);
      Rotate.refreshUI();
    });
    afterEach(() => {
      Rotate.Belt.Belt.Select.Unselect();
    });
    it('should destroy UI.circle', () => {
      Rotate.resetUI();
      expect(Rotate.UI.circle).to.not.exist;
    });
    it('should call resetUIHandle()', () => {
      let spy = sinon.spy(Rotate, 'resetUIHandle');
      Rotate.resetUI();
      Rotate.resetUIHandle.restore();
    });
    it('should call resetUISlices()', () => {
      let spy = sinon.spy(Rotate, 'resetUISlices');
      Rotate.resetUI();
      Rotate.resetUISlices.restore();
    });
  });
  describe('#refreshUIHandle', () => {
    let wasActive;
    let testItem, testCircle;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Rotate.Belt.Belt.Select.Select(testItem);
      Rotate.refreshUI();
      testCircle = Rotate.UI.circle;
    });
    after(() => {
      testCircle = undefined;
      Rotate.active = wasActive;
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.SL.Paper.destroyPaperItem(testItem);
      Rotate.reset();
    });
    beforeEach(() => {
      Rotate.resetUI();
      Rotate.UI.circle = testCircle;
    });
    it('should create UI.handle', () => {
      Rotate.refreshUIHandle();
      expect(Rotate.UI.handle).to.exist;
    });
    it('should create UI.current when config.ui.current', () => {
      Rotate.refreshUIHandle();
      expect(Rotate.UI.current).to.exist;
    });
  });
  describe('#resetUIHandle', () => {
    let wasActive;
    let testItem, testCircle;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Rotate.Belt.Belt.Select.Select(testItem);
    });
    after(() => {
      Rotate.active = wasActive;
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.SL.Paper.destroyPaperItem(testItem);
      Rotate.reset();
    });
    beforeEach(() => {
      Rotate.refreshUI();
    });
    it('should destroy UI.handle', () => {
      Rotate.resetUIHandle();
      expect(Rotate.UI.handle).to.not.exist;
    });
    it('should destroy UI.current', () => {
      Rotate.resetUIHandle();
      expect(Rotate.UI.current).to.not.exist;
    });
  });
  describe('#refreshUISlices', () => {
    let wasActive;
    let testItem, testCircle;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Rotate.Belt.Belt.Select.Select(testItem);
      Rotate.refreshUI();
      testCircle = Rotate.UI.circle;
    });
    after(() => {
      testCircle = undefined;
      Rotate.active = wasActive;
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.SL.Paper.destroyPaperItem(testItem);
      Rotate.reset();
    });
    beforeEach(() => {
      Rotate.resetUI();
      Rotate.UI.circle = testCircle;
    });
    it('should create UI.slices', () => {
      Rotate.refreshUISlices();
      expect(Rotate.UI.slices).to.exist;
    });
    it('should add children to UI.slices', () => {
      Rotate.refreshUISlices();
      expect(Rotate.UI.slices.children).to.not.be.empty;
    });
  });
  describe('#getUISliceAt', () => {
    let wasActive;
    let testItem;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Rotate.Belt.Belt.Select.Select(testItem);
      Rotate.refreshUI();
    });
    after(() => {
      Rotate.active = wasActive;
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.SL.Paper.destroyPaperItem(testItem);
      Rotate.reset();
    });
    it('should return the index of a slice if the given point is contained in one', () => {
      let sliceCircle = (Rotate.UI.slices.children.length > 1) ? Rotate.UI.slices.children[1] : null;
      if (!sliceCircle) {
        throw 'Could not find a slice circle to test!';
      }
      let testPoint = sliceCircle.position.add({x: -3, y: 2});
      let checkSlice = Rotate.getUISliceAt(testPoint);
      expect(checkSlice).to.equal(0);
    });
    it('should return -1 if the given point is not contained in one', () => {
      let sliceCircle = (Rotate.UI.slices.children.length > 1) ? Rotate.UI.slices.children[1] : null;
      if (!sliceCircle) {
        throw 'Could not find a slice circle to test!';
      }
      let testPoint = sliceCircle.position.add({x: -150, y: 200});
      let checkSlice = Rotate.getUISliceAt(testPoint);
      expect(checkSlice).to.equal(-1);
    });
  });
  describe('#resetUISlices', () => {
    let wasActive;
    let testItem;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Rotate.Belt.Belt.Select.Select(testItem);
    });
    after(() => {
      Rotate.active = wasActive;
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.SL.Paper.destroyPaperItem(testItem);
      Rotate.reset();
    });
    beforeEach(() => {
      Rotate.refreshUI();
    });
    it('should destroy all children of UI.slices', () => {
      let spy = sinon.spy(Rotate.SL.Paper, 'destroyPaperItem');
      let childCount = Rotate.UI.slices.children.length;
      Rotate.resetUISlices();
      expect(spy.callCount).to.equal(childCount + 1);
      Rotate.SL.Paper.destroyPaperItem.restore();
    });
    it('should destroy UI.slices', () => {
      Rotate.resetUISlices();
      expect(Rotate.UI.slices).to.not.exist;
    });
  });
  describe('#setAngle', () => {
    it('should set State.rotation', () => {
      let checkAngle = Rotate.State.rotation;
      Rotate.setAngle(210);
      expect(Rotate.State.rotation).to.not.equal(checkAngle);
    });
  });
  describe('#onMouseMove', () => {
    let wasActive, wasMousePoint;
    let testItem;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Rotate.Belt.Belt.Select.Select(testItem);
      Rotate.refreshUI();
    });
    after(() => {
      Rotate.active = wasActive;
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.SL.Paper.destroyPaperItem(testItem);
      Rotate.reset();
    });
    beforeEach(() => {
      wasMousePoint = Rotate.SL.UI.Mouse.State.point;
    });
    afterEach(() => {
      Rotate.SL.UI.Mouse.State.point = wasMousePoint;
    });
    it('should set State.Mouse.Hover.circle if UI.circle is hovered', () => {
      Rotate.SL.UI.Mouse.State.point = Rotate.UI.circle.position.clone();
      Rotate.State.Mouse.Hover.circle = false;
      Rotate.onMouseMove();
      expect(Rotate.State.Mouse.Hover.circle).to.be.true;
    });
    it('should set State.Mouse.Hover.handle if UI.handle is hovered', () => {
      Rotate.SL.UI.Mouse.State.point = Rotate.UI.handle.position.clone();
      Rotate.State.Mouse.Hover.handle = false;
      Rotate.onMouseMove();
      expect(Rotate.State.Mouse.Hover.handle).to.be.true;
    });
    it('should set State.Mouse.Hover.slice if any slice circles are hovered', () => {
      let sliceCircle = (Rotate.UI.slices.children.length > 1) ? Rotate.UI.slices.children[1] : null;
      if (sliceCircle) {
        Rotate.SL.UI.Mouse.State.point = sliceCircle.position.clone();
      }
      Rotate.State.Mouse.Hover.slice = -1;
      Rotate.onMouseMove();
      expect(Rotate.State.Mouse.Hover.slice).to.not.equal(-1);
    });
    it('should set State.Mouse.Hover.ui if the circle is hovered', () => {
      Rotate.SL.UI.Mouse.State.point = Rotate.UI.circle.position.clone();
      Rotate.State.Mouse.Hover.circle = false;
      Rotate.State.Mouse.Hover.ui = false;
      Rotate.onMouseMove();
      expect(Rotate.State.Mouse.Hover.ui).to.be.true;
    });
    it('should set State.Mouse.Hover.ui if the handle is hovered', () => {
      Rotate.SL.UI.Mouse.State.point = Rotate.UI.handle.position.clone();
      Rotate.State.Mouse.Hover.handle = false;
      Rotate.State.Mouse.Hover.ui = false;
      Rotate.onMouseMove();
      expect(Rotate.State.Mouse.Hover.ui).to.be.true;
    });
    it('should set State.Mouse.Hover.ui if the any slice circles are hovered', () => {
      let sliceCircle = (Rotate.UI.slices.children.length > 1) ? Rotate.UI.slices.children[1] : null;
      if (sliceCircle) {
        Rotate.SL.UI.Mouse.State.point = sliceCircle.position.clone();
      }
      Rotate.State.Mouse.Hover.slice = -1;
      Rotate.State.Mouse.Hover.ui = false;
      Rotate.onMouseMove();
      expect(Rotate.State.Mouse.Hover.ui).to.be.true;
    });
  });
  describe('#onMouseDrag', () => {
    let wasActive;
    let testItem;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Rotate.Belt.Belt.Select.Select(testItem);
      Rotate.refreshUI();
    });
    after(() => {
      Rotate.active = wasActive;
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.SL.Paper.destroyPaperItem(testItem);
      Rotate.reset();
    });
    it('should set State.Mouse.Dragging to true', () => {
      Rotate.State.Mouse.Dragging = false;
      Rotate.onMouseDrag({point: new paper.Point(20, 20)});
      expect(Rotate.State.Mouse.Dragging).to.be.true;
    });
    it('should call setAngle', () => {
      let spy = sinon.spy(Rotate, 'setAngle');
      Rotate.onMouseDrag({point: new paper.Point(20, 20)});
      expect(spy.callCount).to.equal(1);
      Rotate.setAngle.restore();
    });
  });
  describe('#onMouseUp', () => {
    it('should set State.Mouse.Dragging to false', () => {
      Rotate.State.Mouse.Dragging = true;
      Rotate.onMouseUp();
      expect(Rotate.State.Mouse.Dragging).to.be.false;
    });
    it('should call Belt.Select.SnapSelected', () => {
      Rotate.State.Mouse.Dragging = true;
      let spy = sinon.spy(Rotate.Belt.Belt.Select, 'SnapSelected');
      Rotate.onMouseUp();
      expect(spy.callCount).to.equal(1);
      Rotate.Belt.Belt.Select.SnapSelected.restore();
    });
  });
  describe('#onSelectionItemSelected', () => {
    let wasActive;
    let testItem;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.refreshUI();
    });
    after(() => {
      Rotate.active = wasActive;
      Rotate.SL.Paper.destroyPaperItem(testItem);
    });
    afterEach(() => {
      Rotate.Belt.Belt.Select.Unselect();
      Rotate.reset();
    });
    describe('- when only one item is selected', () => {
      it('should set State.rotation to that item\'s rotation', () => {
        testItem.rotation = 45;
        Rotate.Belt.Belt.Select.Select(testItem);
        Rotate.onSelectionItemSelected(testItem);
        expect(Rotate.State.rotation).to.equal(Rotate.Calc.degNormalize(testItem.rotation));
      });
    });
    describe('- when multiple items are selected and the newest one has a different angle', () => {
      let testItem2;
      before(() => {
        testItem2 =  Rotate.SL.Paper.generatePaperItem({
          Class: 'Content',
          Layer: Rotate.SL.Paper.Layers.CONTENT
        }, paper.Shape.Circle, new paper.Point(125, 250), 50);
      });
      after(() => {
        Rotate.SL.Paper.destroyPaperItem(testItem2);
      });
      it('should reset State.rotation', () => {
        testItem.rotation = 45;
        testItem2.rotation = 210;
        Rotate.Belt.Belt.Select.Select(testItem);
        Rotate.Belt.Belt.Select.Select(testItem2);
        Rotate.onSelectionItemSelected(testItem2);
        expect(Rotate.State.rotation).to.equal(Rotate.Calc.degNormalize(0));
      });
    });
    describe('- when multiple items are selected and the newest one has the same angle', () => {
      let testItem2;
      before(() => {
        testItem2 =  Rotate.SL.Paper.generatePaperItem({
          Class: 'Content',
          Layer: Rotate.SL.Paper.Layers.CONTENT
        }, paper.Shape.Circle, new paper.Point(125, 250), 50);
      });
      after(() => {
        Rotate.SL.Paper.destroyPaperItem(testItem2);
      });
      it('should keep the same State.rotation', () => {
        testItem.rotation = 60;
        testItem2.rotation = 60;
        Rotate.Belt.Belt.Select.Select(testItem);
        Rotate.onSelectionItemSelected(testItem);
        Rotate.Belt.Belt.Select.Select(testItem2);
        Rotate.onSelectionItemSelected(testItem2);
        expect(Rotate.State.rotation).to.equal(Rotate.Calc.degNormalize(60));
      });
    });
  });
  describe('#onSelectionItemUnselected', () => {
    let wasActive;
    let testItem, testItem2;
    before(() => {
      wasActive = Rotate.active;
      Rotate.active = true;
      testItem = Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);

      testItem2 =  Rotate.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Rotate.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(125, 250), 50);

      Rotate.Belt.Belt.Select.Unselect();
      Rotate.refreshUI();
    });
    after(() => {
      Rotate.active = wasActive;
      Rotate.SL.Paper.destroyPaperItem(testItem);
      Rotate.SL.Paper.destroyPaperItem(testItem2);
    });
    describe('- when only one item is left selected', () => {
      before(() => {
        testItem.rotation = 60;
        testItem2.rotation = 210;
        Rotate.Belt.Belt.Select.Select(testItem);
        Rotate.onSelectionItemSelected(testItem);
        Rotate.Belt.Belt.Select.Select(testItem2);
        Rotate.onSelectionItemSelected(testItem2);
      });
      it('should set State.rotation to that item\'s rotation', () => {
        Rotate.Belt.Belt.Select.Unselect(testItem);
        Rotate.onSelectionItemUnselected(testItem);
        expect(Rotate.State.rotation).to.equal(Rotate.Calc.degNormalize(210));
      });
    });
  });
});
