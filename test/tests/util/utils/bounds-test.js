describe('Utils.Bounds', () => {
  let Bounds;
  let testPadding = {
    top: 10,
    right: 24,
    bottom: 12,
    left: 16,
    foo: 'bar'
  };
  let paddingProps = ['top','right','bottom','left'];
  before(() => {
    Test.assertSL();
    Bounds = new Test.Lib.Utils.Bounds(Test.SL);
  });
  after(() => {
    Bounds.destroy();
    Bounds = undefined;
  });

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Bounds).to.exist;
    });
    it('should be constructed by Bounds', () => {
      expect(Bounds.constructor.name).to.equal('Bounds');
    });
  });

  describe('#setPadding', () => {
    beforeEach(() => {
      Bounds.padding = undefined;
    });
    it('should initialize Bounds.padding', () => {
      Bounds.setPadding();
      expect(Bounds.padding).to.exist;
    });
    it(`should initialize Bounds.padding with properties: [${paddingProps}]`, () => {
      Bounds.setPadding();
      expect(Bounds.padding).to.have.all.keys(paddingProps);
    });
    describe('- when passed an object', () => {
      it('should copy the value for the top property', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.top).to.equal(testPadding.top);
      });
      it('should copy the value for the right property', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.right).to.equal(testPadding.right);
      });
      it('should copy the value for the bottom property', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.bottom).to.equal(testPadding.bottom);
      });
      it('should copy the value for the left property', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.left).to.equal(testPadding.left);
      });
      it('should not introduce new properties into the Bounds.padding object', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding).to.have.all.keys(paddingProps);
      });
    });
    describe('- when passed a single value', () => {
      let testPadding = 10;
      it('should set Bounds.padding.top to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.top).to.equal(testPadding);
      });
      it('should set Bounds.padding.right to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.right).to.equal(testPadding);
      });
      it('should set Bounds.padding.bottom to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.bottom).to.equal(testPadding);
      });
      it('should set Bounds.padding.left to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.left).to.equal(testPadding);
      });
    });
    describe('- when passed an array of length 1', () => {
      let testPadding = [10];
      it('should set Bounds.padding.top to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.top).to.equal(testPadding[0]);
      });
      it('should set Bounds.padding.right to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.right).to.equal(testPadding[0]);
      });
      it('should set Bounds.padding.bottom to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.bottom).to.equal(testPadding[0]);
      });
      it('should set Bounds.padding.left to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.left).to.equal(testPadding[0]);
      });
    });
    describe('- when passed an array of length 2', () => {
      let testPadding = [10, 24];
      it('should set Bounds.padding.top to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.top).to.equal(testPadding[0]);
      });
      it('should set Bounds.padding.right to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.right).to.equal(testPadding[1]);
      });
      it('should set Bounds.padding.bottom to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.bottom).to.equal(testPadding[0]);
      });
      it('should set Bounds.padding.left to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.left).to.equal(testPadding[1]);
      });
    });
    describe('- when passed an array of length 3', () => {
      let testPadding = [10, 24, 12];
      it('should set Bounds.padding.top to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.top).to.equal(testPadding[0]);
      });
      it('should set Bounds.padding.right to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.right).to.equal(testPadding[1]);
      });
      it('should set Bounds.padding.bottom to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.bottom).to.equal(testPadding[2]);
      });
      it('should set Bounds.padding.left to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.left).to.equal(testPadding[1]);
      });
    });
    describe('- when passed an array of length 4', () => {
      let testPadding = [10, 24, 12, 16];
      it('should set Bounds.padding.top to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.top).to.equal(testPadding[0]);
      });
      it('should set Bounds.padding.right to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.right).to.equal(testPadding[1]);
      });
      it('should set Bounds.padding.bottom to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.bottom).to.equal(testPadding[2]);
      });
      it('should set Bounds.padding.left to the given value', () => {
        Bounds.setPadding(testPadding);
        expect(Bounds.padding.left).to.equal(testPadding[3]);
      });
    });
  });

  describe('#registerSnappers', () => {
    let Snap;
    before(() => {
      Snap = Bounds.SL.Utils.get('Snap');
    });
    beforeEach(() => {
      Bounds.unregisterSnappers();
    });
    it('should initialize the point snapper', () => {
      Bounds.registerSnappers();
      expect(Bounds.Snappers.point).to.exist;
    });
    it('should register the point snapper', () => {
      Bounds.registerSnappers();
      expect(Snap.Snappers.point.map[Bounds.Snappers.point.id]).to.equal(Bounds.Snappers.point);
    });
    it('should initialize the pointMin snapper', () => {
      Bounds.registerSnappers();
      expect(Bounds.Snappers.pointMin).to.exist;
    });
    it('should register the pointMin snapper', () => {
      Bounds.registerSnappers();
      expect(Snap.Snappers.pointMin.map[Bounds.Snappers.pointMin.id]).to.equal(Bounds.Snappers.pointMin);
    });
    it('should initialize the pointMax snapper', () => {
      Bounds.registerSnappers();
      expect(Bounds.Snappers.pointMax).to.exist;
    });
    it('should register the pointMax snapper', () => {
      Bounds.registerSnappers();
      expect(Snap.Snappers.pointMax.map[Bounds.Snappers.pointMax.id]).to.equal(Bounds.Snappers.pointMax);
    });
    it('should initialize the rectangle snapper', () => {
      Bounds.registerSnappers();
      expect(Bounds.Snappers.rectangle).to.exist;
    });
    it('should register the rectangle snapper', () => {
      Bounds.registerSnappers();
      expect(Snap.Snappers.rectangle.map[Bounds.Snappers.rectangle.id]).to.equal(Bounds.Snappers.rectangle);
    });
  });
  describe('#unregisterSnappers', () => {
    let Snap;
    before(() => {
      Snap = Bounds.SL.Utils.get('Snap');
    });
    afterEach(() => {
      Bounds.registerSnappers();
    });
    it('should stop tracking the point snapper', () => {
      Bounds.unregisterSnappers();
      expect(Bounds.Snappers.point).to.not.exist;
    });
    it('should unregister the point snapper', () => {
      let snapper = Bounds.Snappers.point;
      Bounds.unregisterSnappers();
      expect(Snap.Snappers.point.map[snapper.id]).to.not.exist;
    });
    it('should stop tracking the pointMin snapper', () => {
      Bounds.unregisterSnappers();
      expect(Bounds.Snappers.pointMin).to.not.exist;
    });
    it('should unregister the pointMin snapper', () => {
      let snapper = Bounds.Snappers.point;
      Bounds.unregisterSnappers();
      expect(Snap.Snappers.point.map[snapper.id]).to.not.exist;
    });
    it('should stop tracking the pointMax snapper', () => {
      Bounds.unregisterSnappers();
      expect(Bounds.Snappers.pointMax).to.not.exist;
    });
    it('should unregister the pointMax snapper', () => {
      let snapper = Bounds.Snappers.point;
      Bounds.unregisterSnappers();
      expect(Snap.Snappers.point.map[snapper.id]).to.not.exist;
    });
    it('should stop tracking the rectangle snapper', () => {
      Bounds.unregisterSnappers();
      expect(Bounds.Snappers.rectangle).to.not.exist;
    });
    it('should unregister the rectangle snapper', () => {
      let snapper = Bounds.Snappers.rectangle;
      Bounds.unregisterSnappers();
      expect(Snap.Snappers.rectangle.map[snapper.id]).to.not.exist;
    });
  });

  describe('#snapPoint', () => {
    beforeEach(() => {
      Bounds.setPadding(testPadding);
    });
    describe('given a point with {x, y} values less than {Bounds.padding.left, Bounds.padding.top}', () => {
      it('should return a point with {x, y} values equal to {Bounds.padding.left, Bounds.padding.top}', () => {
        let testPoint = new paper.Point({
          x: (Bounds.padding.left - 1),
          y: (Bounds.padding.top - 1)
        });
        let checkPoint = Bounds.snapPoint(testPoint);
        expect(checkPoint).to.eql({x: Bounds.padding.left, y: Bounds.padding.top});
      });
    });
    describe('given a point with {x, y} values greater than {view.size.width-Bounds.padding.right, view.size.height-Bounds.padding.bottom}', () => {
      it('should return a point with {x, y} values equal to {view.size.width-Bounds.padding.right, view.size.height-Bounds.padding.bottom}', () => {
        let testPoint = new paper.Point({
          x: (Test.SL.Paper.view.size.width-Bounds.padding.right + 1),
          y: (Test.SL.Paper.view.size.height-Bounds.padding.bottom + 1)
        });
        let checkPoint = Bounds.snapPoint(testPoint);
        expect(checkPoint).to.eql({x: Test.SL.Paper.view.size.width-Bounds.padding.right, y: Test.SL.Paper.view.size.height-Bounds.padding.bottom});
      });
    });
  });
  describe('#snapPointMin', () => {
    beforeEach(() => {
      Bounds.setPadding(testPadding);
    });
    it('should return a point with {x, y} values equal to {Bounds.padding.left, Bounds.padding.top}', () => {
      let point = Bounds.snapPointMin(new paper.Point);
      expect(point).to.eql({x: Bounds.padding.left, y: Bounds.padding.top});
    });
  });
  describe('#snapPointMax', () => {
    beforeEach(() => {
      Bounds.setPadding(testPadding);
    });
    it('should return a point with {x, y} values equal to {view.size.width-padding.right, view.size.height-padding.bottom}', () => {
      let point = Bounds.snapPointMax(new paper.Point);
      expect(point).to.eql({x: (Test.SL.Paper.view.size.width-Bounds.padding.right), y: (Test.SL.Paper.view.size.height-Bounds.padding.bottom)});
    });
  });
  describe('#snapRectangle', () => {
    beforeEach(() => {
      Bounds.setPadding(testPadding);
    });
    describe('given a rectangle with {left, top} values less than {Bounds.padding.left, Bounds.padding.top}', () => {
      it('should return a rectangle with {left, top} values equal to {Bounds.padding.left, Bounds.padding.top}', () => {
        let testRect = new paper.Rectangle;
        testRect.set({
          x: (Bounds.padding.left - 1),
          y: (Bounds.padding.top - 1),
          width: 50,
          height: 50
        });
        let checkRect = Bounds.snapRectangle(testRect);
        expect(checkRect.left).to.equal(Bounds.padding.left);
        expect(checkRect.top).to.equal(Bounds.padding.top);
      });
    });
    describe('given a rectangle with {right, bottom} values greater than {view.size.width-Bounds.padding.right, view.size.height-Bounds.padding.bottom}', () => {
      it('should rectangle a rectangle with {right, bottom} values equal to {view.size.width-Bounds.padding.right, view.size.height-Bounds.padding.bottom}', () => {
        let testRect = new paper.Rectangle;
        testRect.set({
          x: (Test.SL.Paper.view.size.width-Bounds.padding.right - 49),
          y: (Test.SL.Paper.view.size.height-Bounds.padding.bottom - 49),
          width: 50,
          height: 50
        });
        let checkRect = Bounds.snapRectangle(testRect);
        expect(checkRect.right).to.equal(Test.SL.Paper.view.size.width-Bounds.padding.right);
        expect(checkRect.bottom).to.equal(Test.SL.Paper.view.size.height-Bounds.padding.bottom);
      });
    });
  });
});
