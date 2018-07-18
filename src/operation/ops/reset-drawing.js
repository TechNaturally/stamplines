import Operation from '../../core/operation.js';
export class ResetDrawing extends Operation {
  constructor(SL, config) {
    super(SL, config);
  }
  run(args) {
    this.SL.Paper.emit('Content.Reset');
    return true;
  }
}
