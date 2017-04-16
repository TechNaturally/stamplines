/** Test Environment **/
const assert = chai.assert;
const expect = chai.expect;

var Test = {
  Lib: StampLinesTest,
  SL: undefined,
  canvas: undefined,
  assertCanvas() {
    if(!this.canvas){
      this.canvas = $('canvas').first();
    }
    if(!this.canvas || !this.canvas.length){
      throw 'Could not find a canvas element to test on!';
    }
  },
  assertSL() {
    if(!this.SL){
      this.assertCanvas();
      this.SL = new StampLines(this.canvas);
    }
  }
};
// to test dynamic loading, set expected file contents
Test.Data = {};
Test.Data['assets/StampLines.json'] = GULP_INCLUDE('./test/assets/StampLines.json');
Test.Data['assets/StampLines-2.json'] = GULP_INCLUDE('./test/assets/StampLines-2.json');
