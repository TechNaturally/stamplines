describe('Palette.Manager', () => {
  let canvas, SL;
  before(() => {
    canvas = $('<canvas></canvas>');
    SL = new Test.Lib.Core.StampLines(canvas);
  });
  after(() => {
    SL.destroy();
    SL = undefined;
  });
  beforeEach(() => {
    SL.resetPalettes();
  });

  describe('Constructor', () => {
    let PaletteManager;
    before(() => {
      SL.resetPalettes();
      PaletteManager = new Test.Lib.Palette.Manager(SL, SL.config.Palettes);
    });
    after(() => {
      PaletteManager.removePalette();
      PaletteManager = undefined;
    });
    it('should initialize', () => {
      expect(PaletteManager).to.exist;
    });
    it('should be constructed by PaletteManager', () => {
      expect(PaletteManager.constructor.name).to.equal('PaletteManager');
    });
  });


  describe('#configure', () => {
    let PaletteManager;
    before(() => {
      SL.resetPalettes();
      PaletteManager = new Test.Lib.Palette.Manager(SL, {
        'Stamps': {},
        'Lines': {}
      });
    });
    afterEach(() => {
      PaletteManager.removePalette();
    });

    describe('should add configured palettes', () => {
      it('should attempt to determine palette type based on id', () => {
        PaletteManager.removePalette();
        PaletteManager.configure({
          'stamps': {}
        });
        expect(PaletteManager.getPalette('stamps').constructor.name).to.equal(Test.Lib.Palette.Palette.Type['Stamps'].name);
      });
      it('should enable palette with an explicitly defined type', () => {
        PaletteManager.configure({
          'myStamps': {
            'type': 'Stamps'
          }
        });
        expect(PaletteManager.getPalette('myStamps').constructor.name).to.equal(Test.Lib.Palette.Palette.Type['Stamps'].name);
      });
      it('should replace previously enabled palettes with the same id', () => {
        PaletteManager.configure({
          'myStamps': {
            'type': 'Stamps',
            'foo': 'bar'
          }
        });
        let stamps1 = PaletteManager.getPalette('myStamps');
        PaletteManager.configure({
          'myStamps': {
            'type': 'Stamps',
            'baz': 'biz'
          }
        });
        let stamps2 = PaletteManager.getPalette('myStamps');
        expect(stamps2).to.not.equal(stamps1);
      });
    });
  });

  describe('#getPalette', () => {
    let PaletteManager;
    before(() => {
      SL.resetPalettes();
      PaletteManager = new Test.Lib.Palette.Manager(SL, {
        'Stamps': {},
        'Lines': {}
      });
    });
    after(() => {
      PaletteManager.removePalette();
      PaletteManager = undefined;
    });
    it('should return a palette by id', () => {
      let stampsPalette = PaletteManager.getPalette('Stamps');
      expect(stampsPalette).to.exist;
    });
  });
  describe('#addPalette', () => {
    let PaletteManager, palettesConfig;
    before(() => {
      palettesConfig = {
        'Stamps': {},
        'Lines': {},
        'myStamps': {
          'type': 'Stamps',
          'foo': 'bar'
        }
      };
    });
    beforeEach(() => {
      SL.resetPalettes();
      PaletteManager = new Test.Lib.Palette.Manager(SL, palettesConfig);
      PaletteManager.removePalette();
    });
    afterEach(() => {
      PaletteManager.removePalette();
    });
    describe('- given a type', () => {
      it('should add a palette and generate a new id', () => {
        let palette = PaletteManager.addPalette('Stamps');
        expect(palette.id).to.exist;
      });
      it('should add a palette and generate a new sequential id', () => {
        let palette1 = PaletteManager.addPalette('Stamps');
        let palette2 = PaletteManager.addPalette('Stamps');
        expect(palette2.id).to.equal(`${palette1.id}-1`);
      });
    });
    describe('- given a type and an id', () => {
      it('should add a palette with the given id', () => {
        PaletteManager.addPalette('Stamps', 'myStamps');
        let palette = PaletteManager.getPalette('myStamps');
        expect(palette).to.exist;
      });
      it('should add a palette with the given id and configure it using its config for the id', () => {
        let palette = PaletteManager.addPalette('Stamps', 'myStamps');
        expect(palette.config).to.equal(palettesConfig['myStamps']);
      });
      it('should add a palette and generate a new sequential id if one exists with the given id', () => {
        let palette1 = PaletteManager.addPalette('Stamps', 'myStamps');
        let palette2 = PaletteManager.addPalette('Stamps', 'myStamps');
        expect(palette2.id).to.equal(`${palette1.id}-1`);
      });
    });
    describe('- given a type, id, and config', () => {
      it('should enable a palette with the given id and configure it using the supplied config', () => {
        let paletteConfig = {
          'baz': 'biz'
        };
        PaletteManager.removePalette('myStamps');
        let palette = PaletteManager.addPalette('Stamps', 'myStamps', paletteConfig);
        expect(palette.config).to.equal(paletteConfig);
      });
    });
  });
  describe('#removePalette', () => {
    let PaletteManager, palettesConfig;
    before(() => {
      palettesConfig = {
        'Stamps': {},
        'Lines': {}
      };
    });
    beforeEach(() => {
      SL.resetPalettes();
      PaletteManager = new Test.Lib.Palette.Manager(SL, palettesConfig);
    });
    after(() => {
      PaletteManager.removePalette();
      PaletteManager = undefined;
    });
    describe('- given no id', () => {
      it('should remove all palettes', () => {
        PaletteManager.removePalette();
        expect(PaletteManager.palettes.table).to.be.empty;
      });
    });
    describe('- given an id of \'*\'', () => {
      it('should remove all palettes', () => {
        PaletteManager.removePalette('*');
        expect(PaletteManager.palettes.table).to.be.empty;
      });
    });
    describe('- given an id', () => {
      it('should remove the palettes of id', () => {
        PaletteManager.removePalette('stamps');
        let palette = PaletteManager.getPalette('stamps');
        expect(palette).to.not.exist;
      });
    });
  });
});
