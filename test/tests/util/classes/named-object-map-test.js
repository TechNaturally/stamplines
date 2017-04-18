describe('Classes.NamedObjectMap', () => {
  let Utils = $.extend({}, Test.Lib.Utils);
  delete Utils.Utils;
  Test.assertSL();

  let configEntries = {
    'myGrid': {
      'size': 50
    }
  };
  let configNOL = {
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
  
  describe('Constructor', () => {
    let NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    it('should initialize', () => {
      expect(NOL).to.exist;
    });
  });

  describe('#addEntry', () => {
    let NOL;
    beforeEach(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    });
    afterEach(() => {
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
    let NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    it('should retrieve an entry from the table', () => {
      NOL.addEntry('Grid', 'myGrid');
      let entry = NOL.getEntry('myGrid');
      expect(entry).to.equal(NOL.table['myGrid']);
    });
  });

  describe('#readConfigured', () => {
    let NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
    describe('should enable configured entries', () => {
      it('should attempt to determine entry type based on id', () => {
        NOL.readConfigured({
          'grid': {
            'size': 50
          }
        });
        expect(NOL.getEntry('grid').constructor.name).to.equal('Grid');
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
          'grid': {
            'size': 50
          }
        });
        let grid1 = NOL.getEntry('grid');
        NOL.readConfigured({
          'grid': {
            'size': 32
          }
        });
        let grid2 = NOL.getEntry('grid');
        expect(grid2).to.not.equal(grid1);
      });
    });
  });

  describe('#removeEntry', () => {
    let NOL;
    beforeEach(() => {
      NOL = new Test.Lib.Utils.Classes.NamedObjectMap(Test.SL, configNOL);
      NOL.readConfigured({
        'grid': {
          'size': 50
        },
        'loader': {
          'type': 'RemoteLoader'
        }
      });
    });
    afterEach(() => {
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
        NOL.removeEntry('grid');
        let entry = NOL.getEntry('grid');
        expect(entry).to.not.exist;
      });
    });
  });
});
