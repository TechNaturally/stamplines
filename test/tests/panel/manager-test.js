describe('Panel.Manager', () => {
  describe('Constructor', () => {
    it('should initialize');
  });
  describe('#reset', () => {
    it('should close all item panels');
    it('should call resetEventHandlers');
  });

  describe('#initEventHandlers', () => {
    it('should initialize eventHandlers.DestroyItem');
    it('should initialize eventHandlers.DoubleClick');
  });
  describe('#resetEventHandlers', () => {
    it('should remove eventHandlers.DestroyItem');
    it('should remove eventHandlers.DoubleClick');
  });

  describe('#getPanelType', () => {
    it('should return StampPanel when given a Stamp item');
    it('should return LinePanel when given a Stamp item');
    it('should return Panel otherwise');
  });
  describe('#getPanelID', () => {
    it('should return nothing');
  });
  describe('#getPanelConfig', () => {
    it('should return a config with data.item set');
  });

  describe('#addPanelToDOM', () => {
    it('should call panel.generateDOM');
    it('should call SL.UI.PaperDOM.addElement');
  });
  describe('#removePanelFromDOM', () => {
    it('should call SL.UI.PaperDOM.removeElement');
  });

  describe('#openItemPanel', () => {
    describe('- given a Stamp item', () => {
      it('should open a new StampPanel');
    });
    describe('- given a Line item', () => {
      it('should open a new LinePanel');
    });
  });
  describe('#getItemPanel', () => {
    describe('- when called with no arguments', () => {
      it('should return all item panels');
    });
    describe('- when called with a string argument', () => {
      it('should look up the panel by id ');
    });
    describe('- otherwise', () => {
      it('should look up the panel by item');
    });
  });
  describe('#closeItemPanel', () => {
    it('should look up and close the panel(s)');
  });
});
