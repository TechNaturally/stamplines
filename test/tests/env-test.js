describe('Test Environment', () => {
  describe('Test.Canvas', () => {
    it('should exist', () => {
      Test.assertCanvas();
      expect(Test.Canvas).to.have.length.above(0);
    });
    it('should be a DOM Node of type CANVAS', () => {
      expect(Test.Canvas[0].nodeName.toUpperCase()).to.equal('CANVAS');
    });
  });

  describe('Test.Lib', () => {
    it('should exist', () => {
      expect(Test.Lib).to.exist;
    });
  });

  describe('Test.SL', () => {
    it('should exist', () => {
      Test.assertSL();
      expect(Test.SL).to.exist;
    });
    it('should be constructed by StampLines', () => {
      expect(Test.SL.constructor.name).to.equal('StampLines');
    });
    it('should use the default configuration', () => {
      expect(Test.SL.config).to.eql(Test.Lib.Core.StampLines.DEFAULT.config);
    });
  });

  describe('Test.Files', () => {
    describe('Test.Files[\'assets/StampLines.json\']', () => {
      it('should not be empty', () => {
        expect(Test.Files['assets/StampLines.json']).to.not.be.empty;
      });
    });
    describe('Test.Files[\'assets/StampLines-2.json\']', () => {
      it('should not be empty', () => {
        expect(Test.Files['assets/StampLines-2.json']).to.not.be.empty;
      });
    });
  });
});
