describe('StampLines', () => {
  let canvas, SL;
  before(() => {
    // make sure the default Test.SL already exists
    Test.assertSL();

    // initialize SL with dummy canvas and empty config
    canvas = $('<canvas></canvas>');
    SL = new Test.Lib.Core.StampLines(canvas, {});
  });

  describe('Constructor', () => {
    it('should initialize', () => {
      expect(SL).to.exist;
    });;
  });

  describe('config', () => {
    it('should exist', () => {
      expect(SL.config).to.exist;
    });
  });

  describe('Paper', () => {
    it('should exist', () => {
      expect(SL.Paper).to.exist;
    });
    it('should be constructed by PaperCanvas', () => {
      expect(SL.Paper.constructor.name).to.equal('PaperCanvas');
    });
  });

  describe('UI', () => {
    it('should exist', () => {
      expect(SL.UI).to.exist;
    });
    it('should be constructed by UI', () => {
      expect(SL.UI.constructor.name).to.equal('UI');
    });
  });

  describe('Tools', () => {
    it('should exist', () => {
      expect(SL.Tools).to.exist;
    });
    it('should be constructed by ToolBelt', () => {
      expect(SL.Tools.constructor.name).to.equal('ToolBelt');
    });
    describe('Tools.Belt', () => {
      it('should exist', () => {
        expect(SL.Tools.Belt).to.exist;
      });
      it('should have core Select tool', () => {
        expect(SL.Tools.Belt.Select).to.exist;
      });
      it('should have core Scale tool', () => {
        expect(SL.Tools.Belt.Scale).to.exist;
      });
      it('should have core Rotate tool', () => {
        expect(SL.Tools.Belt.Rotate).to.exist;
      });
    });
  });

  describe('Palettes', () => {
    it('should exist', () => {
      expect(SL.Palettes).to.exist;
    });
    it('should be an object', () => {
      expect(SL.Palettes).to.be.an('object');
    });
    it('should contain Stamps', () => {
      expect(SL.Palettes.Stamps).to.exist;
    });
    it('should contain Stamps constructed by StampPalette', () => {
      expect(SL.Palettes.Stamps.constructor.name).to.equal('StampPalette');
    });
    it('should contain Lines', () => {
      expect(SL.Palettes.Lines).to.exist;
    });
    it('should contain Lines constructed by LinePalette', () => {
      expect(SL.Palettes.Lines.constructor.name).to.equal('LinePalette');
    });
  });

  describe('Utils', () => {
    it('should exist', () => {
      expect(SL.Utils).to.exist;
    });
    it('should be constructed by Utils', () => {
      expect(SL.Utils.constructor.name).to.equal('Utils');
    });
  });
});
