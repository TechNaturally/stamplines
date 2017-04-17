describe('Utils.Identity', () => {
  let baseID = 'test';
  let ID = Test.Lib.Utils.Identity;
  describe('#getUnique', () => {
    it('should return "baseID" if it does not exist in the list', () => {
      let list = {
        'foo': 'bar'
      };
      expect(ID.getUnique(baseID, list)).to.equal(baseID);
    });
    it('should return a sequential ID if "baseID-1" if "baseID" exists', () => {
      let list = {
        'test': 'foo'
      };
      expect(ID.getUnique(baseID, list)).to.equal(baseID+'-1');
    });
    it('should return a sequential ID if "baseID-2" if "baseID" and "baseID-1" exist', () => {
      let list = {
        'test': 'foo',
        'test-1': 'bar'
      };
      expect(ID.getUnique(baseID, list)).to.equal(baseID+'-2');
    });
  });
});
