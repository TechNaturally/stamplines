describe('Palette', () => {
  let Palette;
  before(() => {
    Test.assertSL();
    Palette = Test.Lib.Palette.Palette;
  });
  it('should exist', () => {
    expect(Palette).to.exist;
  });
  it('should have Manager property', () => {
    expect(Palette.Manager).to.exist;
  });
  it('should have Type property', () => {
    expect(Palette.Type).to.exist;
  });
});
