describe('StampLines', () => {
  beforeEach(() => {
    Test.assertSL();
  });

  /** Canvas element **/
  describe('canvas element', () => {
    it('should exist', () => {
      Test.assertCanvas();
      expect(Test.canvas).to.have.length.above(0);
    });
  });
  

  /** SL [Global Object] **/
  describe('SL [Global Object]', () => {
    it('should exist', () => {
      expect(Test.SL).to.exist;
    });
    it('should be constructed by StampLines', () => {
      expect(Test.SL.constructor.name).to.equal('StampLines');
    });

    /** SL.Paper [Paper.js integration] **/
    describe('SL.Paper [Paper.js integration]', () => {
      it('should exist', () => {
        expect(Test.SL.Paper).to.exist;
      });
      it('should be constructed by PaperCanvas', () => {
        expect(Test.SL.Paper.constructor.name).to.equal('PaperCanvas');
      });
    });

    /** SL.UI [user interface] **/
    describe('SL.UI [user interface]', () => {
      it('should exist', () => {
        expect(Test.SL.UI).to.exist;
      });
      it('should be constructed by UI', () => {
        expect(Test.SL.UI.constructor.name).to.equal('UI');
      });
    });

    /** SL.Tools [interaction tools] **/
    describe('SL.Tools [interaction tools]', () => {
      it('should exist', () => {
        expect(Test.SL.Tools).to.exist;
      });
      it('should be constructed by ToolBelt', () => {
        expect(Test.SL.Tools.constructor.name).to.equal('ToolBelt');
      });

      describe('SL.Tools.Belt', () => {
        it('should exist', () => {
          expect(Test.SL.Tools.Belt).to.exist;
        });
        it('should have Select tool', () => {
          expect(Test.SL.Tools.Belt.Select).to.exist;
        });
        it('should have Scale tool', () => {
          expect(Test.SL.Tools.Belt.Scale).to.exist;
        });
        it('should have Rotate tool', () => {
          expect(Test.SL.Tools.Belt.Rotate).to.exist;
        });
      });
    });

    /** SL.Palettes [content palettes] **/
    describe('SL.Palettes [content palettes]', () => {
      it('should exist', () => {
        expect(Test.SL.Palettes).to.exist;
      });
      it('should be an object', () => {
        expect(Test.SL.Palettes).to.be.an('object');
      });
      it('should contain Stamps', () => {
        expect(Test.SL.Palettes.Stamps).to.exist;
      });
      it('should contain Stamps constructed by StampPalette', () => {
        expect(Test.SL.Palettes.Stamps.constructor.name).to.equal('StampPalette');
      });
      it('should contain Lines', () => {
        expect(Test.SL.Palettes.Lines).to.exist;
      });
      it('should contain Lines constructed by LinePalette', () => {
        expect(Test.SL.Palettes.Lines.constructor.name).to.equal('LinePalette');
      });
    });

    /** SL.Utils [utilities] **/
    describe('SL.Utils [utilities]', () => {
      it('should exist', () => {
        expect(Test.SL.Utils).to.exist;
      });
      it('should be constructed by Utils', () => {
        expect(Test.SL.Utils.constructor.name).to.equal('Utils');
      });

      it('should have "grid"', () => {
        let grid = Test.SL.Utils.get('grid');
        expect(grid).to.exist;
      });
      it('should have "grid" active', () => {
        let grid = Test.SL.Utils.get('grid');
        expect(grid.isActive()).to.be.true;
      });
    });
  });
});
