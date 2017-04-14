describe('Core.UI.Component', () => {
  describe('Constructor', () => {
    Test.assertSL();
    let UIComponent = new Test.Lib.Core.UIComponent(Test.SL, {});
    it('should initialize', () => {
      expect(UIComponent).to.exist;
    });
    it('should be constructed by UIComponent', () => {
      expect(UIComponent.constructor.name).to.equal('UIComponent');
    });
  });
});
