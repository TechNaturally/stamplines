describe('Core.PaperCanvas', function() {
  Test.assertSL();
  let PaperCanvas = new Test.Lib.Core.PaperCanvas(Test.SL, { canvas: Test.SL.canvas });
  describe('Constructor', function() {
    it('should initialize', function() {
      expect(PaperCanvas).to.exist;
    });
    it('should be constructed by PaperCanvas', function() {
      expect(PaperCanvas.constructor.name).to.equal('PaperCanvas');
    });
    it('should have a view', function() {
      expect(PaperCanvas.view).to.exist;
    });
  });

  describe('#canvas [DOM Element]', function() {
    it('should be set', function() {
      expect(PaperCanvas.canvas).to.exist;
    });
    it('should be a jQuery-wrapped canvas element', function() {
      expect(PaperCanvas.canvas).to.not.be.empty;
      expect(PaperCanvas.canvas[0].nodeName.toUpperCase()).to.eql('CANVAS');
    });
    it('should have class "sl-canvas"', function() {
      expect(PaperCanvas.canvas.hasClass('sl-canvas')).to.be.true;
    });
  });
});
