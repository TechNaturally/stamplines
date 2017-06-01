describe('Panel', () => {
  let Panel;
  before(() => {
    Test.assertSL();
    Panel = Test.Lib.Panel.Panel;
  });
  it('should exist', () => {
    expect(Panel).to.exist;
  });
  it('should have Manager property', () => {
    expect(Panel.Manager).to.exist;
  });
  it('should have Type property', () => {
    expect(Panel.Type).to.exist;
  });
});
