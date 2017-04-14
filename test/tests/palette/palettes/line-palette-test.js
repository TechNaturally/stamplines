describe('Palettes.LinePalette', function() {
  describe('Constructor', function() {
    Test.assertSL();
    let LinePalette = new Test.Lib.Palette.Palette.Type.LinePalette(Test.SL, $.extend({}, Test.Lib.Core.StampLines.defaults.config.Palettes.Lines));
    it('should initialize', function() {
      expect(LinePalette).to.exist;
    });
    it('should be constructed by LinePalette', function() {
      expect(LinePalette.constructor.name).to.equal('LinePalette');
    });
  });
});
