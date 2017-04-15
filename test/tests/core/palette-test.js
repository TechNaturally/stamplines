describe('Core.Palette', () => {
  Test.assertSL();
  describe('Constructor', () => {
    let Palette = new Test.Lib.Core.Palette(Test.SL, $.extend({}, Test.Lib.Core.StampLines.DEFAULT.config.Palettes));
    it('should initialize', () => {
      expect(Palette).to.exist;
    });
    it('should be constructed by Palette', () => {
      expect(Palette.constructor.name).to.equal('Palette');
    });
  });

  describe('#generateDOM', () => {
    let palette = new Test.Lib.Core.Palette(Test.SL, {});
    afterEach(() => {
      palette.destroyDOM();
    });
    it('should return a DOM element', () => {
      let paletteDOM = palette.generateDOM();
      expect(paletteDOM).to.exist;
    });
    it('should return a DOM element of class .sl-palette', () => {
      let paletteDOM = palette.generateDOM();
      expect(paletteDOM.is('.sl-palette')).to.be.true;
    });
    it('should track the palette element in palette.DOM', () => {
      let paletteDOM = palette.generateDOM();
      expect(palette.DOM.palette).to.exist;
    });
  });
  describe('#destroyDOM', () => {
    let palette = new Test.Lib.Core.Palette(Test.SL, {});
    beforeEach(() => {
      palette.generateDOM();
    });
    it('should remove the DOM element from its parent', () => {
      let paletteDOM = palette.DOM.palette;
      let createdDOM = Test.SL.UI.Dock.assertDOM();
      // give it a parent to check unbdinding from
      Test.SL.DOM.dock.append(paletteDOM);
      palette.destroyDOM();
      expect(paletteDOM.parent()).to.have.length(0);
      paletteDOM = undefined;
      if (createdDOM) {
        // remove the Dock DOM if this test created it
        Test.SL.UI.Dock.destroyDOM();
      }
    });
    it('should remove the palette element from palette.DOM', () => {
      palette.destroyDOM();
      expect(palette.DOM.palette).to.not.exist;
    });
  });
});
