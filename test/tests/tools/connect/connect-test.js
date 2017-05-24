describe('Tools.Connect.Connect', () => {
  let Connect;
  before(() => {
    Test.assertSL();
    Connect = new Test.Lib.Tools.Connect.Connect(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Connect).to.exist;
    });
    it('should be constructed by Connect', () => {
      expect(Connect.constructor.name).to.equal('Connect');
    });
  });
});
