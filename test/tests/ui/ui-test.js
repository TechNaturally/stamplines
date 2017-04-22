describe('UI', () => {
  let UI;
  before(() => {
    Test.assertSL();
    // last argument is the "control" object
    UI = new Test.Lib.UI.UI(Test.SL, Test.SL.config.UI, {paper: Test.SL.Paper});
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(UI).to.exist;
    });
    it('should be constructed by UI', () => {
      expect(UI.constructor.name).to.equal('UI');
    });
    it('should have a Dock constructed by Dock', () => {
      expect(UI.Dock.constructor.name).to.equal('Dock');
    });
    it('should have a Mouse constructed by Mouse', () => {
      expect(UI.Mouse.constructor.name).to.equal('Mouse');
    });
    it('should have a Keyboard constructed by Keyboard', () => {
      expect(UI.Keyboard.constructor.name).to.equal('Keyboard');
    });
  });
});
