describe('Core.Tool', function() {
  describe('Constructor', function() {
    Test.assertSL();
    let Tool = new Test.Lib.Core.Tool(Test.SL, {});
    it('should initialize', function() {
      expect(Tool).to.exist;
    });
    it('should be constructed by Tool', function() {
      expect(Tool.constructor.name).to.equal('Tool');
    });
  });
});
