import Operation from '../../core/operation.js';
export class ExportDrawing extends Operation {
  constructor(SL, config) {
    super(SL, config);
  }
  run(args) {
    console.log('EXPORTING A DRAWING :)', args);
  }
}
