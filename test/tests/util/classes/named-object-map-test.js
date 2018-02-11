describe('Utils.Classes.NamedObjectMap', () => {
  let Utils, configEntries, configNOL;

  before(() => {
    Utils = $.extend({}, Test.Lib.Utils);
    delete Utils.Utils;
    Test.assertSL();
    configEntries = {
      'myGrid': {
        'size': 50
      }
    };
    configNOL = {
      config: configEntries,
      types: Utils,
      exclusiveIDs: true,
      '#onAdd': [
        (entry, type) => {
          entry.name = (entry.name || type);
        },
        'activate'],
      '#onRemove': 'deactivate'
    };
  });

  describe('Constructor', () => {
    let NOL;
    before(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    after(() => {
      NOL.destroy();
      NOL = undefined;
    });
    it('should initialize', () => {
      expect(NOL).to.exist;
    });
  });

  describe('#runCallback', () => {
    let NOL;
    before(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    after(() => {
      NOL.destroy();
      NOL = undefined;
    });
    describe('- when called with a string callback defined in the NamedObjectMap\'s config', () => {
      let test;
      before(() => {
        test = {
          entry: {},
          type: 'test',
          callback: '#onRemove'
        };
      });
      it('should call runCallback with the callback defined in its config, passing the entry and type as arguments', () => {
        let spy = sinon.spy(NOL, 'runCallback');
        NOL.runCallback(test.callback, test.entry, test.type);
        expect(spy.withArgs(NOL.config[test.callback], test.entry, test.type).callCount).to.equal(1);
        NOL.runCallback.restore();
      });
    });
    describe('- when called with a string callback defined on the entry', () => {
      let test;
      before(() => {
        test = {
          entry: {
            test: function(forEntry, type) {
              // do nothing
            }
          },
          type: 'test',
          callback: 'test'
        };
      });
      it('should call the callback with no args', () => {
        let spy = sinon.spy(test.entry, test.callback);
        NOL.runCallback(test.callback, test.entry, test.type);
        expect(spy.callCount).to.equal(1);
        test.entry[test.callback].restore();
      });
    });
    describe('- when called with a function callback', () => {
      let test;
      before(() => {
        test = {
          entry: {},
          type: 'test',
          callback: function(forEntry, type) {
            // do nothing
          }
        };
      });
      it('should call the callback, passing the entry and type as arguments', () => {
        let spy = sinon.spy(test, 'callback');
        NOL.runCallback(test.callback, test.entry, test.type);
        expect(spy.withArgs(test.entry, test.type).callCount).to.equal(1);
        test.callback.restore();
      });
    });
    describe('- when called with an array callback', () => {
      let test;
      before(() => {
        test = {
          entry: {},
          type: 'test',
          callbacks: [
            function(forEntry, type) {
              // do nothing
            },
            '#onRemove']
        };
      });
      it('should call runCallback for each item in the array', () => {
        let spy = sinon.spy(NOL, 'runCallback');
        NOL.runCallback(test.callbacks, test.entry, test.type);
        test.callbacks.forEach((callback) => {
          expect(spy.withArgs(callback, test.entry, test.type).callCount).to.equal(1);
        });
        NOL.runCallback.restore();
      });
    });
  });
  describe('#hasType', () => {
    let NOL;
    before(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    after(() => {
      NOL.destroy();
      NOL = undefined;
    });
    it('should return true when called with an existing entry type', () => {
      expect(NOL.hasType('Grid')).to.be.true;
    });
    it('should return false when called with an non-existant entry type', () => {
      expect(NOL.hasType('Foo')).to.be.false;
    });
  });
  describe('#hasNonStaticType', () => {
    let NOL;
    before(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    after(() => {
      NOL.destroy();
      NOL = undefined;
    });
    it('should return true when called with an existing non-static (class) entry type', () => {
      expect(NOL.hasNonStaticType('Grid')).to.be.true;
    });
    it('should return false when called with an existing static (object) entry type', () => {
      expect(NOL.hasNonStaticType('Identity')).to.be.false;
    });
    it('should return false when called with an non-existant entry type', () => {
      expect(NOL.hasNonStaticType('Foo')).to.be.false;
    });
  });
  describe('#hasStaticType', () => {
    let NOL;
    before(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    after(() => {
      NOL.destroy();
      NOL = undefined;
    });
    it('should return true when called with an existing static (object) entry type', () => {
      expect(NOL.hasStaticType('Identity')).to.be.true;
    });
    it('should return false when called with an existing non-static (dynamic) entry type', () => {
      expect(NOL.hasStaticType('Grid')).to.be.false;
    });
    it('should return false when called with an non-existant entry type', () => {
      expect(NOL.hasStaticType('Foo')).to.be.false;
    });
  });

  describe('#addEntry', () => {
    let NOL;
    beforeEach(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    afterEach(() => {
      NOL.destroy();
      NOL = undefined;
    });
    it('should add an entry to the table', () => {
      let entry = NOL.addEntry('Grid');
      expect(NOL.table).to.have.all.keys(entry.id);
    });
    describe('- given a type', () => {
      it('should enable an entry and generate a new id', () => {
        let entry = NOL.addEntry('Grid');
        expect(entry.id).to.exist;
      });
      it('should enable an entry and generate a new sequential id', () => {
        let entry1 = NOL.addEntry('Grid');
        let entry2 = NOL.addEntry('Grid');
        expect(entry2.id).to.equal(`${entry1.id}-1`);
      });
      it('should return a static entry if type is a singleton entry', () => {
        let entry1 = NOL.addEntry('URL');
        let entry2 = NOL.addEntry('URL');
        expect(entry1).to.equal(entry2);
      });
    });
    describe('- given a type and an id', () => {
      it('should enable an entry with the given id', () => {
        let entry = NOL.addEntry('Grid', 'myGrid');
        expect(entry).to.exist;
      });
      it('should enable an entry with the given id and configure it using its config for the id', () => {
        let entry = NOL.addEntry('Grid', 'myGrid');
        expect(entry.config).to.equal(configEntries['myGrid']);
      });
      it('should return an existing entry if one exists with the given id', () => {
        let entry1 = NOL.addEntry('Grid', 'myGrid');
        let entry2 = NOL.addEntry('Grid', 'myGrid');
        expect(entry1).to.equal(entry2);
      });
    });
    describe('- given a type, id, and config', () => {
      it('should enable an entry with the given id and configure it using the supplied config', () => {
        let entryConfig = {
          'size': 42
        };
        let entry = NOL.addEntry('Grid', 'myGrid', entryConfig);
        expect(entry.config).to.equal(entryConfig);
      });
    });
  });

  describe('#getEntry', () => {
    let NOL;
    before(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    after(() => {
      NOL.destroy();
      NOL = undefined;
    });
    it('should retrieve an entry from the table', () => {
      NOL.addEntry('Grid', 'myGrid');
      let entry = NOL.getEntry('myGrid');
      expect(entry).to.equal(NOL.table['myGrid']);
    });
  });

  describe('#readConfigured', () => {
    let NOL;
    before(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    after(() => {
      NOL.destroy();
      NOL = undefined;
    });
    describe('should enable configured entries', () => {
      it('should attempt to determine entry type based on id', () => {
        NOL.readConfigured({
          'Grid': {
            'size': 50
          }
        });
        expect(NOL.getEntry('Grid').constructor.name).to.equal('Grid');
      });
      it('should enable entry with an explicitly defined type', () => {
        NOL.readConfigured({
          'loader': {
            'type': 'RemoteLoader'
          }
        });
        expect(NOL.getEntry('loader').constructor.name).to.equal('RemoteLoader');
      });
      it('should replace previously enabled entries with the same id', () => {
        NOL.readConfigured({
          'Grid': {
            'size': 50
          }
        });
        let grid1 = NOL.getEntry('Grid');
        NOL.readConfigured({
          'Grid': {
            'size': 32
          }
        });
        let grid2 = NOL.getEntry('Grid');
        expect(grid2).to.not.equal(grid1);
      });
    });
  });

  describe('#removeEntry', () => {
    let NOL;
    beforeEach(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
      NOL.readConfigured({
        'Grid': {
          'size': 50
        },
        'Loader': {
          'type': 'RemoteLoader'
        }
      });
    });
    afterEach(() => {
      NOL.destroy();
      NOL = undefined;
    });
    describe('- given no id', () => {
      it('should remove all entries', () => {
        NOL.removeEntry();
        expect(NOL.table).to.be.empty;
      });
    });
    describe('- given an id of \'*\'', () => {
      it('should remove all entries', () => {
        NOL.removeEntry('*');
        expect(NOL.table).to.be.empty;
      });
    });
    describe('- given an id', () => {
      it('should remove the enty of id', () => {
        NOL.removeEntry('Grid');
        let entry = NOL.getEntry('Grid');
        expect(entry).to.not.exist;
      });
    });
  });
});
