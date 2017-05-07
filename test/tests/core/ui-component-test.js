describe('Core.UI.Component', () => {
  let UIComponent;
  before(() => {
    Test.assertSL();
    UIComponent = new Test.Lib.Core.UIComponent(Test.SL, {});
  });
  after(() => {
    UIComponent.destroy();
    UIComponent = undefined;
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(UIComponent).to.exist;
    });
    it('should be constructed by UIComponent', () => {
      expect(UIComponent.constructor.name).to.equal('UIComponent');
    });
  });
  describe('#delegateEvent', () => {
    let testEvent = 'onMouseMove';
    it(`should call the ${testEvent} event handler on UIComponent.SL.Tools`, () => {
      let SL = UIComponent.SL;
      let spy = sinon.spy(SL.Tools, testEvent);
      UIComponent.delegateEvent(testEvent, {});
      expect(spy.callCount).to.equal(1);
      SL.Tools[testEvent].restore();
    });
  });
});
