describe('UI.Dock', function() {
  Test.assertSL();
  let PaperCanvas = Test.SL.UI.PaperCanvas;
  let Dock = new Test.Lib.UI.Dock(Test.SL.UI, $.extend({
    paperCanvas: PaperCanvas
  }, Test.Lib.Core.StampLines.defaults.config.UI.Dock));

  describe('Constructor', function() {
    it('should initialize', function() {
      expect(Dock).to.exist;
    });
    it('should be constructed by Dock', function() {
      expect(Dock.constructor.name).to.equal('Dock');
    });
    it('should have a paperCanvas in its config', function() {
      expect(Dock.config.paperCanvas).to.exist;
    });
  });
});
