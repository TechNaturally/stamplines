describe('Tools.Connectors.LabelConnector', () => {
  let LabelConnector;
  before(() => {
    Test.assertSL();
    LabelConnector = new Test.Lib.Tools.Connectors.LabelConnector(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(LabelConnector).to.exist;
    });
    it('should be constructed by LabelConnector', () => {
      expect(LabelConnector.constructor.name).to.equal('LabelConnector');
    });
  });
  
  describe('#initEventHandlers', () => {
    beforeEach(() => {
      LabelConnector.resetEventHandlers();
    });
  });
  describe('#resetEventHandlers', () => {
    beforeEach(() => {
      LabelConnector.initEventHandlers();
    });
  });

  describe('#registerSnappers', () => {
    beforeEach(() => {
      LabelConnector.unregisterSnappers();
    });
  });
  describe('#unregisterSnappers', () => {
    beforeEach(() => {
      LabelConnector.registerSnappers();
    });
  });

  describe('#resetUI', () => {
  });
});
