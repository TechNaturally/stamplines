import Component from './component.js';
export default class Palette extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.DOM = {};
    this.configure();
  }
  destroy() {
    this.destroyDOM();
  }
  get type() {
    return 'Palette';
  }
  get paletteType() {
    return this.type;
  }
  get paletteItems() {
    if (this.config && this.config.items) {
      return this.config.items;
    }
    return [];
  }

  configure(config) {
    config = super.configure(config);
    if (this.DOM.palette) {
      this.generateDOM();
    }
    return this.config;
  }

  emptyDOM() {
    let persist = ['palette'];
    for (let entry in this.DOM) {
      if (persist.indexOf(entry) != -1) {
        continue;
      }
      this.DOM[entry] = undefined;
    }
    if (this.DOM.palette) {
      this.DOM.palette.empty();
    }
  }
  generateDOM() {
    if (!this.DOM.palette) {
      this.DOM.palette = $('<div></div>');
      this.DOM.palette.addClass('sl-palette');
      this.DOM.palette.addClass('sl-palette-'+this.SL.UI.classify(this.paletteType));
    }
    this.emptyDOM();
    this.generateDOMItemsList();
    return this.DOM.palette;
  }
  destroyDOM() {
    if (this.DOM.palette) {
      this.DOM.palette.remove();
      this.DOM.palette = undefined;
    }
  }
  generateDOMItemsList() {
    let items = this.paletteItems;
    if (!items) {
      return;
    }

    // the list container
    if (!this.DOM.itemsList) {
      this.DOM.itemsList = $('<ul></ul>');
      this.DOM.itemsList.addClass('sl-palette-items');
      this.DOM.itemsList.addClass('sl-palette-items-'+this.SL.UI.classify(this.paletteType));
      this.DOM.palette.append(this.DOM.itemsList);
    }

    // the list items
    this.DOM.items = {};
    items.forEach((item) => {
      let itemDOM = this.generateDOMItem(item);
      if (itemDOM) {
        let listItemDOM = $('<li></li>');
        listItemDOM.addClass('sl-palette-item');
        listItemDOM.addClass('sl-palette-item-'+this.SL.UI.classify(this.paletteType));
        listItemDOM.addClass('sl-palette-item-'+this.SL.UI.classify(this.paletteType)+'-'+item.id);

        listItemDOM.append(itemDOM);

        this.DOM.itemsList.append(listItemDOM);
        this.DOM.items[item.id] = listItemDOM;
        return this.DOM.items[item.id];
      }
    });
  }
  generateDOMItem(item) {
    // sub-classes should implement this
  }
}
