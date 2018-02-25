import Component from '../core/component.js';
import * as Ops from './ops/_index.js';
export default class OperationManager extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.configure();
  }
  configure(config) {
    config = super.configure(config);
    if (!config.Ops) {
      config.Ops = {};
    }
  }
  canRun(operation, args={}) {
    return (Ops[operation] && Ops[operation].canRun(args) && (!this.config.Ops[operation] || !this.config.Ops[operation].disabled));
  }
  run(operation, args={}) {
    if (this.canRun(operation, args)) {
      return new Promise((resolve, reject) => {
        let opConfig = this.config.Ops[operation] || {};
        let op = new Ops[operation](this.SL, opConfig);
        if (op) {
          let ran = op.run(args);
          if (ran.constructor.name == 'Promise') {
            ran.then(result => {
              resolve(result);
            })
            .catch(error => {
              reject(error);
            });
          }
          else {
            resolve(ran);
          }
        }
      });
    }
    else {
      throw `Operation "${operation}" not found!`;
    }
  }
}
