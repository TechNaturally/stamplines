describe('Core.Palette', () => {
  describe('Constructor', () => {
    Test.assertSL();
    let Palette = new Test.Lib.Core.Palette(Test.SL, $.extend({}, Test.Lib.Core.StampLines.defaults.config.Palettes));
    it('should initialize', () => {
      expect(Palette).to.exist;
    });
    it('should be constructed by Palette', () => {
      expect(Palette.constructor.name).to.equal('Palette');
    });
  });
});
