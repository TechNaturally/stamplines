describe('Palette.Type.LinePalette', () => {
  describe('Constructor', () => {
    Test.assertSL();
    let LinePalette = new Test.Lib.Palette.Palette.Type.LinePalette(Test.SL, $.extend({}, Test.Lib.Core.StampLines.defaults.config.Palettes.Lines));
    it('should initialize', () => {
      expect(LinePalette).to.exist;
    });
    it('should be constructed by LinePalette', () => {
      expect(LinePalette.constructor.name).to.equal('LinePalette');
    });
  });
});
