describe('UI.Mouse', () => {
  let PaperCanvas, Mouse;
  before(() => {
    Test.assertSL();
    PaperCanvas = Test.SL.UI.PaperCanvas;
    Mouse = new Test.Lib.UI.Mouse(Test.SL, $.extend({
      paperCanvas: PaperCanvas
    }, Test.Lib.Core.StampLines.DEFAULT.config.UI.Mouse));
  });
  after(() => {
    Mouse.destroy();
    Mouse = undefined;
    PaperCanvas = undefined;
  });

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Mouse).to.exist;
    });
    it('should be constructed by Mouse', () => {
      expect(Mouse.constructor.name).to.equal('Mouse');
    });
  });

  describe('PaperCanvas.view', () => {
    let PaperView;
    before(() => {
      PaperView = PaperCanvas.view;
    });
    it('should exist', () => {
      expect(PaperView).to.exist;
    });
    it('should be bound to Mouse.Handles.onMouseEnter', () => {
      expect(PaperView.onMouseEnter).to.equal(Mouse.Handles.onMouseEnter);
    });
    it('should be bound to Mouse.Handles.onMouseLeave', () => {
      expect(PaperView.onMouseLeave).to.equal(Mouse.Handles.onMouseLeave);
    });
    it('should be bound to Mouse.Handles.onMouseMove', () => {
      expect(PaperView.onMouseMove).to.equal(Mouse.Handles.onMouseMove);
    });
    it('should be bound to Mouse.Handles.onMouseDown', () => {
      expect(PaperView.onMouseDown).to.equal(Mouse.Handles.onMouseDown);
    });
    it('should be bound to Mouse.Handles.onMouseUp', () => {
      expect(PaperView.onMouseUp).to.equal(Mouse.Handles.onMouseUp);
    });
    it('should be bound to Mouse.Handles.onMouseDrag', () => {
      expect(PaperView.onMouseDrag).to.equal(Mouse.Handles.onMouseDrag);
    });
    it('should be bound to Mouse.Handles.onDoubleClick', () => {
      expect(PaperView.onDoubleClick).to.equal(Mouse.Handles.onDoubleClick);
    });
  });

  describe('UI.Mouse.Handles', () => {
    var event;
    beforeEach(() => {
      event = {
        delta: null,
        event: {
          button: 0
        },
        point: new paper.Point(0, 0),
        target: PaperCanvas.view
      };
    });
    describe('#onMouseEnter', () => {
      it('should set State.active to true', () => {
        Mouse.Handles.onMouseEnter(event);
        expect(Mouse.State.active).to.be.true;
      });
    });
    describe('#onMouseLeave', () => {
      it('should set State.active to false', () => {
        Mouse.Handles.onMouseLeave(event);
        expect(Mouse.State.active).to.be.false;
      });
    });
    describe('#onMouseMove', () => {
      var point;
      beforeEach(() => {
        event.point.set({ x: 50, y: 50 });
      });
      it('should set State.point', () => {
        Mouse.Handles.onMouseMove(event);
        expect(Mouse.State.point).to.eql(event.point);
      });
      it('should set State.lastMove', () => {
        Mouse.Handles.onMouseMove(event);
        expect(Mouse.State.lastMove).to.equal(event);
      });
    });
    describe('#onMouseDown', () => {
      beforeEach(() => {
        event.point.set({ x: 50, y: 50 });
        event.event.button = 0;
      });
      it('should set State.button.active', () => {
        Mouse.Handles.onMouseDown(event);
        expect(Mouse.State.button.active).to.equal(event.event.button);
      });
      it('should set State.button.downAt', () => {
        Mouse.Handles.onMouseDown(event);
        expect(Mouse.State.button.downAt).to.eql(event.point);
      });
    });
    describe('#onMouseUp', () => {
      beforeEach(() => {
        let preEvent = $.extend({}, event);
        Mouse.Handles.onMouseDown(preEvent);

        event.point.set({ x: 50, y: 50 });
        event.event.button = 0;
        Mouse.State.button.last = null;
      });
      describe('- after a 0ms timeout', () => {
        it('should reset State.button.active', (done) => {
          Mouse.Handles.onMouseUp(event);
          setTimeout(() => {
            expect(Mouse.State.button.active).to.be.null;
            done();
          });
        });
        it('should set State.button.last', (done) => {
          let lastCheck = Mouse.State.button.active;
          Mouse.Handles.onMouseUp(event);
          setTimeout(() => {
            expect(Mouse.State.button.last).to.equal(lastCheck);
            done();
          });
        });
        it('should reset State.button.downAt', (done) => {
          Mouse.Handles.onMouseUp(event);
          setTimeout(() => {
            expect(Mouse.State.button.downAt).to.not.exist;
            done();
          });
        });
        it('should reset State.button.drag', (done) => {
          event.point.set({ x: 200, y: 200});
          let newEvent = $.extend({}, event);
          newEvent.point = newEvent.point.clone();
          newEvent.delta = newEvent.point.subtract(event.point);
          Mouse.Handles.onMouseDrag(newEvent);
          Mouse.Handles.onMouseUp(event);
          setTimeout(() => {
            expect(Mouse.State.button.drag).to.not.exist;
            done();
          });
        });
      });
      describe('- before a 0ms timeout', () => {
        afterEach((done) => {
          setTimeout(() => {
            done();
          });
        });
        it('should not reset State.button.active', () => {
          Mouse.Handles.onMouseUp(event);
          expect(Mouse.State.button.active).to.exist;
        });
        it('should not set State.button.last', () => {
          Mouse.Handles.onMouseUp(event);
          expect(Mouse.State.button.last).to.not.exist;
        });
        it('should not reset State.button.downAt', () => {
          Mouse.Handles.onMouseUp(event);
          expect(Mouse.State.button.downAt).to.exist;
        });
        it('should not reset State.button.drag', () => {
          event.point.set({ x: 200, y: 200});
          let newEvent = $.extend({}, event);
          newEvent.point = newEvent.point.clone();
          newEvent.delta = newEvent.point.subtract(event.point);
          Mouse.Handles.onMouseDrag(newEvent);
          Mouse.Handles.onMouseUp(event);
          expect(Mouse.State.button.drag).to.exist;
        });
      });
    });
    describe('#onMouseDrag', () => {
      var events;
      beforeEach(() => {
        event.point.set({ x: 150, y: 510 });
        event.event.button = 0;
        Mouse.Handles.onMouseDown(event);

        events = [];

        let newEvent;
        newEvent = $.extend({}, event);
        newEvent.point = newEvent.point.clone();
        newEvent.point.set({ x: 200, y: 200});
        newEvent.delta = newEvent.point.subtract(event.point);
        events.push(newEvent);

        newEvent = $.extend({}, event);
        newEvent.point = newEvent.point.clone();
        newEvent.point.set({ x: 202, y: 196});
        newEvent.delta = newEvent.point.subtract(events[events.length-1].point);
        events.push(newEvent);

        newEvent = $.extend({}, event);
        newEvent.point = newEvent.point.clone();
        newEvent.point.set({ x: 204, y: 192});
        newEvent.delta = newEvent.point.subtract(events[events.length-1].point);
        events.push(newEvent);

        newEvent = $.extend({}, event);
        newEvent.point = newEvent.point.clone();
        newEvent.point.set({ x: 206, y: 194});
        newEvent.delta = newEvent.point.subtract(events[events.length-1].point);
        events.push(newEvent);
      });
      afterEach((done) => {
        Mouse.Handles.onMouseUp(event);
        setTimeout(() => {
          done();
        });
      });
      it('should set State.point', () => {
        let event = events[0];
        Mouse.Handles.onMouseDrag(event);
        expect(Mouse.State.point.equals(event.point)).to.be.true;
      });
      it('should track State.button.drag.points', () => {
        let event = events[0];
        Mouse.Handles.onMouseDrag(event);
        expect(Mouse.State.button.drag.points).to.be.an('array');
      });
      it('should have some State.button.drag.points', () => {
        events.forEach((event) => {
          Mouse.Handles.onMouseDrag(event);
        });
        expect(Mouse.State.button.drag.points).to.not.be.empty;
      });
      it(`should track no more than ${Test.Lib.Core.StampLines.DEFAULT.config.UI.Mouse.maxDragPoints} drag.points`, () => {
        events.forEach((event) => {
          Mouse.Handles.onMouseDrag(event);
        });
        expect(Mouse.State.button.drag.points).to.have.length.not.above(Mouse.config.maxDragPoints);
      });
    });
    describe('#onDoubleClick', () => {
    });
  });
});
