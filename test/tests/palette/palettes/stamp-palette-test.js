describe('Palettes.StampPalette', function() {
  describe('Constructor', function() {
    Test.assertSL();
    let StampPalette = new Test.Lib.Palette.Palette.Type.StampPalette(Test.SL, $.extend({}, Test.Lib.Core.StampLines.defaults.config.Palettes.Stamps));
    it('should initialize', function() {
      expect(StampPalette).to.exist;
    });
    it('should be constructed by StampPalette', function() {
      expect(StampPalette.constructor.name).to.equal('StampPalette');
    });
  });
});
