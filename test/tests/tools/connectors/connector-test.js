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
  describe('#configure', () => {
    beforeEach(() => {
      Connector.config = undefined;
    });
    it('should call configureUI', () => {
      let spy = sinon.spy(Connector, 'configureUI');
      Connector.configure({});
      expect(spy.callCount).to.be.at.least(1);
      Connector.configureUI.restore();
    });
    it('should call initEventHandlers', () => {
      let spy = sinon.spy(Connector, 'initEventHandlers');
      Connector.configure({});
      expect(spy.callCount).to.be.at.least(1);
      Connector.initEventHandlers.restore();
    });
    it('should call registerSnappers', () => {
      let spy = sinon.spy(Connector, 'registerSnappers');
      Connector.configure({});
      expect(spy.callCount).to.be.at.least(1);
      Connector.registerSnappers.restore();
    });
  });
  describe('#configureUI', () => {
    beforeEach(() => {
      Connector.config.ui = undefined;
    });
    it('should force config.ui to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui).to.exist;
    });
    it('should force config.ui.color to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.color).to.not.be.empty;
    });
    it('should force config.ui.target to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target).to.exist;
    });
    it('should force config.ui.target.default to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.default).to.exist;
    });
    it('should force config.ui.target.default.type to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.default.type).to.not.be.empty;
    });
    it('should force config.ui.target.default.type to be a function (constructor)', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.default.type).to.be.a('function');
    });
    it('should force config.ui.target.default.radius to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.default.radius).to.not.be.empty;
    });
    it('should force config.ui.target.hitScale to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.hitScale).to.not.be.empty;
    });
    it('should force config.ui.target.style to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.style).to.exist;
    });
    it('should force config.ui.target.style.strokeColor to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.style.strokeColor).to.not.be.empty;
    });
    it('should force config.ui.target.style.strokeWidth to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.style.strokeWidth).to.not.be.empty;
    });
    it('should force config.ui.target.style.fillColor to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.style.fillColor).to.not.be.empty;
    });
    it('should force config.ui.target.style.opacity to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.style.opacity).to.exist;
    });
    it('should force config.ui.target.style.cornerRadius to be set', () => {
      Connector.configureUI();
      expect(Connector.config.ui.target.style.cornerRadius).to.exist;
    });
  });

  describe('#reset', () => {
    it('should call resetEventHandlers()', () => {
      let spy = sinon.spy(Connector, 'resetEventHandlers');
      Connector.reset();
      expect(spy.callCount).to.be.at.least(1);
      Connector.resetEventHandlers.restore();
    });
    it('should call unregisterSnappers()', () => {
      let spy = sinon.spy(Connector, 'unregisterSnappers');
      Connector.reset();
      expect(spy.callCount).to.be.at.least(1);
      Connector.unregisterSnappers.restore();
    });
    it('should call resetUI()', () => {
      let spy = sinon.spy(Connector, 'resetUI');
      Connector.reset();
      expect(spy.callCount).to.be.at.least(1);
      Connector.resetUI.restore();
    });
  });

  describe('#initEventHandlers', () => {
    beforeEach(() => {
      Connector.resetEventHandlers();
    });
  });
  describe('#resetEventHandlers', () => {
    beforeEach(() => {
      Connector.initEventHandlers();
    });
  });

  describe('#registerSnappers', () => {
    beforeEach(() => {
      Connector.unregisterSnappers();
    });
  });
  describe('#unregisterSnappers', () => {
    beforeEach(() => {
      Connector.registerSnappers();
    });
  });

  describe('#resetUI', () => {
    it('should call resetUITargets', () => {
      let spy = sinon.spy(Connector, 'resetUITargets');
      Connector.reset();
      expect(spy.callCount).to.be.at.least(1);
      Connector.resetUITargets.restore();
    });
  });
  describe('#resetUITargets', () => {
    it('should destroy each item of UI.Targets');
    it('should empty UI.Targets');
  });

  describe('#showTargets', () => {
  });
  describe('#hideTargets', () => {
    it('should call resetUITargets', () => {
      let spy = sinon.spy(Connector, 'resetUITargets');
      Connector.reset();
      expect(spy.callCount).to.be.at.least(1);
      Connector.resetUITargets.restore();
    });
  });
});
