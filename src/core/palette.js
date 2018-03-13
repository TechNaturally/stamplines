import Component from './component.js';
export default class Palette extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.DOM = {};
    this.configure();
  }
  reset() {
    super.reset();
    this.resetPreviewItems();
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

  configureItem(item) {
    // sub-classes should implement this
  }
  generateDOMItem(item) {
    // sub-classes should implement this
  }
  getPreviewID(item, config={}) {
    if (this.PreviewItems && typeof this.generatePreviewID == 'function') {
      let previewID = this.generatePreviewID(item, config);
      if (config && config.Source && config.Source.id) {
        previewID += '-'+config.Source.id;
      }
      if (config && (typeof config.width != 'undefined' || typeof config.height != 'undefined')) {
        previewID += '-';
        previewID += (typeof config.width != 'undefined' ? config.width : '_');
        previewID += 'x';
        previewID += (typeof config.height != 'undefined' ? config.height : '_');
      }
      return previewID;
    }
  }
  getPreviewItem(item, config={}) {
    if (this.PreviewItems && typeof this.generatePreviewID == 'function' && typeof this.generatePreviewItem == 'function') {
      let previewID = this.getPreviewID(item, config);
      if (previewID) {
        if (!this.PreviewItems[previewID]) {
          let previewItem = this.generatePreviewItem(item, config);
          if (previewItem) {
            this.PreviewItems[previewID] = previewItem;
            if (previewItem.data) {
              previewItem.data.ID = previewID;
            }
          }
        }
        return this.PreviewItems[previewID];
      }
    }
  }
  resetPreviewItems() {
    if (this.PreviewItems) {
      let previewIDs = Object.keys(this.PreviewItems);
      for (let previewID of previewIDs) {
        if (this.PreviewItems[previewID]) {
          this.PreviewItems[previewID].remove();
          this.PreviewItems[previewID] = undefined;
          delete this.PreviewItems[previewID];
        }
      }
    }
  }

  configure(config) {
    config = super.configure(config);
    if (this.DOM.palette) {
      this.generateDOM();
    }
    this.configureItems(this.paletteItems);
    return this.config;
  }
  configureItems(items) {
    items.forEach((item) => {
      this.configureItem(item);
    });
  }

  destroyDOM() {
    this.emptyDOM();
    if (this.DOM.palette) {
      this.DOM.palette.remove();
      this.DOM.palette = undefined;
    }
  }
  emptyDOM() {
    let persist = ['palette'];
    for (let entry in this.DOM) {
      if (persist.indexOf(entry) != -1) {
        continue;
      }
      this.DOM[entry] = undefined;
    }
    // all DOM elements should be children of DOM.palette
    // DOM.palette.empty() should remove everything
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
    this.DOM.itemsList.empty();
    this.DOM.items = {};

    // the list items
    items.forEach((item) => {
      this.generateDOMListItem(item);
    });
  }
  generateDOMListItem(item) {
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
  }
}
