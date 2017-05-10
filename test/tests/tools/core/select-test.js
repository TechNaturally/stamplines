describe('Tools.Core.Select', () => {
  let Select;
  before(() => {
    Test.assertSL();
    Select = new Test.Lib.Tools.Core.Select(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Select).to.exist;
    });
    it('should be constructed by Select', () => {
      expect(Select.constructor.name).to.equal('Select');
    });
    it('should initialize a Group property initialized by paper.Group', () => {
      expect(Select.Group.constructor).to.equal(paper.Group);
    });
    it('should initialize a State property containing keys: [multi]', () => {
      expect(Select.State).to.contain.all.keys('multi');
    });
    it('should initialize a UI property that is empty', () => {
      expect(Select.UI).to.exist.and.to.be.empty;
    });
    it('should set the initialized property to true', () => {
      expect(Select.initialized).to.be.true;
    });
  });
  describe('#destroy', () => {
    afterEach(() => {
      Select = new Test.Lib.Tools.Core.Select(Test.SL, {}, Test.SL.Tools);
    });
    it('should destroy the Group property', () => {
      Select.destroy();
      expect(Select.Group).to.not.exist;
    });
  });
  describe('+activationPriority', () => {
    describe('- when State.multi and Belt.State.Mouse.Hover.targetItem', () => {
      let wasMulti, wasHoverTargetItem;
      before(() => {
        wasMulti = Select.State.multi;
        Select.State.multi = true;

        wasHoverTargetItem = Select.Belt.State.Mouse.Hover.targetItem;
        Select.Belt.State.Mouse.Hover.targetItem = {};
      });
      after(() => {
        Select.State.multi = wasMulti;
        Select.Belt.State.Mouse.Hover.targetItem = wasHoverTargetItem;
      });
      it('should equal 25', () => {
        expect(Select.activationPriority).to.equal(25);
      });
    });
    describe('- otherwise', () => {
      it('should equal 0', () => {
        expect(Select.activationPriority).to.equal(0);
      });
    });
  });
  describe('#configure', () => {
    it('should force config.padding to be set', () => {
      Select.config.padding = undefined;
      Select.configure();
      expect(Select.config.padding).to.exist;
    });
    it('should force config.selectableClasses array to exist', () => {
      Select.config.selectableClasses = undefined;
      Select.configure();
      expect(Select.config.selectableClasses).to.exist;
    });
    it('should force config.selectableClasses array to contain "Content" entry', () => {
      Select.config.selectableClasses = undefined;
      Select.configure();
      expect(Select.config.selectableClasses).to.contain('Content');
    });
    it('should force config.singleSelectedTypes array to exist', () => {
      Select.config.singleSelectedTypes = undefined;
      Select.configure();
      expect(Select.config.singleSelectedTypes).to.exist;
    });
    it('should force config.singleSelectedTypes array to contain "Line" entry', () => {
      Select.config.singleSelectedTypes = undefined;
      Select.configure();
      expect(Select.config.singleSelectedTypes).to.contain('Line');
    });
  });
  describe('#reset', () => {
    it('should call Unselect', () => {
      let spy = sinon.spy(Select, 'Unselect');
      Select.reset();
      expect(spy.callCount).to.be.at.least(1);
      Select.Unselect.restore();
    });
    it('should call resetState', () => {
      let spy = sinon.spy(Select, 'resetState');
      Select.reset();
      expect(spy.callCount).to.be.at.least(1);
      Select.resetState.restore();
    });
    it('should call resetUI', () => {
      let spy = sinon.spy(Select, 'resetUI');
      Select.reset();
      expect(spy.callCount).to.be.at.least(1);
      Select.resetUI.restore();
    });
  });
  describe('#resetState', () => {
    it('should set State.multi to false', () => {
      Select.State.multi = true;
      Select.resetState();
      expect(Select.State.multi).to.be.false;
    });
  });
  describe('#isSelectable', () => {
    it('should return true for items with data.Class (as string) in its selectableTypes array', () => {
      let testItem = { data: {
        Class: 'Content'
      }};
      let isSelectable = Select.isSelectable(testItem);
      expect(isSelectable).to.be.true;
    });
    it('should return true for items with data.Class (as array) in its selectableTypes array', () => {
      let testItem = { data: {
        Class: ['Content', 'UI']
      }};
      let isSelectable = Select.isSelectable(testItem);
      expect(isSelectable).to.be.true;
    });
    it('should return false for items with no data.Class in its selectableTypes array', () => {
      let testItem = { data: {
        Class: 'UI'
      }};
      let isSelectable = Select.isSelectable(testItem);
      expect(isSelectable).to.be.false;
    });
  });
  describe('#isSelected', () => {
    let testItem;
    before(() => {
      testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
    });
    after(() => {
      Select.SL.Paper.destroyPaperItem(testItem);
    });
    it('should return true when given a selected item', () => {
      Select.Select(testItem);
      expect(Select.isSelected(testItem)).to.be.true;
      Select.Unselect(testItem);
    });;
    it('should return false when given an unselected item', () => {
      Select.Unselect(testItem);
      expect(Select.isSelected(testItem)).to.be.false;
    });
  });
  describe('#Select', () => {
    describe('- when given a selectable item', () => {
      let testItem, testItem1;
      before(() => {
        testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
        testItem1 = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
      });
      after(() => {
        Select.SL.Paper.destroyPaperItem(testItem);
        Select.SL.Paper.destroyPaperItem(testItem1);
      });
      afterEach(() => {
        Select.Unselect(testItem);
      });
      it('should select the item', () => {
        Select.Select(testItem1); // need two items because a single item does not have its selected flag set
        Select.Select(testItem);
        expect(testItem.selected).to.be.true;
        Select.Unselect(testItem1);
      });
      it('should add the item to its Items list', () => {
        Select.Select(testItem);
        expect(Select.Items).to.include(testItem);
      });
      it('should set the item\'s data.parentOrig property to its pre-selection parent', () => {
        let parentOrig = testItem.parent;
        testItem.data.parentOrig = undefined;
        Select.Select(testItem);
        expect(testItem.data.parentOrig).to.equal(parentOrig);
      });
      it('should add the item to the Group', () => {
        Select.Select(testItem);
        expect(Select.Group.children).to.include(testItem);
      });
      it('should call refreshUI', () => {
        let spy = sinon.spy(Select, 'refreshUI');
        Select.Select(testItem);
        expect(spy.callCount).to.be.at.least(1);
        Select.refreshUI.restore();
      });
    });
  });
  describe('#Unselect', () => {
    describe('- when given no item', () => {
      let testItem, testItem1, testItem2;
      before(() => {
        testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
        testItem1 = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
        testItem2 = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
      });
      after(() => {
        Select.SL.Paper.destroyPaperItem(testItem);
        Select.SL.Paper.destroyPaperItem(testItem1);
        Select.SL.Paper.destroyPaperItem(testItem2);
      });
      beforeEach(() => {
        Select.Select(testItem);
        Select.Select(testItem1);
        Select.Select(testItem2);
      });
      it('should unselect all items', () => {
        Select.Unselect();
        expect(testItem.selected).to.be.false;
        expect(testItem1.selected).to.be.false;
        expect(testItem2.selected).to.be.false;
      });
      it('should empty its Items list', () => {
        Select.Unselect();
        expect(Select.Items).to.be.empty;
      });
      it('should empty the Group.children', () => {
        Select.Unselect();
        expect(Select.Group.children).to.be.empty;
      });
    });
    describe('- when given a selected item', () => {
      let testItem;
      before(() => {
        testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
      });
      after(() => {
        Select.SL.Paper.destroyPaperItem(testItem);
      });
      beforeEach(() => {
        Select.Select(testItem);
      });
      it('should unselect the item', () => {
        Select.Unselect(testItem);
        expect(testItem.selected).to.be.false;
      });
      it('should remove the item from its Items list', () => {
        Select.Unselect(testItem);
        expect(Select.Items).to.not.include(testItem);
      });
      it('should add the item to its data.parentOrig', () => {
        let parentOrig = testItem.data.parentOrig;
        Select.Unselect(testItem);
        expect(testItem.parent).to.equal(parentOrig);
      });
      it('should reset the item\'s data.parentOrig', () => {
        Select.Unselect(testItem);
        expect(testItem.data.parentOrig).to.not.exist;
      });
      it('should remove the item from the Group', () => {
        Select.Unselect(testItem);
        expect(Select.Group.children).to.not.include(testItem);
      });
    });
  });
  describe('#SnapSelected', () => {
    let Snap;
    let testItems, testLines;
    before(() => {
      Snap = Select.SL.Utils.get('Snap');
      testItems = [
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 20, 20, 40, 60),
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 100, 100, 20, 40),
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 75, 75, 20, 40)
      ];

      testLines = [
        Select.SL.Paper.generatePaperItem({Type: 'Line'}, paper.Path.Line, {x: 20, y: 20}, {x: 40, y: 60}),
        Select.SL.Paper.generatePaperItem({Type: 'Line'}, paper.Path.Line, {x: 75, y: 75}, {x: 20, y: 40})
      ];
    });
    after(() => {
      for (let item of testItems) {
        Select.SL.Paper.destroyPaperItem(item);
      }
      for (let item of testLines) {
        Select.SL.Paper.destroyPaperItem(item);
      }
    });
    afterEach(() => {
      Select.Unselect();
    });
    it('should snap each Stamp into place', () => {
      let spy = sinon.spy(Snap, 'Rectangle');
      let spyArgs = [];
      for (let item of testItems) {
        Select.Select(item);
        spy.withArgs(item.bounds);
        spyArgs.push(item.bounds);
      }
      Select.SnapSelected();
      for (let args of spyArgs) {
        expect(spy.withArgs(args).callCount).to.equal(1);
      }
      Snap.Rectangle.restore();
    });
    it('should snap each point of each Line into place', () => {
      let spy = sinon.spy(Snap, 'Point');
      let spyArgs = [];
      for (let item of testLines) {
        Select.Select(item);
        for (let segment of item.segments) {
          spy.withArgs(segment.point);
          spyArgs.push(segment.point);
        }
      }
      Select.SnapSelected();
      for (let args of spyArgs) {
        expect(spy.withArgs(args).callCount).to.equal(1);
      }
      Snap.Point.restore();
    });
  });
  describe('#count', () => {
    let testItems;
    before(() => {
      testItems = [
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 20, 20, 40, 60),
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 100, 100, 20, 40),
        Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 75, 75, 20, 40),
        Select.SL.Paper.generatePaperItem({Type: 'Line'}, paper.Path.Line, {x: 20, y: 20}, {x: 40, y: 60}),
        Select.SL.Paper.generatePaperItem({Type: 'Line'}, paper.Path.Line, {x: 75, y: 75}, {x: 20, y: 40})
      ];
    });
    after(() => {
      for (let item of testItems) {
        Select.SL.Paper.destroyPaperItem(item);
      }
    });
    beforeEach(() => {
      for (let item of testItems) {
        Select.Select(item);
      }
    });
    afterEach(() => {
      Select.Unselect();
    });
    it('should return the number of selected items', () => {
      let count = Select.count();
      expect(count).to.equal(testItems.length);
    });
  });
  describe('#hasItems', () => {
    let testItem;
    before(() => {
      testItem =  Select.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 20, 20, 40, 60);
    });
    after(() => {
      Select.SL.Paper.destroyPaperItem(testItem);
    });
    afterEach(() => {
      Select.Unselect();
    });
    it('should return true when there are selected items', () => {
      Select.Select(testItem);
      let hasItems = Select.hasItems();
      expect(hasItems).to.be.true;
    });
    it('should return false when there are no selected items', () => {
      let hasItems = Select.hasItems();
      expect(hasItems).to.be.false;
    });
  });
  describe('#refreshUI', () => {
    let wasActive;
    beforeEach(() => {
      wasActive = Select.active;
      Select.active = true;
    });
    afterEach(() => {
      Select.active = wasActive;
    });
    describe('- when active', () => {
      it('should call SL.UI.Mouse.Cursor.activateCursor', () => {
        let spy = sinon.spy(Select.SL.UI.Mouse.Cursor, 'activateCursor');
        Select.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Select.SL.UI.Mouse.Cursor.activateCursor.restore();
      });
      it('should call refreshUIOutline', () => {
        let spy = sinon.spy(Select, 'refreshUIOutline');
        Select.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Select.refreshUIOutline.restore();
      });
      it('should call refreshSelected', () => {
        let spy = sinon.spy(Select, 'refreshSelected');
        Select.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
        Select.refreshSelected.restore();
      });
    });
  });
  describe('#resetUI', () => {
    it('should call resetUIOutline', () => {
      let spy = sinon.spy(Select, 'resetUIOutline');
      Select.resetUI();
      expect(spy.callCount).to.be.at.least(1);
      Select.resetUIOutline.restore();
    });
  });
  describe('#refreshUIOutline', () => {
    describe('- when called with items selected', () => {
      let testItem, testItem1, testItem2;
      before(() => {
        testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
        testItem1 = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
        testItem2 = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);

        testItem.add(new paper.Point(50, 50));
        testItem2.add(new paper.Point(100, 100));

        Select.Select(testItem);
        Select.Select(testItem1);
        Select.Select(testItem2);
      });
      after(() => {
        Select.Unselect();
        Select.SL.Paper.destroyPaperItem(testItem);
        Select.SL.Paper.destroyPaperItem(testItem1);
        Select.SL.Paper.destroyPaperItem(testItem2);
      });
      it('should initialize the UI.outline', () => {
        Select.UI.outline = undefined;
        Select.refreshUIOutline();
        expect(Select.UI.outline).to.exist;
      });
      it('should set the bounds of UI.outline to the bounds of Group + config.padding', () => {
        let groupBounds = Select.Group.bounds;
        Select.refreshUIOutline();
        expect(Select.UI.outline.bounds.left).eql(Select.Group.bounds.left - Select.config.padding);
        expect(Select.UI.outline.bounds.top).eql(Select.Group.bounds.top - Select.config.padding);
        expect(Select.UI.outline.bounds.right).eql(Select.Group.bounds.right + Select.config.padding);
        expect(Select.UI.outline.bounds.bottom).eql(Select.Group.bounds.bottom + Select.config.padding);
      });
    });
    describe('- when called with no items selected', () => {
      before(() => {
        Select.Unselect();
      });
      it('should call resetUIOutline', () => {
        let spy = sinon.spy(Select, 'resetUIOutline');
        Select.refreshUIOutline();
        expect(spy.callCount).to.be.at.least(1);
        Select.resetUIOutline.restore();
      });
    });
  });
  describe('#resetUIOutline', () => {
    let testItem;
    before(() => {
      testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
      Select.Select(testItem);
    });
    after(() => {
      Select.Unselect();
      Select.SL.Paper.destroyPaperItem(testItem);
    });
    it('should destroy the UI.outline', () => {
      Select.resetUIOutline();
      expect(Select.UI.outline).to.not.exist;
    });
  });
  describe('#refreshSelected', () => {
    let testItem, testItem1, testItem2;
    before(() => {
      testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
      testItem1 = Select.SL.Paper.generatePaperItem({Class: 'Content', Type: 'Line'}, paper.Path);
      testItem2 = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
    });
    after(() => {
      Select.Unselect();
      Select.SL.Paper.destroyPaperItem(testItem);
      Select.SL.Paper.destroyPaperItem(testItem1);
      Select.SL.Paper.destroyPaperItem(testItem2);
    });
    describe('- when multiple items are selected', () => {
      before(() => {
        Select.Select(testItem);
        Select.Select(testItem1);
        Select.Select(testItem2);
        testItem.selected = false;
        testItem1.selected = false;
        testItem2.selected = false;
      });
      after(() => {
        Select.Unselect();
      });
      it('should set selected true on each one', () => {
        Select.refreshSelected();
        for (let item of Select.Items) {
          expect(item.selected).to.be.true;
        }
      });
    });
    describe('- when a single item is selected', () => {
      afterEach(() => {
        Select.Unselect();
      });
      it('should set selected false on each one', () => {
        Select.Unselect();
        Select.Select(testItem);
        testItem.selected = true;
        Select.refreshSelected();
        expect(testItem.selected).to.be.false;
      });
      it('should set selected false on each one unless it has data.Type of Line', () => {
        Select.Unselect();
        Select.Select(testItem1);
        testItem1.selected = true;
        Select.refreshSelected();
        expect(testItem1.selected).to.be.true;
      });
    });
  });
  describe('#onKeyDown', () => {
    describe('- when called with key="shift"', () => {
      let testEvent;
      before(() => {
        testEvent = { key: 'shift' };
      });
      it('should set State.multi=true', () => {
        Select.State.multi = false;
        Select.onKeyDown(testEvent);
        expect(Select.State.multi).to.be.true;
      });
      it('should call refreshUI', () => {
        let spy = sinon.spy(Select, 'refreshUI');
        Select.onKeyDown(testEvent);
        expect(spy.callCount).to.be.at.least(1);
        Select.refreshUI.restore();
      });
      it('should call Belt.checkActiveTool', () => {
        let spy = sinon.spy(Select.Belt, 'checkActiveTool');
        Select.onKeyDown(testEvent);
        expect(spy.callCount).to.be.at.least(1);
        Select.Belt.checkActiveTool.restore();
      });
    });
  });
  describe('#onKeyUp', () => {
    describe('- when called with key="shift"', () => {
      let testEvent;
      before(() => {
        testEvent = { key: 'shift' };
      });
      it('should set multi=false', () => {
        Select.State.multi = true;
        Select.onKeyUp(testEvent);
        expect(Select.State.multi).to.be.false;
      });
      it('should call refreshUI', () => {
        let spy = sinon.spy(Select, 'refreshUI');
        Select.onKeyUp(testEvent);
        expect(spy.callCount).to.be.at.least(1);
        Select.refreshUI.restore();
      });
      it('should call Belt.checkActiveTool', () => {
        let spy = sinon.spy(Select.Belt, 'checkActiveTool');
        Select.onKeyUp(testEvent);
        expect(spy.callCount).to.be.at.least(1);
        Select.Belt.checkActiveTool.restore();
      });
    });
  });
  describe('#onMouseDown', () => {
    let wasActive;
    let testItem, testItem1, testItem2;
    let testEvent = {
      event: {
        button: 0
      }
    };
    before(() => {
      wasActive = Select.active;
      testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
      testItem1 = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
      testItem2 = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
    });
    after(() => {
      Select.SL.Paper.destroyPaperItem(testItem);
      Select.SL.Paper.destroyPaperItem(testItem1);
      Select.SL.Paper.destroyPaperItem(testItem2);
      Select.active = wasActive;
    });
    beforeEach(() => {
      Select.active = true;
    });
    afterEach(() => {
      Select.Unselect();
    });
    describe('- when Belt.State.Mouse.Hover.targetItem is selected, multi-select is enabled, and there are more than 1 items selected', () => {
      beforeEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = testItem;
        Select.Select(testItem);
        Select.State.multi = true;
        Select.Select(testItem1);
      });
      afterEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = undefined;
      });
      it('should unselect the targetItem', () => {
        Select.onMouseDown(testEvent);
        expect(testItem.selected).to.be.false;
      });
      it('should remove the targetItem from its Items list', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Items).to.not.include(testItem);
      });
      it('should remove the targetItem from the Group', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Group.children).to.not.include(testItem);
      });
    });
    describe('- when Belt.State.Mouse.Hover.targetItem is selectable but not selected, and multi-select is disable', () => {
      beforeEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = testItem;
        Select.Unselect(testItem);
        Select.State.multi = false;
        Select.Select(testItem1);
      });
      afterEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = undefined;
      });
      it('should select the targetItem', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Items).to.include(testItem);
      });
      it('should have only 1 entry in Items list', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Items.length).to.equal(1);
      });
      it('should have only 1 child of Group', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Group.children.length).to.equal(1);
      });
    });
    describe('- when Belt.State.Mouse.Hover.targetItem is selectable but not selected, and multi-select is enabled', () => {
      beforeEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = testItem;
        Select.Unselect(testItem);
        Select.State.multi = true;
        Select.Select(testItem1);
      });
      afterEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = undefined;
      });
      it('should add the targetItem to the selection', () => {
        let itemCount = Select.Items.length;
        Select.onMouseDown(testEvent);
        expect(Select.Items.length).to.equal(itemCount+1);
      });
      it('should have more than 1 entry in Items list', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Items.length).to.be.above(1);
      });
      it('should have more than 1 child of Group', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Group.children.length).to.be.above(1);
      });
    });
    describe('- when there is no Belt.State.Mouse.Hover.targetItem or it is not selectable', () => {
      beforeEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = undefined;
        Select.Select(testItem);
        Select.Select(testItem1);
        Select.Select(testItem2);
      });
      it('should unselect all items', () => {
        Select.onMouseDown(testEvent);
        expect(testItem.selected).to.be.false;
        expect(testItem1.selected).to.be.false;
        expect(testItem2.selected).to.be.false;
      });
      it('should empty its Items list', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Items).to.be.empty;
      });
      it('should empty the Group.children', () => {
        Select.onMouseDown(testEvent);
        expect(Select.Group.children).to.be.empty;
      });
    });
  });
  describe('#onMouseMove', () => {
    let wasActive;
    let testEvent;
    let testItem;
    before(() => {
      wasActive = Select.active;
      testEvent = {};
      testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Shape.Rectangle, {x: 50, y: 50}, {x: 100, y: 100});
    });
    after(() => {
      Select.SL.Paper.destroyPaperItem(testItem);
      Select.active = wasActive;
    });
    beforeEach(() => {
      Select.active = true;
    });
    describe('- when Belt.State.Mouse.Hover.targetItem is selected', () => {
      beforeEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = testItem;
        Select.Select(testItem);
      });
      afterEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = undefined;
        Select.Unselect();
      });
      it('should set Belt.State.Mouse.Hover.targetSelected to true', () => {
        Select.Belt.State.Mouse.Hover.targetSelected = false;
        Select.onMouseMove(testEvent);
        expect(Select.Belt.State.Mouse.Hover.targetSelected).to.be.true;
      });
      it('should set Belt.State.Mouse.Hover.targetUnselected to false', () => {
        Select.Belt.State.Mouse.Hover.targetUnselected = true;
        Select.onMouseMove(testEvent);
        expect(Select.Belt.State.Mouse.Hover.targetUnselected).to.be.false;
      });
    });
    describe('- when Belt.State.Mouse.Hover.targetItem is not selected', () => {
      beforeEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = testItem;
        Select.Unselect(testItem);
      });
      afterEach(() => {
        Select.Belt.State.Mouse.Hover.targetItem = undefined;
        Select.Unselect();
      });
      it('should set Belt.State.Mouse.Hover.targetSelected to false', () => {
        Select.Belt.State.Mouse.Hover.targetSelected = true;
        Select.onMouseMove(testEvent);
        expect(Select.Belt.State.Mouse.Hover.targetSelected).to.be.false;
      });
      it('should set Belt.State.Mouse.Hover.targetUnselected to true', () => {
        Select.Belt.State.Mouse.Hover.targetUnselected = false;
        Select.onMouseMove(testEvent);
        expect(Select.Belt.State.Mouse.Hover.targetUnselected).to.be.true;
      });
    });
    describe('- when UI.outline contains SL.UI.Mouse.State.point', () => {
      beforeEach(() => {
        Select.Select(testItem);
        Select.SL.UI.Mouse.State.active = true;
        Select.SL.UI.Mouse.State.point = new paper.Point(75, 75);
      });
      afterEach(() => {
        Select.Unselect(testItem);
        Select.SL.UI.Mouse.State.point = undefined;
        Select.SL.UI.Mouse.State.active = false;
      });
      it('should set Belt.State.Mouse.Hover.selection to true', () => {
        Select.Belt.State.Mouse.Hover.selection = false;
        Select.onMouseMove(testEvent);
        expect(Select.Belt.State.Mouse.Hover.selection).to.be.true;
      });
    });
    describe('- when Belt.State.Mouse.Hover.selection changes value', () => {
      beforeEach(() => {
        Select.Select(testItem);
        Select.SL.UI.Mouse.State.active = true;
      });
      afterEach(() => {
        Select.Unselect(testItem);
        Select.SL.UI.Mouse.State.point = undefined;
        Select.SL.UI.Mouse.State.active = false;
      });
      it('should call Belt.onSelectionHover when it changes to true', () => {
        Select.Belt.State.Mouse.Hover.selection = false;
        Select.SL.UI.Mouse.State.point = new paper.Point(75, 75);
        let spy = sinon.spy(Select.Belt, 'onSelectionHover');
        Select.onMouseMove(testEvent);
        expect(spy.callCount).to.be.at.least(1);
        Select.Belt.onSelectionHover.restore();
      });
      it('should call Belt.onSelectionUnhover when it changes to false', () => {
        Select.Belt.State.Mouse.Hover.selection = true;
        Select.SL.UI.Mouse.State.point = new paper.Point(150, 150);
        let spy = sinon.spy(Select.Belt, 'onSelectionUnhover');
        Select.onMouseMove(testEvent);
        expect(spy.callCount).to.be.at.least(1);
        Select.Belt.onSelectionUnhover.restore();
      });
    });
    it('should call refreshUI', () => {
      let spy = sinon.spy(Select, 'refreshUI');
      Select.onMouseMove(testEvent);
      expect(spy.callCount).to.be.at.least(1);
      Select.refreshUI.restore();
    });
    it('should call Belt.checkActiveTool', () => {
      let spy = sinon.spy(Select.Belt, 'checkActiveTool');
      Select.onMouseMove(testEvent);
      expect(spy.callCount).to.be.at.least(1);
      Select.Belt.checkActiveTool.restore();
    });
  });
});
