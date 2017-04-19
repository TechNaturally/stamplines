describe('Core.PaperCanvas', () => {
  let canvas, PaperCanvas;
  before(() => {
    Test.assertSL();
    canvas = $('<canvas></canvas>');
    PaperCanvas = new Test.Lib.Core.PaperCanvas(Test.SL, { canvas: canvas });
  });
  after(() => {
    PaperCanvas.destroy();
    PaperCanvas = undefined;
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(PaperCanvas).to.exist;
    });
    it('should be constructed by PaperCanvas', () => {
      expect(PaperCanvas.constructor.name).to.equal('PaperCanvas');
    });
    it('should have a project', () => {
      expect(PaperCanvas.project).to.exist;
    });
    it('should not be the active paper project', () => {
      // Test.SL.Paper.project should still be active, because it was created before the local PaperCanvas
      expect(PaperCanvas.project).to.not.equal(paper.project);
    });
    it('should have a view', () => {
      expect(PaperCanvas.view).to.exist;
    });
  });

  describe('#canvas [DOM Element]', () => {
    it('should be set', () => {
      expect(PaperCanvas.canvas).to.exist;
    });
    it('should be a jQuery-wrapped canvas element', () => {
      expect(PaperCanvas.canvas).to.not.be.empty;
      expect(PaperCanvas.canvas[0].nodeName.toUpperCase()).to.eql('CANVAS');
    });
    it('should have class "sl-canvas"', () => {
      expect(PaperCanvas.canvas.hasClass('sl-canvas')).to.be.true;
    });
  });
});
