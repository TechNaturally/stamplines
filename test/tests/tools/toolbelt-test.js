describe('Tools.ToolBelt', () => {
  let ToolBelt;
  let toolsConfig = {
    enable: Test.Lib.Core.StampLines.DEFAULT.coreTools
  };
  let expectedDefaultTool = 'Select';
  before(() => {
    Test.assertSL();
    ToolBelt = new Test.Lib.Tools.ToolBelt();
    ToolBelt.init(Test.SL, toolsConfig);
  });
  describe('Constructor', () => {
    it('should initialize', () => {
      expect(ToolBelt).to.exist;
    });
    it('should be constructed by ToolBelt', () => {
      expect(ToolBelt.constructor.name).to.equal('ToolBelt');
    });
    it('should have className of Tool (paper.js inheritence)', () => {
      expect(ToolBelt.className).to.equal('Tool');
    });
  });
  describe('#init', () => {
    it('should set the SL property of type StampLines', () => {
      expect(ToolBelt.SL.constructor.name).to.equal('StampLines');
    });
    it('should enable tools: ['+toolsConfig.enable.join(', ')+']', () => {
      expect(ToolBelt.Belt).to.have.all.keys(toolsConfig.enable);
    });
    it(`should have ${expectedDefaultTool} tool active`, () => {
      expect(ToolBelt.ActiveTool).to.equal(ToolBelt.Belt[expectedDefaultTool]);
    });
  });

  describe('#activateTool', () => {
    afterEach(() => {
      ToolBelt.deactivateTool();
    });
    it('should set the given tool to active', () => {
      ToolBelt.activateTool('Rotate');
      expect(ToolBelt.Belt['Rotate'].isActive()).to.be.true;
    });
    it('should deactivate the previously active tool', () => {
      ToolBelt.activateTool('Rotate');
      ToolBelt.activateTool('Scale');
      expect(ToolBelt.Belt['Rotate'].isActive()).to.be.false;
    });
  });
  describe('#deactivateTool', () => {
    it('should set the currently active tool to inactive', () => {
      ToolBelt.activateTool('Rotate');
      ToolBelt.deactivateTool();
      expect(ToolBelt.Belt['Rotate'].isActive()).to.be.false;
    });
    describe('- when called with no arguments (or checkForActive == true)', () => {
      it(`should revert active tool to ${expectedDefaultTool}`, () => {
        ToolBelt.activateTool('Rotate');
        ToolBelt.deactivateTool();
        expect(ToolBelt.ActiveTool).to.equal(ToolBelt.Belt[expectedDefaultTool]);
      });
    });
    describe('- when called with checkForActive == false', () => {
      it('should have no ActiveTool', () => {
        ToolBelt.activateTool('Rotate');
        ToolBelt.deactivateTool(false);
        expect(ToolBelt.ActiveTool).to.not.exist;
      });
    });
  });
  describe('#checkActiveTool', () => {
    it('should activate the tool with currently highest activation priority', () => {
      ToolBelt.checkActiveTool();
      expect(ToolBelt.ActiveTool).to.equal(ToolBelt.Belt[expectedDefaultTool]);
    });
  });

  function spyOnTools(method) {
    let spies = {};
    for (type in ToolBelt.Belt) {
      let tool = ToolBelt.Belt[type];
      if (typeof tool[method] == 'function') {
        let spy = sinon.spy(tool, method);
        spies[type] = spy;
      }
    }
    return spies;
  }
  function checkSpies(spies, checker, args) {
    for (type in spies) {
      let spy = spies[type];
      try {
        checker(spy, ToolBelt.Belt[type], args);
      }
      catch (error) {
        // Give the error message context by prepending failed Tool type
        error.message = `${type}: ${error.message}\n`;
        error.stack = error.stack.split('\n').slice(1).join('\n');
        throw error;
      }
    }
  }
  function removeSpies(method) {
    for (type in ToolBelt.Belt) {
      let tool = ToolBelt.Belt[type];
      if (tool[method] && typeof tool[method].restore == 'function') {
        tool[method].restore();
      }
    }
  }

  describe('#refreshUI', () => {
    let testMethod = 'refreshUI';
    afterEach(() => {
      // cleanup the spies
      removeSpies(testMethod);
    });
    it('should run refreshUI on each Tool', () => {
      // setup the spies
      let spies = spyOnTools(testMethod);

      // make the call
      ToolBelt.refreshUI();

      // check the spies
      checkSpies(spies, (spy) => {
        expect(spy.callCount).to.equal(1);
      });
    });
  });

  describe('#runTools', () => {
    let testMethod = 'refreshUI';
    function testRunTools(method, on) {
      // setup the spies
      let spies = spyOnTools(method);
      
      // make the call
      ToolBelt.runTools(method, undefined, on);

      // check the spies
      checkSpies(spies, (spy, tool, args) => {
        let callCount = 1;
        let checkType = args.on;
        if (checkType===Test.Lib.Tools.ToolBelt.RUN_ON.ACTIVE) {
          callCount = (tool.active ? 1 : 0);
        }
        else if (checkType===Test.Lib.Tools.ToolBelt.RUN_ON.INACTIVE) {
          callCount = (tool.active ? 0 : 1);
        }
        expect(spy.callCount).to.equal(callCount);
      }, {on: on});
    }
    afterEach(() => {
      // cleanup the spies
      removeSpies(testMethod);
    });

    describe('- given ToolBelt.RUN_ON.ACTIVE', () => {
      it('should only run the method on the active tool', () => {
        testRunTools(testMethod, Test.Lib.Tools.ToolBelt.RUN_ON.ACTIVE);
      });
    });
    describe('- given ToolBelt.RUN_ON.INACTIVE', () => {
      it('should only run the method on inactive tools', () => {
        testRunTools(testMethod, Test.Lib.Tools.ToolBelt.RUN_ON.INACTIVE);
      });
    });
    describe('- given ToolBelt.RUN_ON.ALL', () => {
      it('should run the method on active and inactive tools', () => {
        testRunTools(testMethod, Test.Lib.Tools.ToolBelt.RUN_ON.ALL);
      });
    });
  });
});
