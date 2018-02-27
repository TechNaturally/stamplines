import Operation from '../../core/operation.js';
export class ImportDrawing extends Operation {
  constructor(SL, config) {
    super(SL, config);
    this.configure(config);
  }
  static canRun(args={}) {
    if (args && args.file && !window.FileReader) {
      return false;
    }
    return true;
  }

  getCachedDef(item, container) {
    if (item && item.id && item.Type && container === Object(container)) {
      if (container[item.Type] === Object(container[item.Type]) && container[item.Type][item.id]) {
        return container[item.Type][item.id];
      }
      else if (Array.isArray(container[item.Type])) {
        return container[item.Type].find((check) => {
          return (check && check.id ==item.id);
        });
      }
    }
  }
  getCachedSymbol(svg_def) {
    if (svg_def) {
      let symbolItem = this.SL.Paper.project.importSVG(svg_def);
      symbolItem.remove();
      symbolItem.style.strokeScaling = false;
      return this.SL.Paper.generatePaperItem({Class:'template'}, paper.Symbol, symbolItem);
    }
  }
  import(input) {
    if (input === Object(input)) {
      let definitions = input.Definitions;
      if (Array.isArray(input.Content)) {
        let def_cache = {};
        for (let item of input.Content) {
          let cached_def = this.getCachedDef(item, def_cache);
          if (!cached_def) {
            cached_def = this.getCachedDef(item, definitions);
            if (cached_def && item.Type) {
              if (!def_cache[item.Type]) {
                def_cache[item.Type] = {};
              }
              def_cache[item.Type][item.id] = cached_def;
            }
          }
          if (cached_def && cached_def.symbol_def && !cached_def.symbol) {
            let cached_symbol = this.getCachedSymbol(cached_def.symbol_def);
            if (cached_symbol) {
              cached_def.symbol = cached_symbol;
            }
          }
          let args = {};
          if (cached_def && item.Type) {
            args[item.Type] = cached_def;
          }
          this.SL.Paper.emit('Content.Import', args, {data: item});
        }
        return true;
      }
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
