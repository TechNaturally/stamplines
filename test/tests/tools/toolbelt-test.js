describe('Tools.ToolBelt', function() {
  describe('Constructor', function() {
    it('should initialize', function() {
    	let ToolBelt = new Test.Lib.Tools.ToolBelt();
    	expect(ToolBelt).to.exist;
    });
    it('should be constructed by ToolBelt', function() {
    	let ToolBelt = new Test.Lib.Tools.ToolBelt();
    	expect(ToolBelt.constructor.name).to.equal("ToolBelt");
    });
  });
});
