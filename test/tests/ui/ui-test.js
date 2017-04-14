describe('UI', () => {
  Test.assertSL();
  let UI = new Test.Lib.UI.UI(Test.SL, Test.SL.config.UI, {paper: Test.SL.Paper});
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(UI).to.exist;
    });
    it('should be constrcuted by UI', () => {
      expect(UI.constructor.name).to.equal('UI');
    });
    it('should have a Dock', () => {
      expect(UI.Dock).to.exist;
    });
    it('should have a Mouse', () => {
      expect(UI.Mouse).to.exist;
    });
  });
});
