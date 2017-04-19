describe('Core.Tool', () => {
  describe('Constructor', () => {
    let Tool;
    before(() => {
      Test.assertSL();
      Tool = new Test.Lib.Core.Tool(Test.SL, {});
    });
    it('should initialize', () => {
      expect(Tool).to.exist;
    });
    it('should be constructed by Tool', () => {
      expect(Tool.constructor.name).to.equal('Tool');
    });
  });
});
