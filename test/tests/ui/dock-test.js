describe('UI.Dock', () => {
  Test.assertSL();
  let PaperCanvas = Test.SL.UI.PaperCanvas;
  let Dock = new Test.Lib.UI.Dock(Test.SL.UI, $.extend({
    paperCanvas: PaperCanvas
  }, Test.Lib.Core.StampLines.defaults.config.UI.Dock));

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(Dock).to.exist;
    });
    it('should be constructed by Dock', () => {
      expect(Dock.constructor.name).to.equal('Dock');
    });
    it('should have a paperCanvas in its config', () => {
      expect(Dock.config.paperCanvas).to.exist;
    });
  });

  describe('#assertDOM', () => {
    it('should create a DOM.dock element', () => {
      Dock.assertDOM();
      expect(Dock.UI.DOM.dock).to.exist;
    });
    it('should create a DOM.dock element with class sl-dock', () => {
      Dock.assertDOM();
      expect(Dock.UI.DOM.dock.hasClass('sl-dock')).to.be.true;
    });
    it('should not create a DOM.dock if one already exists', () => {
      Dock.assertDOM();
      let existingDOM = Dock.UI.DOM.dock;
      Dock.assertDOM();
      expect(Dock.UI.DOM.dock).to.equal(existingDOM);
    });
  });

  describe('#addPalette', () => {
    let palette, paletteID;
    beforeEach(() => {
      palette = new Test.Lib.Core.Palette(Test.SL, {});
      paletteID = 'testPalette';
    });
    afterEach(() => {
      Dock.removePalette(paletteID);
      palette = undefined;
      paletteID = undefined;
    });
    it('should track the palette by id', () => {
      paletteID = Dock.addPalette(palette, paletteID);
      expect(Dock.Palettes).to.have.property(Dock.UI.classify(paletteID));
    });
    it('should return the id of the palette', () => {
      paletteID = Dock.addPalette(palette, paletteID);
      expect(Dock.Palettes).to.have.property(paletteID);
    });
    it('should generate a new id if no id is given', () => {
      paletteID = Dock.addPalette(palette);
      expect(paletteID).to.equal(Dock.UI.classify(palette.paletteType));
    });
    it('should generate a new sequential id if no id is given', () => {
      paletteID = Dock.addPalette(palette);
      let paletteID1 = Dock.addPalette(palette);
      expect(paletteID1).to.equal(Dock.UI.classify(palette.paletteType)+'-1');
      Dock.removePalette(paletteID1);
    });
    it('should throw an error if the requested id exists', () => {
      paletteID = Dock.addPalette(palette, paletteID);
      expect(() => {
        paletteID = Dock.addPalette(palette, paletteID);
      }).to.throw(`Palette with id ${paletteID} already exists!`);
    });
    it('should create a DOM element', () => {
      paletteID = Dock.addPalette(palette, paletteID);
      expect(palette.DOM.palette).to.exist;
    });
    it('should create a DOM element with class .sl-palette.test-palette', () => {
      paletteID = Dock.addPalette(palette, paletteID);
      expect(palette.DOM.palette.is('.sl-palette.test-palette')).to.be.true;
    });
    it('should create a DOM element attached to DOM.dock', () => {
      paletteID = Dock.addPalette(palette, paletteID);
      let paletteDOM = Dock.UI.DOM.dock.children(`.sl-palette.${paletteID}`);
      expect(paletteDOM[0]).to.equal(palette.DOM.palette[0]);
    });
  });
  describe('#removePalette', () => {
    let palette, paletteID;
    beforeEach(() => {
      palette = new Test.Lib.Core.Palette(Test.SL, {});
      paletteID = Dock.addPalette(palette);
    });
    afterEach(() => {
      palette = undefined;
    });
    it('should remove the palette', () => {
      Dock.removePalette(paletteID);
      expect(Dock.Palettes).to.not.have.property(paletteID);
    });
    it('should remove the palette\'s DOM element', () => {
      Dock.removePalette(paletteID);
      expect(palette.DOM.palette).to.not.exist;
    });
  });
});
