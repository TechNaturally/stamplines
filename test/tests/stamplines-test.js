describe('StampLines', function() {
  beforeEach(function() {
    Test.assertSL();
  });

  /** Canvas element **/
  describe('canvas element', function() {
    it('should exist', function() {
      Test.assertCanvas();
      expect(Test.canvas).to.have.length.above(0);
    });
  });
  

  /** SL [Global Object] **/
  describe('SL [Global Object]', function() {
    it('should exist', function() {
      expect(Test.SL).to.exist;
    });
    it('should be constructed by StampLines', function() {
      expect(Test.SL.constructor.name).to.equal('StampLines');
    });

    /** SL.Paper [Paper.js integration] **/
    describe('SL.Paper [Paper.js integration]', function() {
      it('should exist', function() {
        expect(Test.SL.Paper).to.exist;
      });
      it('should be constructed by PaperCanvas', function() {
        expect(Test.SL.Paper.constructor.name).to.equal('PaperCanvas');
      });
    });

    /** SL.UI [user interface] **/
    describe('SL.UI [user interface]', function() {
      it('should exist', function() {
        expect(Test.SL.UI).to.exist;
      });
      it('should be constructed by UI', function() {
        expect(Test.SL.UI.constructor.name).to.equal('UI');
      });
    });

    /** SL.Tools [interaction tools] **/
    describe('SL.Tools [interaction tools]', function() {
      it('should exist', function() {
        expect(Test.SL.Tools).to.exist;
      });
      it('should be constructed by ToolBelt', function() {
        expect(Test.SL.Tools.constructor.name).to.equal('ToolBelt');
      });

      describe('SL.Tools.Belt', function() {
        it('should exist', function() {
          expect(Test.SL.Tools.Belt).to.exist;
        });
        it('should have Select tool', function() {
          expect(Test.SL.Tools.Belt.Select).to.exist;
        });
        it('should have Scale tool', function() {
          expect(Test.SL.Tools.Belt.Scale).to.exist;
        });
        it('should have Rotate tool', function() {
          expect(Test.SL.Tools.Belt.Rotate).to.exist;
        });
      });
    });

    /** SL.Palettes [content palettes] **/
    describe('SL.Palettes [content palettes]', function() {
      it('should exist', function() {
        expect(Test.SL.Palettes).to.exist;
      });
      it('should be an object', function() {
        expect(Test.SL.Palettes).to.be.an('object');
      });
      it('should contain Stamps', function() {
        expect(Test.SL.Palettes.Stamps).to.exist;
      });
      it('should contain Lines', function() {
        expect(Test.SL.Palettes.Lines).to.exist;
      });
    });

    /** SL.Utils [utilities] **/
    describe('SL.Utils [utilities]', function() {
      it('should exist', function() {
        expect(Test.SL.Utils).to.exist;
      });
      it('should be constructed by Utils', function() {
        expect(Test.SL.Utils.constructor.name).to.equal('Utils');
      });

      it('should have "grid"', function() {
        let grid = Test.SL.Utils.get("grid");
        expect(grid).to.exist;
      });
      it('should have "grid" active', function() {
        let grid = Test.SL.Utils.get("grid");
        expect(grid.isActive()).to.be.true;
      });
    });
  });
});
