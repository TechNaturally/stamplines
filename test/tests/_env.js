/** Test Environment **/
const assert = chai.assert;
const expect = chai.expect;

var Test = {
  Canvas: undefined,
  Lib: StampLinesTest,
  SL: undefined,
  assertCanvas() {
    if(!this.Canvas){
      this.Canvas = $('canvas').first();
    }
    if(!this.Canvas || !this.Canvas.length){
      throw 'Could not find a canvas element to test on!';
    }
  },
  assertSL() {
    if(!this.SL){
      this.assertCanvas();
      this.SL = new StampLines(this.Canvas);
    }
  }
};
// to test dynamic loading, set expected file contents
Test.Files = {};
Test.Files['assets/StampLines.json'] = GULP_INCLUDE('./test/assets/StampLines.json');
Test.Files['assets/StampLines-2.json'] = GULP_INCLUDE('./test/assets/StampLines-2.json');
