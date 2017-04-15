describe('Palette.Type.Stamps', () => {
  describe('Constructor', () => {
    Test.assertSL();
    let StampPalette = new Test.Lib.Palette.Palette.Type.Stamps(Test.SL, $.extend({}, Test.Lib.Core.StampLines.DEFAULT.config.Palettes.Stamps));
    it('should initialize', () => {
      expect(StampPalette).to.exist;
    });
    it('should be constructed by StampPalette', () => {
      expect(StampPalette.constructor.name).to.equal('StampPalette');
    });
  });
});
