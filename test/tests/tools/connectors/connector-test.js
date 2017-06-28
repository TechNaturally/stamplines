describe('Tools.Connectors.Connector', () => {
  let Connector;
  before(() => {
    Test.assertSL();
    Connector = new Test.Lib.Tools.Connectors.Connector(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Connector).to.exist;
    });
    it('should be constructed by Connector', () => {
      expect(Connector.constructor.name).to.equal('Connector');
    });
  });
  // @TODO: Tests - Tools.Connectors.Connector
});
