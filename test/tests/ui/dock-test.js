describe('UI.Dock', () => {
  Test.assertSL();
  let PaperCanvas = Test.SL.UI.PaperCanvas;
  let Dock = new Test.Lib.UI.Dock(Test.SL.UI, $.extend({
    paperCanvas: PaperCanvas
  }, Test.Lib.Core.StampLines.defaults.config.UI.Dock));

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Dock).to.exist;
    });
    it('should be constructed by Dock', () => {
      expect(Dock.constructor.name).to.equal('Dock');
    });
    it('should have a paperCanvas in its config', () => {
      expect(Dock.config.paperCanvas).to.exist;
    });
  });
});
