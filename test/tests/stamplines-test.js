describe('StampLines', function() {
  /** Canvas element **/
  describe('canvas element', function() {
    it('should exist', function() {
      canvas = $('canvas').first();
      expect(canvas).to.have.length.above(0);
    });
  });

  /** SL [Global Object] **/
  describe('SL [Global Object]', function() {
    it('should initialize', function() {
      if (canvas && canvas.length) {
        SL = new StampLines({
          canvas: canvas,
          Util: {
            grid: {
              size: 25
            }
          }
        });
      }
    });
    it('should exist', function() {
      expect(SL).to.exist;
    });
    it('should be constructed by StampLines', function() {
      expect(SL.constructor.name).to.equal('StampLines');
    });

    /** SL.UI [user interface] **/
    describe('SL.UI [user interface]', function() {
      it('should exist', function() {
        expect(SL.UI).to.exist;
      });
      it('should be constructed by UI', function() {
        expect(SL.UI.constructor.name).to.equal('UI');
      });
    });

    /** SL.Tools [interaction tools] **/
    describe('SL.Tools [interaction tools]', function() {
      it('should exist', function() {
        expect(SL.Tools).to.exist;
      });
      it('should be constructed by ToolBelt', function() {
        expect(SL.Tools.constructor.name).to.equal('ToolBelt');
      });

      describe('SL.Tools.Belt', function() {
        it('should exist', function() {
          expect(SL.Tools.Belt).to.exist;
        });
        it('should have Select tool', function() {
          expect(SL.Tools.Belt.Select).to.exist;
        });
        it('should have Scale tool', function() {
          expect(SL.Tools.Belt.Scale).to.exist;
        });
        it('should have Rotate tool', function() {
          expect(SL.Tools.Belt.Rotate).to.exist;
        });
      });
    });

    /** SL.Palettes [content palettes] **/
    describe('SL.Palettes [content palettes]', function() {
      it('should exist', function() {
        expect(SL.Palettes).to.exist;
      });
      it('should be an object', function() {
        expect(SL.Palettes).to.be.an('object');
      });
      it('should contain Stamps', function() {
        expect(SL.Palettes.Stamps).to.exist;
      });
      it('should contain Lines', function() {
        expect(SL.Palettes.Lines).to.exist;
      });
    });

    /** SL.Utils [utilities] **/
    describe('SL.Utils [utilities]', function() {
      it('should exist', function() {
        expect(SL.Utils).to.exist;
      });
      it('should be constructed by Utils', function() {
        expect(SL.Utils.constructor.name).to.equal('Utils');
      });

      it('should have "grid"', function() {
        let grid = SL.Utils.get("grid");
        expect(grid).to.exist;
      });
      it('should have "grid" active', function() {
        let grid = SL.Utils.get("grid");
        expect(grid.isActive()).to.be.true;
      });
    });
  });
});
