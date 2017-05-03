describe('Utils.ConfigParser', () => {
  let Parser;
  before(() => {
    Parser = Test.Lib.Utils.ConfigParser;
  });
  describe('#parseNumber', () => {
    it('should return an object with keys: [value, percent, rounding]', () => {
      let parsed = Parser.parseNumber();
      expect(parsed).to.have.all.keys(['value', 'percent', 'rounding']);
    });
    describe('- when called with a string value', () => {
      it('should parse the number from a string using parseFloat()', () => {
        let parsed = Parser.parseNumber('10.5 abc');
        expect(parsed.value).to.equal(10.5);
      });
      it('should parse a rounding rule [+,_,~] if the value starts with one', () => {
        let parsed = Parser.parseNumber('+75');
        expect(parsed.rounding).to.equal('+');
      });
      it('should parse strings ending with % as a percentage', () => {
        let parsed = Parser.parseNumber('75%');
        expect(parsed.percent).to.be.true;
      });
      it('should parse strings ending with % as a percentage with the value normalized between 0.0 and 1.0', () => {
        let parsed = Parser.parseNumber('75%');
        expect(parsed.value).to.equal(0.75);;
      });
      it('should parse strings starting with and of [+,-,~] and ending with % to have the value normalized, rounding and percent set', () => {
        let parsed = Parser.parseNumber('+75%');
        expect(parsed.rounding).to.equal('+');
        expect(parsed.percent).to.be.true;
        expect(parsed.value).to.equal(0.75);
      });
    });
    describe('- when called with a number between 0.0 and 1.0', () => {
      let parsed;
      before(() => {
        parsed = Parser.parseNumber(0.75);
      });
      it('should parse as a percentage', () => {
        expect(parsed.percent).to.be.true;
      });
      it('should have a value equal to the number', () => {
        expect(parsed.value).to.equal(0.75);
      });
    });
    describe('- when called with a number', () => {
      let parsed;
      before(() => {
        parsed = Parser.parseNumber(42.9);
      });
      it('should have a value equal to the number', () => {
        expect(parsed.value).to.equal(42.9);
      });
      it('should not have rounding set', () => {
        expect(parsed.rounding).to.not.be.true;
      });
      it('should not parse as a percentage', () => {
        expect(parsed.percent).to.not.be.true;
      });
    });
  });
  describe('#unparseNumber', () => {
    it('should round up when called with rounding="+"', () => {
      let value = 5.3;
      let unparsed = Parser.unparseNumber(value, {rounding: '+'});
      expect(unparsed).to.equal(6);
    });
    it('should round down when called with rounding="_"', () => {
      let value = 5.7;
      let unparsed = Parser.unparseNumber(value, {rounding: '_'});
      expect(unparsed).to.equal(5);
    });
    it('should round up when called with rounding="~" and a decimal >= 0.5', () => {
      let value = 5.7;
      let unparsed = Parser.unparseNumber(value, {rounding: '~'});
      expect(unparsed).to.equal(6);
    });
    it('should round down when called with rounding="~" and a decimal < 0.5', () => {
      let value = 5.3;
      let unparsed = Parser.unparseNumber(value, {rounding: '~'});
      expect(unparsed).to.equal(5);
    });
  });
});
