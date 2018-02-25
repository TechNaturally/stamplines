import Component from './component.js';
export default class Operation extends Component {
  constructor(SL, config) {
    super(SL, config);
  }
  static canRun(args={}) {
    return true;
  }
  run(args) {
    throw `${this.constructor.name} Operation does not implement a run method!`;
  }
}
