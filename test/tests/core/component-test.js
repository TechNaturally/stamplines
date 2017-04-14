describe('Core.Component', () => {
  describe('Constructor', () => {
    it('should have type "Component"', () => {
      let component = new Test.Lib.Core.Component(Test.SL, {});
      expect(component.type).to.equal('Component');
    });
  });
});
