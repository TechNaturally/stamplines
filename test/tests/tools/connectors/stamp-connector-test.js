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

  describe('#initEventHandlers', () => {
    beforeEach(() => {
      StampConnector.resetEventHandlers();
    });
    it('should initialize eventHandlers.GenerateStamp', () => {
      StampConnector.initEventHandlers();
      expect(StampConnector.eventHandlers.GenerateStamp).to.exist;
    });
    it('should initialize eventHandlers.DestroyItem', () => {
      StampConnector.initEventHandlers();
      expect(StampConnector.eventHandlers.DestroyItem).to.exist;
    });
    it('should initialize eventHandlers.LineEndTarget', () => {
      StampConnector.initEventHandlers();
      expect(StampConnector.eventHandlers.LineEndTarget).to.exist;
    });
    it('should initialize eventHandlers.LineSegmentAdded', () => {
      StampConnector.initEventHandlers();
      expect(StampConnector.eventHandlers.LineSegmentAdded).to.exist;
    });
  });
  describe('#resetEventHandlers', () => {
    beforeEach(() => {
      StampConnector.initEventHandlers();
    });
    it('should remove eventHandlers.GenerateStamp', () => {
      StampConnector.resetEventHandlers();
      expect(StampConnector.eventHandlers.GenerateStamp).to.not.exist;
    });
    it('should remove eventHandlers.DestroyItem', () => {
      StampConnector.resetEventHandlers();
      expect(StampConnector.eventHandlers.DestroyItem).to.not.exist;
    });
    it('should remove eventHandlers.LineEndTarget', () => {
      StampConnector.resetEventHandlers();
      expect(StampConnector.eventHandlers.LineEndTarget).to.not.exist;
    });
    it('should remove eventHandlers.LineSegmentAdded', () => {
      StampConnector.resetEventHandlers();
      expect(StampConnector.eventHandlers.LineSegmentAdded).to.not.exist;
    });
  });

  describe('#registerSnappers', () => {
    beforeEach(() => {
      StampConnector.unregisterSnappers();
    });
    it('should register Snappers.point', () => {
      StampConnector.registerSnappers();
      expect(StampConnector.Snappers.point).to.exist;
    });
    it('should register Snappers.item', () => {
      StampConnector.registerSnappers();
      expect(StampConnector.Snappers.item).to.exist;
    });
  });
  describe('#unregisterSnappers', () => {
    beforeEach(() => {
      StampConnector.registerSnappers();
    });
    it('should unregister Snappers.point', () => {
      StampConnector.unregisterSnappers();
      expect(StampConnector.Snappers.point).to.not.exist;
    });
    it('should unregister Snappers.item', () => {
      StampConnector.unregisterSnappers();
      expect(StampConnector.Snappers.item).to.not.exist;
    });
  });

  describe('#DisconnectItem', () => {
  });
  describe('#DisconnectSegment', () => {
  });

  describe('#SnapPoint', () => {
  });
  describe('#SnapItem', () => {
  });
});
