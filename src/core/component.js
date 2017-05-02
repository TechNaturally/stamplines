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
  reset() {
    this.destroyPaperItems();
  }
  get type() {
    return 'Component';
  }
  configure(config) {
    this.reset();
    this.config = config || this.config || {};
    return this.config;
  }
  trackPaperItem(item) {
    if (!this.PaperItems) {
      this.PaperItems = [];
    }
    if (item && this.PaperItems && this.PaperItems.constructor === Array && this.PaperItems.indexOf(item) == -1) {
      this.PaperItems.push(item);
    }
  }
  untrackPaperItem(item) {
    if (item && this.PaperItems && this.PaperItems.constructor === Array && !this.PaperItems.destroying) {
      let itemIdx = this.PaperItems.indexOf(item);
      if (itemIdx != -1) {
        this.PaperItems.splice(itemIdx, 1);
      }
    }
  }
  destroyPaperItems() {
    if (this.PaperItems && this.PaperItems.constructor === Array) {
      this.PaperItems.destroying = true;
      this.PaperItems.forEach((item) => {
        this.SL.Paper.destroyPaperItem(item);
      });
      this.PaperItems.destroying = undefined;
      delete this.PaperItems.destroying;
      this.PaperItems.length = 0;
    }
  }
}
