describe('Core.UI.Component', () => {
  describe('Constructor', () => {
    let UIComponent;
    before(() => {
      Test.assertSL();
      UIComponent = new Test.Lib.Core.UIComponent(Test.SL, {});
    });
    after(() => {
      UIComponent.destroy();
      UIComponent = undefined;
    });
    it('should initialize', () => {
      expect(UIComponent).to.exist;
    });
    it('should be constructed by UIComponent', () => {
      expect(UIComponent.constructor.name).to.equal('UIComponent');
    });
  });
});
