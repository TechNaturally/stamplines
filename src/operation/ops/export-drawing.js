import Operation from '../../core/operation.js';
export class ExportDrawing extends Operation {
  constructor(SL, config) {
    super(SL, config);
    this.configure(config);
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
    if (config.format.roundTo == undefined) {
      config.format.roundTo = 5;
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
  contentToJSON(content, args) {
    return JSON.stringify(content, null, (typeof args.pretty != 'undefined' ? args.pretty : this.config.format.defaultPretty));
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
          let args = {
            roundTo: this.config.format.roundTo,
            into
          };
          this.SL.Paper.emit('Content.Export', args, item);
          if (into.Content) {
            if (!contentItems[itemType]) {
              contentItems[itemType] = [];
            }
            into.Content.index = ((item.index || item.index === 0) ? item.index : -1);
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
      let configs = {};
      this.SL.Paper.emit('Config.Export', {into: configs}, configs);

      // build the content object
      let content = {
        Content: [],
        Definitions: definitions,
        Config: configs
      };
      let contentTypes = (this.config && this.config.Content && this.config.Content.types) || Object.keys(contentItems);
      if (contentTypes) {
        for (let itemType of contentTypes) {
          if (contentItems[itemType] && Array.isArray(contentItems[itemType])) {
            content.Content.push(...contentItems[itemType]);
          }
        }
      }
      content.Content.sort((item1, item2) => {
        let index1 = ((item1.index || item1.index === 0) ? item1.index : -1);
        let index2 = ((item2.index || item2.index === 0) ? item2.index : -1);
        return (index1 - index2);
      });
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
          let content = this.contentToJSON(data.content, args) + '\n';
          resolve(this.downloadFile(filename, content));
        }
        else {
          reject('No data was exported.');
        }
      });
    });
  }
  exportJSON(args) {
    return new Promise((resolve, reject) => {
      this.export(args).then((data) => {
        if (data) {
          resolve({
            id: data.id,
            json: this.contentToJSON(data.content, args)
          });
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
    if (args.json) {
      return this.exportJSON(args);
    }
    return this.export(args);
  }
}
