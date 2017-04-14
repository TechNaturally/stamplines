describe('Core.Palette', function() {
  describe('Constructor', function() {
    Test.assertSL();
    let Palette = new Test.Lib.Core.Palette(Test.SL, $.extend({}, Test.Lib.Core.StampLines.defaults.config.Palettes));
    it('should initialize', function() {
      expect(Palette).to.exist;
    });
    it('should be constructed by Palette', function() {
      expect(Palette.constructor.name).to.equal('Palette');
    });
  });
});
