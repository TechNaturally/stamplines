describe('Tools.Core.Move', () => {
  let Move;
  before(() => {
    Test.assertSL();
    Move = new Test.Lib.Tools.Core.Move(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Move).to.exist;
    });
    it('should be constructed by Move', () => {
      expect(Move.constructor.name).to.equal('Move');
    });
  });
  describe('+activationPriority', () => {
    describe('- when Belt.State.Mouse.Hover.selection', () => {
      let wasHoverSelection;
      before(() => {
        wasHoverSelection = Move.Belt.State.Mouse.Hover.selection;
        Move.Belt.State.Mouse.Hover.selection = true;
      });
      after(() => {
        Move.Belt.State.Mouse.Hover.selection = wasHoverSelection;
      });
      it('should equal 10', () => {
        expect(Move.activationPriority).to.equal(10);
      });
    });
    describe('- otherwise', () => {
      it('should equal -1', () => {
        expect(Move.activationPriority).to.equal(-1);
      });
    });
  });
  describe('#refreshUI', () => {
    describe('- when active', () => {
      let wasActive;
      before(() => {
        wasActive = Move.active;
        Move.active = true;
      });
      after(() => {
        Move.active = wasActive;
      });
      it('should activate the "move" cursor', () => {
        let spy = sinon.spy(Move.SL.UI.Mouse.Cursor, 'activateCursor');
        spy.withArgs('move');
        Move.refreshUI();
        expect(spy.callCount).to.be.at.least(1);
      });
    });
  });



  describe('#onMouseDrag', () => {
    let Select;
    let testItem;
    let wasActive;
    before(() => {
      Select = Move.Belt.Belt.Select;
      wasActive = Move.active;
      Move.active = true;
      testItem = Select.SL.Paper.generatePaperItem({Class: 'Content'}, paper.Path);
      testItem.add(new paper.Point(40, 40));
      testItem.add(new paper.Point(100, 100));
      Select.Select(testItem);
    });
    after(() => {
      Select.SL.Paper.destroyPaperItem(testItem);
      Move.active = wasActive;
    });

    function runTests(tests) {
      let GroupPt = Select.Group.position.clone();
      let testPt = new paper.Point(0, 0);
      let checkPt = new paper.Point(0, 0);
      tests.forEach((test, index) => {
        // establish the expectations
        checkPt.set({
          x: test.expect.x,
          y: test.expect.y
        });
        // make sure Select.Group.position is reset
        Select.Group.position.set(GroupPt);
        Select.refreshUI();

        // run the function
        Move.onMouseDrag(test.event);

        // check the results
        let GroupBounds = Select.Group.bounds;
        testPt.set({
          x: GroupBounds.left,
          y: GroupBounds.top
        });

        // make sure Select.Group.position is reset
        Select.Group.position.set(GroupPt);
        Select.refreshUI();

        // check the expectations
        try {
          expect(testPt.x).to.equal(checkPt.x);
          expect(testPt.y).to.equal(checkPt.y);
        }
        catch (error) {
          throw `Failed on test [${index+1}/${tests.length}]: ${error}`;
        }
      });
      testPt = undefined;
      checkPt = undefined;
    }
    it('should move Belt.Select.Group by event.delta', () => {
      runTests([
        { event:{delta:{x: 13, y: 13}}, expect:{x: (40+13), y: (40+13)} },
        { event:{delta:{x: -12, y: -15}}, expect:{x: (40-12), y: (40-15)} },
        { event:{delta:{x: -10, y: 10}}, expect:{x: (40-10), y: (40+10)} }
      ]);
    });
    it('should Bound Belt.Select.Group at Bounds + Select.config.padding', () => {
      runTests([
        { event:{delta:{x: -40, y: -40}}, expect:{x: 6, y: 6} },
        { event:{delta:{x: -62, y: -62}}, expect:{x: 6, y: 6} }
      ]);
    });
  });
  describe('#onMouseUp', () => {
    let Select, Snap;
    let wasActive;
    let testItems, testLines;
    before(() => {
      Select = Move.Belt.Belt.Select;
      Snap = Move.SL.Utils.get('Snap');
      wasActive = Move.active;
      Move.active = true;
      testItems = [
        Move.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 20, 20, 40, 60),
        Move.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 100, 100, 20, 40),
        Move.SL.Paper.generatePaperItem({Type: 'Stamp'}, paper.Shape.Rectangle, 75, 75, 20, 40)
      ];

      testLines = [
        Move.SL.Paper.generatePaperItem({Type: 'Line'}, paper.Path.Line, {x: 20, y: 20}, {x: 40, y: 60}),
        Move.SL.Paper.generatePaperItem({Type: 'Line'}, paper.Path.Line, {x: 75, y: 75}, {x: 20, y: 40})
      ];
    });
    after(() => {
      for (let item of testItems) {
        Move.SL.Paper.destroyPaperItem(item);
      }
      for (let item of testLines) {
        Move.SL.Paper.destroyPaperItem(item);
      }
      Move.active = wasActive;
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
      Move.onMouseUp();
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
      Move.onMouseUp();
      for (let args of spyArgs) {
        expect(spy.withArgs(args).callCount).to.equal(1);
      }
      Snap.Point.restore();
    });
  });
});
