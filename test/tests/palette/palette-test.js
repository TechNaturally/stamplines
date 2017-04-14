describe('Palette', () => {
  Test.assertSL();
  let Palette = Test.Lib.Palette.Palette;
  it('should exist', () => {
    expect(Palette).to.exist;
  });
  it('should have Type property', () => {
    expect(Palette.Type).to.exist;
  });
});
