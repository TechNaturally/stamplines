export default class Component {  
  constructor(SL, config={}) {
    if (!SL) {
      throw 'Cannot initialize StampLines component without an SL object!';
    }
    this.SL = SL;
    this.config = config;
  }
  get type() {
    return 'Component';
  }
}
