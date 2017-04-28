describe('Core.Component', () => {
  describe('Constructor', () => {
    it('should have type "Component"', () => {
      let component = new Test.Lib.Core.Component(Test.SL, {});
      expect(component.type).to.equal('Component');
    });
    it('should throw an error if no StampLines object provided', () => {
      expect(() => {
        let component = new Test.Lib.Core.Component();
      }).to.throw('without an SL');
    });
  });
});
