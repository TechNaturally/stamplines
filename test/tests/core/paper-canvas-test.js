describe('Core.PaperCanvas', function() {
  Test.assertSL();
  let PaperCanvas = new Test.Lib.Core.PaperCanvas(Test.SL, { canvas: Test.SL.canvas });
  describe('Constructor', function() {
    it('should initialize', function() {
      expect(PaperCanvas).to.exist;
    });
    it('should be constructed by PaperCanvas', function() {
      expect(PaperCanvas.constructor.name).to.equal("PaperCanvas");
    });
    it('should have a view', function() {
      expect(PaperCanvas.view).to.exist;
    });
  });
});
