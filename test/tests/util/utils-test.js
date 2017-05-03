describe('Utils', () => {
  describe('Constructor', () => {
    let Utils;
    before(() => {
      Utils = new Test.Lib.Utils.Utils(Test.SL, Test.SL.config.Utils);
      Utils.configure();
    });
    after(() => {
      Utils.disable();
      Utils = undefined;
    });
    it('should initialize', () => {
      expect(Utils).to.exist;
    });
    it('should be constructed by Utils', () => {
      expect(Utils.constructor.name).to.equal('Utils');
    });
  });

  describe('#configure', () => {
    let Utils;
    before(() => {
      Utils = new Test.Lib.Utils.Utils(Test.SL);
      Utils.configure();
    });
    after(() => {
      Utils.disable();
      Utils = undefined;
    });
    describe('should enable configured utilites', () => {
      it('should attempt to determine utility type based on id', () => {
        Utils.configure({
          'grid': {
            'size': 50
          }
        });
        expect(Utils.get('grid').constructor.name).to.equal('Grid');
      });
      it('should enable utility with an explicitly defined type', () => {
        Utils.configure({
          'loader': {
            'type': 'RemoteLoader'
          }
        });
        expect(Utils.get('loader').constructor.name).to.equal('RemoteLoader');
      });
      it('should replace previously enabled utilities with the same id', () => {
        Utils.configure({
          'Grid': {
            'size': 50
          }
        });
        let grid1 = Utils.get('Grid');
        Utils.configure({
          'Grid': {
            'size': 32
          }
        });
        let grid2 = Utils.get('Grid');
        expect(grid2).to.not.equal(grid1);
      });
    });
  });

  describe('#get', () => {
    let Utils;
    before(() => {
      Utils = new Test.Lib.Utils.Utils(Test.SL, {
        'Grid': {
          'size': 50
        }
      });
      Utils.configure();
    });
    after(() => {
      Utils.disable();
      Utils = undefined;
    });
    it('should return an active utility by id', () => {
      let grid = Utils.get('Grid');
      expect(grid).to.exist;
    });
  });

  describe('#gets', () => {
    let Utils;
    before(() => {
      Utils = new Test.Lib.Utils.Utils(Test.SL, {});
      Utils.configure();
    });
    after(() => {
      Utils.disable();
      Utils = undefined;
    });
    describe('- given a singleton utility type', () => {
      it('should return a static utility', () => {
        let url = Utils.gets('URL');
        expect(url).to.exist;
      });
      it('should return the same object every time', () => {
        let url1 = Utils.gets('URL');
        let url2 = Utils.gets('URL');
        expect(url1).to.equal(url2);
      });
    });
    describe('- given an instanceable utility class name', () => {
      it('should return a new utility', () => {
        let grid = Utils.gets('Grid');
        expect(grid).to.exist;
      });
      it('should return a different instance every time', () => {
        let grid1 = Utils.gets('Grid');
        let grid2 = Utils.gets('Grid');
        expect(grid1).to.not.equal(grid2);
      });
    });
  });

  describe('#enable', () => {
    let Utils, utilsConfig;
    before(() => {
      utilsConfig = {
        'myGrid': {
          'size': 42
        }
      };
    });
    beforeEach(() => {
      Utils = new Test.Lib.Utils.Utils(Test.SL, utilsConfig);
      Utils.configure();
    });
    afterEach(() => {
      Utils.disable();
      Utils = undefined;
    });
    describe('- given a type', () => {
      it('should enable a utility and generate a new id', () => {
        let util = Utils.enable('Grid');
        expect(util.id).to.exist;
      });
      it('should enable a utility and generate a new sequential id', () => {
        let util1 = Utils.enable('Grid');
        let util2 = Utils.enable('Grid');
        expect(util2.id).to.equal(`${util1.id}-1`);
      });
      it('should return a static utility if type is a singleton utility', () => {
        let utilEnabled = Utils.enable('URL');
        let utilStatic = Utils.gets('URL');
        expect(utilEnabled).to.equal(utilStatic);
      });
    });
    describe('- given a type and an id', () => {
      it('should enable a utility with the given id', () => {
        Utils.enable('Grid', 'myGrid');
        let util = Utils.get('myGrid');
        expect(util).to.exist;
      });
      it('should enable a utility with the given id and configure it using its config for the id', () => {
        let util = Utils.enable('Grid', 'myGrid');
        expect(util.config).to.equal(utilsConfig['myGrid']);
      });
      it('should return an existing utility if one exists with the given id', () => {
        let util1 = Utils.enable('Grid', 'myGrid');
        let util2 = Utils.enable('Grid', 'myGrid');
        expect(util2).to.equal(util1);
      });
    });
    describe('- given a type, id, and config', () => {
      it('should enable a utility with the given id and configure it using the supplied config', () => {
        let gridConfig = {
          'size:': 16
        };
        let util = Utils.enable('Grid', 'myGrid', gridConfig);
        expect(util.config).to.equal(gridConfig);
      });
    });
  });
  describe('#disable', () => {
    let Utils;
    beforeEach(() => {
      Utils = new Test.Lib.Utils.Utils(Test.SL, {
        'Grid': {},
        'Loader': {type: 'RemoteLoader'}
      });
      Utils.configure();
    });
    afterEach(() => {
      Utils.disable();
      Utils = undefined;
    });
    describe('- given no id', () => {
      it('should disable all utilities', () => {
        Utils.disable();
        expect(Utils.active.table).to.be.empty;
      });
    });
    describe('- given an id of \'*\'', () => {
      it('should disable all utilities', () => {
        Utils.disable();
        expect(Utils.active.table).to.be.empty;
      });
    });
    describe('- given an id', () => {
      it('should disable the utility of id', () => {
        Utils.disable('Grid');
        let util = Utils.get('Grid');
        expect(util).to.not.exist;
      });
    });
  });
});
