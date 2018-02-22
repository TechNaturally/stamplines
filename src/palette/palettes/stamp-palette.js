import Palette from '../../core/palette.js';
export default class StampPalette extends Palette {
  constructor(SL, config) {
    super(SL, config);
    this.id = 'Stamps';
    this.symbols = {};
    this.PaperItems = [];
    this.initialized = true;
    this.configure();
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
  configure(config) {
    config = super.configure(config);
    this.initEventHandlers();
    this.registerSnappers();
    return config;
  }
  reset() {
    if (!this.initialized) {
      return;
    }
    super.reset();
    this.unregisterSnappers();
    this.resetEventHandlers();
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
  getPreviewItem(item, config={}) {
    if (item && item.data && item.data.Stamp) {
      let symbol = this.getStampSymbol(item.data.Stamp);
      if (symbol) {
        symbol = symbol.clone({insert:false});
        let preview = this.SL.Paper.generatePaperItem({Source: (config.Source || this), Type: 'StampPreview', Stamp: item, Class: 'ContentAddon', Layer: 'GROUPED'}, paper.SymbolItem, symbol);
        preview.remove();
        if (config) {
          if (config.width && preview.bounds.width > config.width) {
            preview.scale(config.width / preview.bounds.width);
          }
          if (config.height && preview.bounds.height > config.height) {
            preview.scale(config.height / preview.bounds.height);
          }
        }
        return preview;
      }
    }
  }
  placeStamp(item, position) {
    let symbol = this.getStampSymbol(item).clone();
    if (symbol) {
      let stamp = this.SL.Paper.generatePaperItem({Source: this, Type: 'Stamp', Stamp: item}, paper.SymbolItem, symbol, position);
      this.SL.Paper.Item.addCustomMethod(stamp, 'refresh', this.refreshItem, this);
      return stamp;
    }
  }
  refreshItem(item, args) {
    if (item && item.data && item.data.label) {
      this.assertItemLabel(item);
      this.refreshItemLabel(item);
    }
    else if (item.data.paperLabel) {
      this.removeItemLabel(item);
    }
  }

  // @TODO: item label stuff can be removed in favour of the LabelConnector tool
  assertItemLabel(item) {
    if (item && item.data && !item.data.paperLabel) {
      let labelData = {
        Source: this,
        Type: 'StampLabel',
        Class: 'ContentAddon',
        Layer: ((item.data && item.data.Layer) ? item.data.Layer : 'CONTENT'),
        ParentItem: item,
        position: {x: 0, y: 0} // @TODO: is labelData.position needed?
      };
      // @TODO: configure Stamp.Label (position, font)
      item.data.paperLabel = this.SL.Paper.generatePaperItem(labelData, paper.PointText, item.bounds.center);
      item.data.paperLabel.fillColor = '#000000';
      item.data.paperLabel.fontSize = '12pt';
      this.SL.Paper.Item.addChild(item, item.data.paperLabel);
    }
  }
  refreshItemLabel(item) {
    if (item && item.data && item.data.paperLabel) {
      item.data.paperLabel.content = item.data.label;
      item.data.paperLabel.insertAbove(item);
      let Geo = this.SL.Utils.get('Geo');
      if (Geo && item.data.paperLabel.data && item.data.paperLabel.data.position) {
        let rotation = item.rotation;
        let rotationPoint = item.bounds.center;
        if (rotation) {
          item.rotate(-rotation, rotationPoint);
        }
        let point = Geo.Normalize.pointFromRectangle(item.data.paperLabel.data.position, item.bounds);
        if (rotation) {
          item.rotate(rotation, rotationPoint);
          point = point.rotate(rotation, rotationPoint);
        }
        item.data.paperLabel.position.set(point);
      }
    }
  }
  removeItemLabel(item) {
    if (item && item.data && item.data.paperLabel) {
      this.SL.Paper.Item.removeChild(item, item.data.paperLabel);
      this.SL.Paper.destroyPaperItem(item.data.paperLabel);
      item.data.paperLabel = undefined;
      delete item.data.paperLabel;
    }
  }

  stampSelected(stamp) {
    if (stamp && stamp.data && stamp.data.Type == 'Stamp') {
      if (stamp.data.paperLabel) {
        stamp.data.paperLabel.insertAbove(stamp);
      }
    }
  }
  stampUnselected(stamp) {
    if (stamp && stamp.data && stamp.data.Type == 'Stamp') {
      if (stamp.data.paperLabel) {
        stamp.data.paperLabel.insertAbove(stamp);
      }
    }
  }
  snapItem(item, config={}) {
    if (item && item.data && item.data.Type == 'Stamp') {
      this.SL.Paper.Item.callCustomMethod(item, 'refresh');
    }
    return item;
  }

  initEventHandlers() {
    if (!this.initialized) {
      return;
    }
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    let StampFilter = {Type: 'Stamp'};
    if (!this.eventHandlers.ItemSelected) {
      this.eventHandlers.ItemSelected = this.SL.Paper.on('SelectionItemSelected', StampFilter, (args, stamp) => {
        if (!stamp && args && args.item && this.SL.Paper.Item.passesFilter(args.item, StampFilter)) {
          stamp = args.item;
        }
        if (stamp && this.SL.Paper.Item.passesFilter(stamp, StampFilter)) {
          this.stampSelected(stamp);
        }
      }, 'Stamp.Selected');
    }
    if (!this.eventHandlers.ItemUnselected) {
      this.eventHandlers.ItemUnselected = this.SL.Paper.on('SelectionItemUnselected', StampFilter, (args, stamp) => {
        if (args.items) {
          args.items.forEach((stamp) => {
            if (stamp && this.SL.Paper.Item.passesFilter(stamp, StampFilter)) {
              this.stampUnselected(stamp);
            }
          });
        }
        else if (stamp && this.SL.Paper.Item.passesFilter(stamp, StampFilter)) {
          this.stampUnselected(stamp);
        }
      }, 'Stamp.Unselected');
    }
    if (!this.eventHandlers.ItemDestroyed) {
      this.eventHandlers.ItemDestroyed = this.SL.Paper.on('Destroy', StampFilter, (args, stamp) => {
        this.removeItemLabel(stamp);
      }, 'Stamp.Destroyed');
    }
  }
  resetEventHandlers() {
    if (!this.initialized || !this.eventHandlers) {
      return;
    }
    if (this.eventHandlers.ItemSelected) {
      this.SL.Paper.off('SelectionItemSelected', this.eventHandlers.ItemSelected.id);
      delete this.eventHandlers.ItemSelected;
      this.eventHandlers.ItemSelected = undefined;
    }
    if (this.eventHandlers.ItemUnselected) {
      this.SL.Paper.off('SelectionItemUnselected', this.eventHandlers.ItemUnselected.id);
      delete this.eventHandlers.ItemUnselected;
      this.eventHandlers.ItemUnselected = undefined;
    }
    if (this.eventHandlers.ItemDestroyed) {
      this.SL.Paper.off('Destroy', this.eventHandlers.ItemDestroyed.id);
      delete this.eventHandlers.ItemDestroyed;
      this.eventHandlers.ItemDestroyed = undefined;
    }
  }
  registerSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      if (!this.Snappers) {
        this.Snappers = {};
      }
      this.Snappers.item = Snap.addSnapper('item', {
        priority: 1000,
        callback: (item, config) => {
          return this.snapItem(item, config);
        }
      });
    }
  }
  unregisterSnappers() {
    let Snap = this.SL.Utils.get('Snap');
    if (!Snap || !this.Snappers) {
      return;
    }
    if (this.Snappers.item) {
      Snap.dropSnapper('item', this.Snappers.item.id);
      this.Snappers.item = undefined;
    }
  }
}
