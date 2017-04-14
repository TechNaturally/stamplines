describe('UI.Mouse', function() {
  Test.assertSL();
  let PaperCanvas = Test.SL.UI.PaperCanvas;
  let Mouse = new Test.Lib.UI.Mouse($.extend({
    paperCanvas: PaperCanvas
  }, Test.Lib.Core.StampLines.defaults.config.UI.Mouse));

  describe('Constructor', function() {
    it('should initialize', function() {
      expect(Mouse).to.exist;
    });
    it('should be constructed by Mouse', function() {
      expect(Mouse.constructor.name).to.equal('Mouse');
    });
    it('should have a paperCanvas in its config', function() {
      expect(Mouse.config.paperCanvas).to.exist;
    });
  });

  describe('PaperCanvas.view', function() {
    var PaperView = PaperCanvas.view;
    it('should exist', function() {
      expect(PaperView).to.exist;
    });
    it('should be bound to Mouse.Handles.onMouseEnter', function() {
      expect(PaperView.onMouseEnter).to.equal(Mouse.Handles.onMouseEnter);
    });
    it('should be bound to Mouse.Handles.onMouseLeave', function() {
      expect(PaperView.onMouseLeave).to.equal(Mouse.Handles.onMouseLeave);
    });
    it('should be bound to Mouse.Handles.onMouseMove', function() {
      expect(PaperView.onMouseMove).to.equal(Mouse.Handles.onMouseMove);
    });
    it('should be bound to Mouse.Handles.onMouseDown', function() {
      expect(PaperView.onMouseDown).to.equal(Mouse.Handles.onMouseDown);
    });
    it('should be bound to Mouse.Handles.onMouseUp', function() {
      expect(PaperView.onMouseUp).to.equal(Mouse.Handles.onMouseUp);
    });
    it('should be bound to Mouse.Handles.onMouseDrag', function() {
      expect(PaperView.onMouseDrag).to.equal(Mouse.Handles.onMouseDrag);
    });
    it('should be bound to Mouse.Handles.onDoubleClick', function() {
      expect(PaperView.onDoubleClick).to.equal(Mouse.Handles.onDoubleClick);
    });
  });

  describe('UI.Mouse.Handles', function() {
    var event;
    beforeEach(function() {
      event = {
        delta: null,
        event: {
          button: 0
        },
        point: new paper.Point(0, 0),
        target: PaperCanvas.view
      };
    });
    describe('#onMouseEnter', function() {
      it('should set State.active to true', function() {
        Mouse.Handles.onMouseEnter(event);
        expect(Mouse.State.active).to.be.true;
      });
    });
    describe('#onMouseLeave', function() {
      it('should set State.active to false', function() {
        Mouse.Handles.onMouseLeave(event);
        expect(Mouse.State.active).to.be.false;
      });
    });
    describe('#onMouseMove', function() {
      var point;
      beforeEach(function() {
        event.point.set({ x: 50, y: 50 });
      });
      it('should set State.point', function() {
        Mouse.Handles.onMouseMove(event);
        expect(Mouse.State.point).to.eql(event.point);
      });
      it('should set State.lastMove', function() {
        Mouse.Handles.onMouseMove(event);
        expect(Mouse.State.lastMove).to.equal(event);
      });
    });
    describe('#onMouseDown', function() {
      beforeEach(function() {
        event.point.set({ x: 50, y: 50 });
        event.event.button = 0;
      });
      it('should set State.button.active', function() {
        Mouse.Handles.onMouseDown(event);
        expect(Mouse.State.button.active).to.equal(event.event.button);
      });
      it('should set State.button.downAt', function() {
        Mouse.Handles.onMouseDown(event);
        expect(Mouse.State.button.downAt).to.eql(event.point);
      });
    });
    describe('#onMouseUp', function() {
      beforeEach(function() {
        let preEvent = $.extend({}, event);
        Mouse.Handles.onMouseDown(preEvent);

        event.point.set({ x: 50, y: 50 });
        event.event.button = 0;
        Mouse.State.button.last = null;
      });
      describe('- after a 0ms timeout', function() {
        it('should reset State.button.active', function(done) {
          Mouse.Handles.onMouseUp(event);
          setTimeout(() => {
            expect(Mouse.State.button.active).to.be.null;
            done();
          });
        });
        it('should set State.button.last', function(done) {
          let lastCheck = Mouse.State.button.active;
          Mouse.Handles.onMouseUp(event);
          setTimeout(() => {
            expect(Mouse.State.button.last).to.equal(lastCheck);
            done();
          });
        });
        it('should reset State.button.downAt', function(done) {
          Mouse.Handles.onMouseUp(event);
          setTimeout(() => {
            expect(Mouse.State.button.downAt).to.not.exist;
            done();
          });
        });
        it('should reset State.button.drag', function(done) {
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
      describe('- before a 0ms timeout', function() {
        afterEach(function(done) {
          setTimeout(() => {
            done();
          });
        });
        it('should not reset State.button.active', function() {
          Mouse.Handles.onMouseUp(event);
          expect(Mouse.State.button.active).to.exist;
        });
        it('should not set State.button.last', function() {
          Mouse.Handles.onMouseUp(event);
          expect(Mouse.State.button.last).to.not.exist;
        });
        it('should not reset State.button.downAt', function() {
          Mouse.Handles.onMouseUp(event);
          expect(Mouse.State.button.downAt).to.exist;
        });
        it('should not reset State.button.drag', function() {
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
    describe('#onMouseDrag', function() {
      var events;
      beforeEach(function() {
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
      afterEach(function(done) {
        Mouse.Handles.onMouseUp(event);
        setTimeout(() => {
          done();
        });
      });
      it('should set State.point', function() {
        let event = events[0];
        Mouse.Handles.onMouseDrag(event);
        expect(Mouse.State.point.equals(event.point)).to.be.true;
      });
      it('should track State.button.drag.points', function() {
        let event = events[0];
        Mouse.Handles.onMouseDrag(event);
        expect(Mouse.State.button.drag.points).to.be.an('array');
      });
      it('should have some State.button.drag.points', function() {
        events.forEach((event) => {
          Mouse.Handles.onMouseDrag(event);
        });
        expect(Mouse.State.button.drag.points).to.not.be.empty;
      });
      it(`should track no more than ${Mouse.config.maxDragPoints} drag.points`, function() {
        events.forEach((event) => {
          Mouse.Handles.onMouseDrag(event);
        });
        expect(Mouse.State.button.drag.points).to.have.length.not.above(Mouse.config.maxDragPoints);
      });
    });
    describe('#onDoubleClick', function() {
    });
  });
});
