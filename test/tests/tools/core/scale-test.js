describe('Tools.Core.Scale', () => {
  let Scale;
  before(() => {
    Test.assertSL();
    Scale = new Test.Lib.Tools.Core.Scale(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Scale).to.exist;
    });
    it('should be constructed by Scale', () => {
      expect(Scale.constructor.name).to.equal('Scale');
    });
  });
  describe('#configure', () => {
    it('should force config.edgeWidth to be set', () => {
      Scale.config.edgeWidth = undefined;
      Scale.configure();
      expect(Scale.config.edgeWidth).to.exist;
    });
  });
  describe('#reset', () => {
    it('should call resetState', () => {
      let spy = sinon.spy(Scale, 'resetState');
      Scale.reset();
      expect(spy.callCount).to.equal(1);
      Scale.resetState.restore();
    });
  });
  describe('#resetState', () => {
    it('should empty out Belt.State.Mouse.Hover.selectionEdge', () => {
      if (!Scale.Belt.State.Mouse.Hover.selectionEdge) {
        Scale.Belt.State.Mouse.Hover.selectionEdge = {};
      }
      Scale.Belt.State.Mouse.Hover.selectionEdge.top = true;
      Scale.Belt.State.Mouse.Hover.selectionEdge.bottom = true;
      Scale.Belt.State.Mouse.Hover.selectionEdge.left = true;
      Scale.Belt.State.Mouse.Hover.selectionEdge.right = true;
      Scale.Belt.State.Mouse.Hover.selectionEdge.direction = true;
      Scale.resetState();
      expect(Scale.Belt.State.Mouse.Hover.selectionEdge).to.be.empty;
    });
  });
  describe('+activationPriority', () => {
    it('should return -1', () => {
      expect(Scale.activationPriority).to.equal(-1);
    });
  });
  describe('#isEdgeHovered', () => {
    beforeEach(() => {
      Scale.resetState();
    });
    after(() => {
      Scale.resetState();
    });
    it('should return true when Mouse.Hover.selectionEdge.top is true', () => {
      Scale.Belt.State.Mouse.Hover.selectionEdge.top = true;
      let checkHovered = Scale.isEdgeHovered();
      expect(checkHovered).to.be.true;
    });
    it('should return true when Mouse.Hover.selectionEdge.bottom is true', () => {
      Scale.Belt.State.Mouse.Hover.selectionEdge.bottom = true;
      let checkHovered = Scale.isEdgeHovered();
      expect(checkHovered).to.be.true;
    });
    it('should return true when Mouse.Hover.selectionEdge.left is true', () => {
      Scale.Belt.State.Mouse.Hover.selectionEdge.left = true;
      let checkHovered = Scale.isEdgeHovered();
      expect(checkHovered).to.be.true;
    });
    it('should return true when Mouse.Hover.selectionEdge.right is true', () => {
      Scale.Belt.State.Mouse.Hover.selectionEdge.right = true;
      let checkHovered = Scale.isEdgeHovered();
      expect(checkHovered).to.be.true;
    });
    it('should return false when Mouse.Hover.selectionEdge.[top, bottom, left, right] are all false', () => {
      Scale.resetState();
      let checkHovered = Scale.isEdgeHovered();
      expect(checkHovered).to.be.false;
    });
  });
  describe('#refreshUI', () => {
    describe('- when Mouse.Hover.selectionEdge.direction is N', () => {
      let wasActive, wasDirection;
      beforeEach(() => {
        wasActive = Scale.active;
        Scale.active = true;
        wasDirection = Scale.Belt.State.Mouse.Hover.selectionEdge.direction;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = 'N';
      });
      after(() => {
        Scale.active = wasActive;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = wasDirection;
      });
      it('should activate the "expand-ns" cursor', () => {
        let spy = sinon.spy(Scale.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('expand-ns');
        Scale.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Scale.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
    describe('- when Mouse.Hover.selectionEdge.direction is NE', () => {
      let wasActive, wasDirection;
      beforeEach(() => {
        wasActive = Scale.active;
        Scale.active = true;
        wasDirection = Scale.Belt.State.Mouse.Hover.selectionEdge.direction;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = 'NE';
      });
      after(() => {
        Scale.active = wasActive;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = wasDirection;
      });
      it('should activate the "expand-nesw" cursor', () => {
        let spy = sinon.spy(Scale.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('expand-nesw');
        Scale.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Scale.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
    describe('- when Mouse.Hover.selectionEdge.direction is E', () => {
      let wasActive, wasDirection;
      beforeEach(() => {
        wasActive = Scale.active;
        Scale.active = true;
        wasDirection = Scale.Belt.State.Mouse.Hover.selectionEdge.direction;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = 'E';
      });
      after(() => {
        Scale.active = wasActive;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = wasDirection;
      });
      it('should activate the "expand-ew" cursor', () => {
        let spy = sinon.spy(Scale.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('expand-ew');
        Scale.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Scale.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
    describe('- when Mouse.Hover.selectionEdge.direction is SE', () => {
      let wasActive, wasDirection;
      beforeEach(() => {
        wasActive = Scale.active;
        Scale.active = true;
        wasDirection = Scale.Belt.State.Mouse.Hover.selectionEdge.direction;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = 'SE';
      });
      after(() => {
        Scale.active = wasActive;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = wasDirection;
      });
      it('should activate the "expand-senw" cursor', () => {
        let spy = sinon.spy(Scale.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('expand-senw');
        Scale.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Scale.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
    describe('- when Mouse.Hover.selectionEdge.direction is S', () => {
      let wasActive, wasDirection;
      beforeEach(() => {
        wasActive = Scale.active;
        Scale.active = true;
        wasDirection = Scale.Belt.State.Mouse.Hover.selectionEdge.direction;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = 'S';
      });
      after(() => {
        Scale.active = wasActive;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = wasDirection;
      });
      it('should activate the "expand-ns" cursor', () => {
        let spy = sinon.spy(Scale.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('expand-ns');
        Scale.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Scale.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
    describe('- when Mouse.Hover.selectionEdge.direction is SW', () => {
      let wasActive, wasDirection;
      beforeEach(() => {
        wasActive = Scale.active;
        Scale.active = true;
        wasDirection = Scale.Belt.State.Mouse.Hover.selectionEdge.direction;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = 'SW';
      });
      after(() => {
        Scale.active = wasActive;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = wasDirection;
      });
      it('should activate the "expand-nesw" cursor', () => {
        let spy = sinon.spy(Scale.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('expand-nesw');
        Scale.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Scale.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
    describe('- when Mouse.Hover.selectionEdge.direction is W', () => {
      let wasActive, wasDirection;
      beforeEach(() => {
        wasActive = Scale.active;
        Scale.active = true;
        wasDirection = Scale.Belt.State.Mouse.Hover.selectionEdge.direction;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = 'W';
      });
      after(() => {
        Scale.active = wasActive;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = wasDirection;
      });
      it('should activate the "expand-ew" cursor', () => {
        let spy = sinon.spy(Scale.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('expand-ew');
        Scale.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Scale.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
    describe('- when Mouse.Hover.selectionEdge.direction is NW', () => {
      let wasActive, wasDirection;
      beforeEach(() => {
        wasActive = Scale.active;
        Scale.active = true;
        wasDirection = Scale.Belt.State.Mouse.Hover.selectionEdge.direction;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = 'NW';
      });
      after(() => {
        Scale.active = wasActive;
        Scale.Belt.State.Mouse.Hover.selectionEdge.direction = wasDirection;
      });
      it('should activate the "expand-senw" cursor', () => {
        let spy = sinon.spy(Scale.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('expand-senw');
        Scale.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Scale.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
    });
  });
  describe('#onMouseMove', () => {
    let Select;
    let testItem, testPoint;
    before(() => {
      Select = Scale.Belt.Belt.Select;
      testItem = Scale.SL.Paper.generatePaperItem({
        Class: 'Content',
        Layer: Scale.SL.Paper.Layers.CONTENT
      }, paper.Shape.Circle, new paper.Point(250, 125), 50);
      Select.Select(testItem);
      testPoint = new paper.Point();
    });
    after(() => {
      testPoint = undefined;
    });
    beforeEach(() => {
      Scale.SL.UI.Mouse.State.point.set(testPoint);
    });
    afterEach(() => {
      Scale.resetState();
    });
    it('should force Belt.State.Mouse.Hover.selectionEdge to exist', () => {
      Scale.onMouseMove();
      expect(Scale.Belt.State.Mouse.Hover.selectionEdge).to.exist;
    });
    describe('- when top edge of selection is hovered', () => {
      before(() => {
        testPoint.set(Select.UI.outline.handleBounds.topCenter);
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.top to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.top).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.direction to N', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.direction).to.equal('N');
      });
    });
    describe('- when top-right corner of selection is hovered', () => {
      before(() => {
        testPoint.set(Select.UI.outline.handleBounds.topRight);
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.top to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.top).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.right to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.right).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.direction to NE', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.direction).to.equal('NE');
      });
    });
    describe('- when right edge of selection is hovered', () => {
      before(() => {
        testPoint.set(Select.UI.outline.handleBounds.rightCenter);
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.right to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.right).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.direction to E', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.direction).to.equal('E');
      });
    });
    describe('- when bottom-right edge of selection is hovered', () => {
      before(() => {
        testPoint.set(Select.UI.outline.handleBounds.bottomRight);
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.bottom to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.bottom).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.right to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.right).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.direction to SE', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.direction).to.equal('SE');
      });
    });
    describe('- when bottom edge of selection is hovered', () => {
      before(() => {
        testPoint.set(Select.UI.outline.handleBounds.bottomCenter);
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.bottom to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.bottom).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.direction to S', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.direction).to.equal('S');
      });
    });
    describe('- when bottom-left edge of selection is hovered', () => {
      before(() => {
        testPoint.set(Select.UI.outline.handleBounds.bottomLeft);
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.bottom to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.bottom).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.left to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.left).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.direction to SW', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.direction).to.equal('SW');
      });
    });
    describe('- when left edge of selection is hovered', () => {
      before(() => {
        testPoint.set(Select.UI.outline.handleBounds.leftCenter);
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.left to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.left).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.direction to W', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.direction).to.equal('W');
      });
    });
    describe('- when top-left corner of selection is hovered', () => {
      before(() => {
        testPoint.set(Select.UI.outline.handleBounds.topLeft);
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.top to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.top).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.left to true', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.left).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.selectionEdge.direction to NW', () => {
        Scale.onMouseMove();
        expect(Scale.Belt.State.Mouse.Hover.selectionEdge.direction).to.equal('NW');
      });
    });
  });
});
