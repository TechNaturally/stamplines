describe('UI.Keyboard', () => {
  let PaperCanvas, Keyboard;
  before(() => {
    Test.assertSL();
    PaperCanvas = Test.SL.UI.PaperCanvas;
    Keyboard = new Test.Lib.UI.Keyboard(Test.SL, $.extend({
      paperCanvas: PaperCanvas
    }, Test.Lib.Core.StampLines.DEFAULT.config.UI.Keyboard));
  });
  after(() => {
    Keyboard.destroy();
    Keyboard = undefined;
    PaperCanvas = undefined;
  });

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Keyboard).to.exist;
    });
    it('should be constructed by Keyboard', () => {
      expect(Keyboard.constructor.name).to.equal('Keyboard');
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
    it('should be bound to Keyboard.Handles.onKeyDown', () => {
      expect(PaperView.onKeyDown).to.equal(Keyboard.Handles.onKeyDown);
    });
    it('should be bound to Keyboard.Handles.onKeyUp', () => {
      expect(PaperView.onKeyUp).to.equal(Keyboard.Handles.onKeyUp);
    });
  });

  describe('UI.Keyboard.Handles', () => {
    let event = {
      key: 'A'
    };
    afterEach(() => {
      Keyboard.Handles.onKeyUp(event);
    });
    describe('#onKeyDown', () => {
      it(`should add "${event.key}" to State.activeKeys`, () => {
        Keyboard.Handles.onKeyDown(event);
        expect(Keyboard.State.activeKeys).to.contain(event.key);
      });
      it('should not add a key to State.activeKeys if it already exists', () => {
        Keyboard.Handles.onKeyDown(event);
        Keyboard.Handles.onKeyDown(event);
        expect(Keyboard.State.activeKeys).to.have.lengthOf(1);
      });
    });
    describe('#onKeyUp', () => {
      beforeEach(() => {
        Keyboard.Handles.onKeyDown(event);
      });
      it(`should remove "${event.key}" from State.activeKeys`, () => {
        Keyboard.Handles.onKeyUp(event);
        expect(Keyboard.State.activeKeys.indexOf(event.key)).to.equal(-1);
      });
    });
    describe('#keyActive', () => {
      it('should return true for a key that is pressed', () => {
        Keyboard.Handles.onKeyDown(event);
        expect(Keyboard.keyActive(event.key)).to.be.true;
      });
      it('should return false for a key that is not pressed', () => {
        expect(Keyboard.keyActive(event.key)).to.be.false;
      });
      it('should return false for a key that was pressed and released', () => {
        Keyboard.Handles.onKeyDown(event);
        Keyboard.Handles.onKeyUp(event);
        expect(Keyboard.keyActive(event.key)).to.be.false;
      });
    });
  });
});
