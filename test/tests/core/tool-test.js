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
  let testName = 'Rotate';
  describe(`#start [using ${testName}]`, () => {
    let TestTool;
    before(() => {
      Test.assertSL();
      TestTool = Test.SL.Tools.Belt[testName];
    });
    afterEach(() => {
      TestTool.finish();
    });
    it(`should activate the ${testName} tool`, () => {
      TestTool.start();
      expect(TestTool.isActive()).to.be.true;
    });
  });
  describe(`#finish [using ${testName}]`, () => {
    let testName = 'Rotate';
    let TestTool;
    before(() => {
      Test.assertSL();
      TestTool = Test.SL.Tools.Belt[testName];
    });
    beforeEach(() => {
      TestTool.start();
    });
    it(`should deactivate the ${testName} tool`, () => {
      TestTool.finish();
      expect(TestTool.isActive()).to.be.false;
    });
    it('should reactivate the Select tool', () => {
      TestTool.finish();
      expect(Test.SL.Tools.Belt['Select'].isActive()).to.be.true;
    });

  });
});
