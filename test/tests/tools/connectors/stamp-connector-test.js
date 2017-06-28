describe('Tools.Connectors.StampConnector', () => {
  let StampConnector;
  before(() => {
    Test.assertSL();
    StampConnector = new Test.Lib.Tools.Connectors.StampConnector(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(StampConnector).to.exist;
    });
    it('should be constructed by StampConnector', () => {
      expect(StampConnector.constructor.name).to.equal('StampConnector');
    });
  });
  // @TODO: Tests - Tools.Connectors.StampConnector
});
