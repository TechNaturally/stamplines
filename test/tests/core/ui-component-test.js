describe('Core.UI.Component', function() {
  describe('Constructor', function() {
    Test.assertSL();
    let UIComponent = new Test.Lib.Core.UIComponent(Test.SL, {});
    it('should initialize', function() {
      expect(UIComponent).to.exist;
    });
    it('should be constructed by UIComponent', function() {
      expect(UIComponent.constructor.name).to.equal('UIComponent');
    });
  });
});
