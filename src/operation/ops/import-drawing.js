import Operation from '../../core/operation.js';
export class ImportDrawing extends Operation {
  constructor(SL, config) {
    super(SL, config);
  }
  static canRun(args={}) {
    if (args && args.file && !window.FileReader) {
      return false;
    }
    return true;
  }
  import(input) {
    if (input === Object(input) && Array.isArray(input.Content)) {
      for (let item of input.Content) {
        this.SL.Paper.emit('Content.Import', {}, {data: item});
      }
      return true;
    }
  }
  importFile(file) {
    return new Promise((resolve, reject) => {
      let fileReader = new window.FileReader();
      fileReader.onload = (fileRead) => {
        if (fileRead.target) {
          try {
            let input = JSON.parse(fileRead.target.result);
            if (this.import(input)) {
              resolve(true);
            }
            else {
              reject(false);
            }
          }
          catch (error) {
            alert(`Error parsing file: ${error}`);
            reject(false);
          }
        }
      };
      fileReader.readAsText(file);
    });
  }
  run(args) {
    if (args) {
      if (args.input) {
        return this.import(args.input);
      }
      else if (args.file) {
        return this.importFile(args.file);
      }
    }
    return false;
  }
}
