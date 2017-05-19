describe('Utils.Geo', () => {
  let Geo;
  before(() => {
    Test.assertSL();
    Geo = new Test.Lib.Utils.Geo(Test.SL, Test.SL.Utils.config.Geo);
  });
  after(() => {
    Geo.destroy();
    Geo = undefined;
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Geo).to.exist;
    });
    it('should be constructed by Geo', () => {
      expect(Geo.constructor.name).to.equal('Geo');
    });
  });
});
