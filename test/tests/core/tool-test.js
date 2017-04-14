describe('Core.Tool', () => {
  describe('Constructor', () => {
    Test.assertSL();
    let Tool = new Test.Lib.Core.Tool(Test.SL, {});
    it('should initialize', () => {
      expect(Tool).to.exist;
    });
    it('should be constructed by Tool', () => {
      expect(Tool.constructor.name).to.equal('Tool');
    });
  });
});
