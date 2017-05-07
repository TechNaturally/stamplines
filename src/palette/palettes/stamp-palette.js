import Palette from '../../core/palette.js';
export default class StampPalette extends Palette {
  constructor(SL, config) {
    super(SL, config);
    this.id = 'Stamps';
    this.symbols = {};
    this.PaperItems = [];
  }
  get paletteType() {
    return 'Stamps';
  }
  get paletteItems() {
    if (this.config && this.config.stamps) {
      return this.config.stamps;
    }
    return super.paletteItems;
  }
  configureItem(item) {
    if (item.id) {
      let imgPath = this.getImagePath(item);
      if (imgPath.slice(-3).toLowerCase() == 'svg') {
        this.SL.Paper.project.importSVG(imgPath, (symbolItem, svg) => {
          symbolItem.remove();
          symbolItem.style.strokeScaling = false;
          this.symbols[item.id] = this.SL.Paper.generatePaperItem({Class:'template'}, paper.Symbol, symbolItem);
        });
      }
    }
  }
  destroyPaperItems() {
    super.destroyPaperItems();
    for (let id in this.symbols) {
      this.SL.Paper.destroyPaperItem(this.symbols[id]);
    }
  }
  getImagePath(item) {
    let imageName;
    if (item && item.image) {
      imageName = item.image;
    }
    if (!imageName) {
      let defaultImageName = '`${item.id}.svg`';
      if (this.config.defaultImage) {
        defaultImageName = this.config.defaultImage;
      }
      imageName = eval(defaultImageName);
    }
    if (imageName) {
      let imagePath = '';
      if (this.config.path) {
        imagePath = this.config.path + ((this.config.path.slice(-1) != '/')?'/':'');
      }
      imagePath += imageName;
      imagePath = this.SL.Utils.gets('URL').toAbsolutePath(imagePath);
      return imagePath;
    }
  }
  getStampSymbol(stamp) {
    if (stamp && stamp.id) {
      return this.symbols[stamp.id];
    }
  }
  generateDOMItem(item) {
    let itemName = (item.name || item.id);
    let stampButton = $('<a></a>');
    stampButton.addClass('sl-palette-button');
    stampButton.addClass('sl-stamp-button');
    stampButton.data('Stamp', item);
    stampButton.data('Palette', this);
    stampButton.attr('alt', itemName);
    stampButton.attr('title', itemName);
    stampButton.on('mousedown', (event) => {
      let target = $(event.currentTarget);
      let stamp = target.data('Stamp');
      let palette = target.data('Palette');
      this.SL.Tools.Belt['CreateStamp'].loadStamp(stamp, palette);
    });
    let stampContent = $('<div></div>');
    stampContent.addClass('sl-palette-content sl-palette-img');
    stampContent.addClass('sl-stamp-content sl-stamp-img');
    stampContent.attr('draggable', false);
    let imagePath = this.getImagePath(item);
    if (imagePath) {
      stampContent.append($(`<img src="${imagePath}" draggable="false" />`));
    }
    stampButton.append(stampContent);
    if (this.config.showNames) {
      stampContent = $(`<div>${itemName}</div>`);
      stampContent.addClass('sl-palette-content sl-palette-item-name');
      stampContent.addClass('sl-stamp-content sl-stamp-name');
      stampButton.append(stampContent);
    }
    return stampButton;
  }
  placeStamp(item, position) {
    let symbol = this.getStampSymbol(item).clone();
    if (symbol) {
      let stamp = this.SL.Paper.generatePaperItem({Source: this, type: 'Stamp'}, paper.SymbolItem, symbol, position);
      return stamp;
    }
  }
}
