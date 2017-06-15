describe('Palette.Type.Tools', () => {
  Test.assertSL();

  describe('Constructor', () => {
    let ToolPalette;
    before(() => {
      ToolPalette = new Test.Lib.Palette.Palette.Type.Tools(Test.SL, $.extend({}, Test.Lib.Core.StampLines.DEFAULT.config.Palettes.Tools));
    });
    after(() => {
      ToolPalette.destroy();
    });
    it('should initialize', () => {
      expect(ToolPalette).to.exist;
    });
    it('should be constructed by ToolPalette', () => {
      expect(ToolPalette.constructor.name).to.equal('ToolPalette');
    });
  });

  describe('#generateDOM', () => {
    let ToolPalette;
    before(() => {
      ToolPalette = new Test.Lib.Palette.Palette.Type.Tools(Test.SL, $.extend({}, Test.Lib.Core.StampLines.DEFAULT.config.Palettes.Tools));
    });
    after(() => {
      ToolPalette.destroy();
    });
    afterEach(() => {
      ToolPalette.destroyDOM();
    });

    it('should return a DOM element', () => {
      let paletteDOM = ToolPalette.generateDOM();
      expect(paletteDOM).to.exist;
    });
    it('should return a DOM element of class .sl-palette.sl-palette-tools', () => {
      let paletteDOM = ToolPalette.generateDOM();
      expect(paletteDOM.is('.sl-palette.sl-palette-tools')).to.be.true;
    });
    it('should track the palette element in palette.DOM', () => {
      let paletteDOM = ToolPalette.generateDOM();
      expect(ToolPalette.DOM.palette).to.equal(paletteDOM);
    });
  });
});
