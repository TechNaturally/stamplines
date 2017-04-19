describe('Core.Util', () => {
  describe('Constructor', () => {
    let Util;
    before(() => {
      Test.assertSL();
      Util = new Test.Lib.Core.Util(Test.SL, {});
    });
    it('should initialize', () => {
      expect(Util).to.exist;
    });
    it('should be constructed by Util', () => {
      expect(Util.constructor.name).to.equal('Util');
    });
    it('should activate', () => {
      Util.activate();
      expect(Util.isActive()).to.be.true;
    });
    it('should deactivate', () => {
      Util.activate();
      Util.deactivate();
      expect(Util.isActive()).to.be.false;
    });
  });
});
