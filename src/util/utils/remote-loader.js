import Util from '../../core/util.js';
export class RemoteLoader extends Util {
  constructor(SL, config) {
    super(SL, config);
    this.name = 'RemoteLoader';
  }
  load(path) {
    path = path || this.config.path;
    path = this.SL.Utils.gets('URL').toURL(path);
    return new Promise((resolve, reject) => {
      $.ajax( path )
        .done((data) => {
          data = data || {};
          resolve(data);
        });
    });
  }
};
