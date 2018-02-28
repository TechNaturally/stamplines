import Operation from '../../core/operation.js';
export class ExportDrawing extends Operation {
  constructor(SL, config) {
    super(SL, config);
  }
  configure(config) {
    config = super.configure(config);
    if (!config.Content) {
      config.Content = {};
    }
    if (!config.Content.types) {
      config.Content.types = ['Stamp', 'Line', 'Text'];
    }
    if (!config.format) {
      config.format = {};
    }
    if (config.format.defaultPretty == undefined) {
      config.format.defaultPretty = 0;
    }
  }
  static canRun(args={}) {
    if (args.download && (!Blob || !saveAs)) {
      return false;
    }
    return true;
  }
  getExportID(args) {
    return (new Date()).getDateTimeStamp();
  }
  downloadFile(filename, content) {
    if (Blob && saveAs) {
      let blob = new Blob([content], {type: 'text/json;charset=utf-8'});
      saveAs(blob, filename);
      return true;
    }
    return false;
  }
  canExport(type) {
    return (type && this.config.Content.types.indexOf(type) != -1);
  }
  export(args) {
    return new Promise((resolve, reject) => {
      let result = {
        id: this.getExportID(args),
        content: undefined
      };

      // collect the content items and definitions
      let contentItems = {};
      let definitions = {};
      let loaders = [];
      this.SL.Paper.Item.forEachOfClass('Content', (item) => {
        let itemType = (item && item.data && item.data.Type);
        if (itemType && this.canExport(itemType)) {
          let into = {};
          this.SL.Paper.emit('Content.Export', {into}, item);
          if (into.Content) {
            if (!contentItems[itemType]) {
              contentItems[itemType] = [];
            }
            contentItems[itemType].push(into.Content);
          }
          if (into.Definition) {
            if (!definitions[itemType]) {
              definitions[itemType] = [];
            }
            let definition = definitions[itemType].find((check) => {
              return (check.id == into.Definition.id);
            });
            if (!definition) {
              definitions[itemType].push(into.Definition);
            }
          }
          if (into.Loaders) {
            loaders.push(...into.Loaders);
          }
        }
      });

      // build the content object
      let content = {
        Content: [],
        Definitions: definitions
      };
      let contentTypes = (this.config && this.config.Content && this.config.Content.types) || Object.keys(contentItems);
      if (contentTypes) {
        for (let itemType of contentTypes) {
          if (contentItems[itemType] && Array.isArray(contentItems[itemType])) {
            content.Content.push(...contentItems[itemType]);
          }
        }
      }
      result.content = content;

      // wait for loaders to finish before resolving
      Promise.all(loaders)
        .then(() => {
          resolve(result);
        })
        .catch(() => {
          // same as .then() because Promise.finally not supported by all browsers
          resolve(result);
        });
    });
  }
  exportDownload(args) {
    return new Promise((resolve, reject) => {
      this.export(args).then((data) => {
        if (data) {
          let filename = 'StampLines'+(data.id ? `-${data.id}` : '') + '.json';
          let content = JSON.stringify(data.content, null, (args.pretty || this.config.format.defaultPretty))+'\n';
          resolve(this.downloadFile(filename, content));
        }
        else {
          reject('No data was exported.');
        }
      });
    });
  }
  run(args) {
    if (args.download) {
      return this.exportDownload(args);
    }
    return false;
  }
}
