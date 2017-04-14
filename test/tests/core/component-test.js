describe('Core.Component', function() {
  describe('Constructor', function() {
    it('should have type "Component"', function() {
      let component = new Test.Lib.Core.Component(Test.SL, {});
      expect(component.type).to.equal('Component');
    });
  });
});
