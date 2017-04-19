describe('Palette.Type.Lines', () => {
  Test.assertSL();

  describe('Constructor', () => {
    let LinePalette;
    before(() => {
      LinePalette = new Test.Lib.Palette.Palette.Type.Lines(Test.SL, $.extend({}, Test.Lib.Core.StampLines.DEFAULT.config.Palettes.Lines));
    });
    after(() => {
      LinePalette.destroy();
    });
    it('should initialize', () => {
      expect(LinePalette).to.exist;
    });
    it('should be constructed by LinePalette', () => {
      expect(LinePalette.constructor.name).to.equal('LinePalette');
    });
  });

  describe('#generateDOM', () => {
    let LinePalette;
    before(() => {
      LinePalette = new Test.Lib.Palette.Palette.Type.Lines(Test.SL, $.extend({}, Test.Lib.Core.StampLines.DEFAULT.config.Palettes.Lines));
    });
    after(() => {
      LinePalette.destroy();
    });
    afterEach(() => {
      LinePalette.destroyDOM();
    });

    it('should return a DOM element', () => {
      let paletteDOM = LinePalette.generateDOM();
      expect(paletteDOM).to.exist;
    });
    it('should return a DOM element of class .sl-palette.sl-palette-lines', () => {
      let paletteDOM = LinePalette.generateDOM();
      expect(paletteDOM.is('.sl-palette.sl-palette-lines')).to.be.true;
    });
    it('should track the palette element in palette.DOM', () => {
      let paletteDOM = LinePalette.generateDOM();
      expect(LinePalette.DOM.palette).to.equal(paletteDOM);
    });
  });
});
