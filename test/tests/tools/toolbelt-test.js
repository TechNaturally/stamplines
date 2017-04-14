describe('Tools.ToolBelt', () => {
  describe('Constructor', () => {
    it('should initialize', () => {
      let ToolBelt = new Test.Lib.Tools.ToolBelt();
      expect(ToolBelt).to.exist;
    });
    it('should be constructed by ToolBelt', () => {
      let ToolBelt = new Test.Lib.Tools.ToolBelt();
      expect(ToolBelt.constructor.name).to.equal('ToolBelt');
    });
  });
});
