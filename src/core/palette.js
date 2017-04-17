import Component from './component.js';
export default class Palette extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.DOM = {};
    this.configure();
  }
  get type() {
    return 'Palette';
  }
  get paletteType() {
    return this.type;
  }

  configure(config) {
    config = super.configure(config);
    // @TODO: implment: Palette::configure(config)
    // - destroy any existing items
    // - load items from config
    // - regenerateDOM
    return this.config;
  }

  generateDOM() {
    if (!this.DOM.palette) {
      this.DOM.palette = $('<div></div>');
      this.DOM.palette.addClass('sl-palette');
    }
    return this.DOM.palette;
  }
  destroyDOM() {
    if (this.DOM.palette) {
      this.DOM.palette.remove();
      this.DOM.palette = undefined;
    }
  }
}
