describe('Palette.Type.Stamps', () => {
  Test.assertSL();

  describe('Constructor', () => {
    let StampPalette;
    before(() => {
      StampPalette = new Test.Lib.Palette.Palette.Type.Stamps(Test.SL, $.extend({}, Test.Lib.Core.StampLines.DEFAULT.config.Palettes.Stamps));
    });
    after(() => {
      StampPalette.destroy();
    });
    it('should initialize', () => {
      expect(StampPalette).to.exist;
    });
    it('should be constructed by StampPalette', () => {
      expect(StampPalette.constructor.name).to.equal('StampPalette');
    });
  });

  describe('#generateDOM', () => {
    let StampPalette, stampsConfig;
    before(() => {
      stampsConfig = $.extend(
        {},
        Test.Lib.Core.StampLines.DEFAULT.config.Palettes.Stamps,
        Test.Files['assets/StampLines.json'].Palettes.Stamps
      );
      StampPalette = new Test.Lib.Palette.Palette.Type.Stamps(Test.SL, stampsConfig);
    });
    after(() => {
      StampPalette.destroy();
    });
    afterEach(() => {
      StampPalette.destroyDOM();
    });

    it('should return a DOM element', () => {
      let paletteDOM = StampPalette.generateDOM();
      expect(paletteDOM).to.exist;
    });
    it('should return a DOM element of class .sl-palette.sl-palette-stamps', () => {
      let paletteDOM = StampPalette.generateDOM();
      expect(paletteDOM.is('.sl-palette.sl-palette-stamps')).to.be.true;
    });
    it('should track the palette element in palette.DOM', () => {
      let paletteDOM = StampPalette.generateDOM();
      expect(StampPalette.DOM.palette).to.equal(paletteDOM);
    });
//    it('should return a DOM element');
  });
});
