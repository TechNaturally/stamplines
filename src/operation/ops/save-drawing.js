import Operation from '../../core/operation.js';
export class SaveDrawing extends Operation {
  constructor(SL, config) {
    super(SL, config);
    this.configure(config);
  }
  configure(config) {
    config = super.configure(config);
    if (!config.Content) {
      config.Content = {};
    }
    if (!config.Content.class) {
      config.Content.class = ['BG', 'Content', 'ContentAddon'];
    }
  }
  static canRun(args={}) {
    if (args.download && (!Blob || !saveAs)) {
      return false;
    }
    return true;
  }
  getSaveID(args) {
    return (new Date()).getDateTimeStamp();
  }
  downloadFile(filename, blob) {
    if (blob && saveAs) {
      saveAs(blob, filename);
      return true;
    }
    return false;
  }
  save(args) {
    return new Promise((resolve, reject) => {
      let result = {
        id: this.getSaveID(args),
        blob: undefined,
        type: undefined
      };
      let saving = false;
      try {
        if (this.SL && this.SL.canvas && this.SL.canvas.length && this.SL.canvas[0]) {
          let eventArgs = {
            hidden: [],
            exclude: $.extend({}, (args.Content || this.config.Content))
          };
          let Select = this.SL.Tools.Belt.Select;
          if (Select) {
            Select.Unselect();
          }
          this.SL.Paper.emit('Content.Hide', eventArgs);
          saving = true;
          setTimeout(() => {
            this.SL.canvas[0].toBlob((blob) => {
              result.blob = blob;
              result.type = 'png';
              this.SL.Paper.emit('Content.Unhide', eventArgs);
              resolve(result);
            }, 'image/png');
          }, 50);
        }
      }
      catch (error) {
        reject(error);
      }
      if (!saving) {
        resolve(result);
      }
    });
  }
  saveDownload(args) {
    return new Promise((resolve, reject) => {
      this.save(args).then((data) => {
        if (data) {
          let filename = 'StampLines'+(data.id ? `-${data.id}` : '') + (data.type ? `.${data.type}` : '');
          let content = data.blob || null;
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
      return this.saveDownload(args);
    }
    return false;
  }
}
