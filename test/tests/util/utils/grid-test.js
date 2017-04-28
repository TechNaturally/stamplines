describe('Utils.Grid', () => {
  let Grid;
  before(() => {
    Test.assertSL();
    Grid = new Test.Lib.Utils.Grid(Test.SL, Test.SL.Utils.config.Grid);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Grid).to.exist;
    });
    it('should be constructed by Grid', () => {
      expect(Grid.constructor.name).to.equal('Grid');
    });
  });
});
