export default class Component {  
  constructor(SL, config={}) {
    if (!SL) {
      throw 'Cannot initialize StampLines component without an SL object!';
    }
    this.SL = SL;
    this.config = config;
  }
  destroy() {
    this.reset();
  }
  reset() {}
  get type() {
    return 'Component';
  }
  configure(config) {
    this.reset();
    this.config = config || this.config || {};
    return this.config;
  }
}
