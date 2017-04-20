describe('Core.Tool', () => {
  let Tool;
  before(() => {
    Test.assertSL();
  });
  beforeEach(() => {
    Tool = new Test.Lib.Core.Tool(Test.SL, {});
  });
  afterEach(() => {
    Tool = undefined;
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Tool).to.exist;
    });
    it('should be constructed by Tool', () => {
      expect(Tool.constructor.name).to.equal('Tool');
    });
    it('should start inactive', () => {
      expect(Tool.active).to.not.be.true;
    });
  });
  describe('+activationPriority', () => {
    it('should equal -1', () => {
      expect(Tool.activationPriority).to.equal(-1);
    });
  });
  describe('#activate', () => {
    it('should set active property to true', () => {
      Tool.activate();
      expect(Tool.active).to.be.true;
    });
  });
  describe('#deactivate', () => {
    beforeEach(() => {
      Tool.activate();
    });
    it('should set active property to false', () => {
      Tool.deactivate();
      expect(Tool.active).to.be.false;
    });
  });
  describe('#isActive', () => {
    describe('- when tool is active', () => {
      it('should return true', () => {
        Tool.activate();
        expect(Tool.isActive()).to.be.true;
      });
    });
    describe('- when tool is not active', () => {
      it('should return false', () => {
        expect(Tool.isActive()).to.be.false;
      });
    });
  });
});
