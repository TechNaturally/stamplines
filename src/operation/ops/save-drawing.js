import Operation from '../../core/operation.js';
export class SaveDrawing extends Operation {
  constructor(SL, config) {
    super(SL, config);
  }
  run(args) {
    console.log('SAVING A DRAWING :)', args);
  }
}
