describe('Tools.Connectors.LineConnector', () => {
  let LineConnector;
  before(() => {
    Test.assertSL();
    LineConnector = new Test.Lib.Tools.Connectors.LineConnector(Test.SL, {}, Test.SL.Tools);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(LineConnector).to.exist;
    });
    it('should be constructed by LineConnector', () => {
      expect(LineConnector.constructor.name).to.equal('LineConnector');
    });
  });

  describe('#initEventHandlers', () => {
    beforeEach(() => {
      LineConnector.resetEventHandlers();
    });
    it('should initialize eventHandlers.GenerateStamp', () => {
      LineConnector.initEventHandlers();
      expect(LineConnector.eventHandlers.GenerateStamp).to.exist;
    });
    it('should initialize eventHandlers.DestroyItem', () => {
      LineConnector.initEventHandlers();
      expect(LineConnector.eventHandlers.DestroyItem).to.exist;
    });
    it('should initialize eventHandlers.LineEndTarget', () => {
      LineConnector.initEventHandlers();
      expect(LineConnector.eventHandlers.LineEndTarget).to.exist;
    });
    it('should initialize eventHandlers.LineSegmentAdded', () => {
      LineConnector.initEventHandlers();
      expect(LineConnector.eventHandlers.LineSegmentAdded).to.exist;
    });
  });
  describe('#resetEventHandlers', () => {
    beforeEach(() => {
      LineConnector.initEventHandlers();
    });
    it('should remove eventHandlers.GenerateStamp', () => {
      LineConnector.resetEventHandlers();
      expect(LineConnector.eventHandlers.GenerateStamp).to.not.exist;
    });
    it('should remove eventHandlers.DestroyItem', () => {
      LineConnector.resetEventHandlers();
      expect(LineConnector.eventHandlers.DestroyItem).to.not.exist;
    });
    it('should remove eventHandlers.LineEndTarget', () => {
      LineConnector.resetEventHandlers();
      expect(LineConnector.eventHandlers.LineEndTarget).to.not.exist;
    });
    it('should remove eventHandlers.LineSegmentAdded', () => {
      LineConnector.resetEventHandlers();
      expect(LineConnector.eventHandlers.LineSegmentAdded).to.not.exist;
    });
  });

  describe('#registerSnappers', () => {
    beforeEach(() => {
      LineConnector.unregisterSnappers();
    });
    it('should register Snappers.point', () => {
      LineConnector.registerSnappers();
      expect(LineConnector.Snappers.point).to.exist;
    });
    it('should register Snappers.item', () => {
      LineConnector.registerSnappers();
      expect(LineConnector.Snappers.item).to.exist;
    });
  });
  describe('#unregisterSnappers', () => {
    beforeEach(() => {
      LineConnector.registerSnappers();
    });
    it('should unregister Snappers.point', () => {
      LineConnector.unregisterSnappers();
      expect(LineConnector.Snappers.point).to.not.exist;
    });
    it('should unregister Snappers.item', () => {
      LineConnector.unregisterSnappers();
      expect(LineConnector.Snappers.item).to.not.exist;
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
