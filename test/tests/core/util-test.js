describe('Core.Util', function() {
  describe('Constructor', function() {
    Test.assertSL();
    let Util = new Test.Lib.Core.Util(Test.SL, {});
    it('should initialize', function() {
      expect(Util).to.exist;
    });
    it('should be constructed by Util', function() {
      expect(Util.constructor.name).to.equal('Util');
    });
    it('should activate', function() {
      Util.activate();
      expect(Util.isActive()).to.be.true;
    });
    it('should deactivate', function() {
      Util.activate();
      Util.deactivate();
      expect(Util.isActive()).to.be.false;
    });
  });
});
