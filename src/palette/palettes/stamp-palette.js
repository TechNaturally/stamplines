import Palette from '../../core/palette.js';
export default class StampPalette extends Palette {
  constructor(SL, config) {
    super(SL, config);
    this.id = 'Stamps';
    this.symbols = {};
    this.PaperItems = [];
    this.svgCache = {};
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
  getStampSVG(item) {
    if (item && item.data && item.data.Stamp) {
      // build URL for the SVG
      let domainBase = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':'+window.location.port : '');
      let imagePath = this.getImagePath(item.data.Stamp);
      let imageURL = domainBase + imagePath;

      // if it hasn't been requested before
      if (!this.svgCache[imageURL]) {
        // make a new request
        this.svgCache[imageURL] = new Promise((resolve, reject) => {
          $.ajax(imageURL, {
            dataType: 'xml',
            success: (data, status, xhr) => {
              // assign the serialized svg into the svgCache
              let svgData = new XMLSerializer().serializeToString(data);
              this.svgCache[imageURL] = svgData;
            },
            error: (xhr, status, error) => {
              // it would try again next time
              this.svgCache[imageURL] = undefined;
            },
            complete: () => {
              // always going to resolve or reject after attempting to load
              if (this.svgCache[imageURL]) {
                resolve(this.svgCache[imageURL]);
              }
              else {
                reject('Could not load SVG.');
              }
            }
          });
        });
      }
      // if it has been requested before
      if (this.svgCache[imageURL]) {
        // check if the version in svgCache has been resolved yet
        if (this.svgCache[imageURL].constructor.name == 'Promise') {
          // unresolved svgCache loader
          return this.svgCache[imageURL];
        }
        else {
          // the loader has resolved
          // always want to return a Promise
          return new Promise((resolve, reject) => {
            // instantly resolve it
            resolve(this.svgCache[imageURL]);
          });
        }
      }
    }
    // always want to return a Promise
    return new Promise((resolve, reject) => {
      reject('No stamp definition found.');
    });
  }
  getStampDef(id) {
    if (this.config && this.config.stamps) {
      let stampDef = this.config.stamps.find((item) => {
        return (item && item.id == id);
      });
      return stampDef;
    }
  }
  getStampSymbol(stamp) {
    if (stamp) {
      if (stamp.symbol) {
        return stamp.symbol;
      }
      if (stamp.id) {
        return this.symbols[stamp.id];
      }
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
  }
  importStamp(item, args) {
    if (item && item.data && item.data.id) {
      let stampDef = (args && args.Stamp) || this.getStampDef(item.data.id);
      if (stampDef) {
        let Snap = this.SL.Utils.get('Snap');
        let pt = new paper.Point();
        let stamp = this.placeStamp(stampDef, pt);
        if (stamp) {
          if (stamp.bounds && item.data.bounds) {
            stamp.bounds.set(item.data.bounds);
          }
          if (item.data.rotation) {
            stamp.rotate(item.data.rotation);
          }
          if (Snap) {
            Snap.Item(stamp, {context: 'import', size: true, position: true});
          }
          if (args && Array.isArray(args.Imported)) {
            args.Imported.push(stamp);
          }
        }
      }
    }
  }
  exportStamp(item, args) {
    if (item && item.data && item.data.Type == 'Stamp' && args && args.into) {
      let rotation = item.rotation;
      let rotationPoint = item.bounds.center;
      if (rotation) {
        item.rotate(-rotation, rotationPoint);
      }
      args.into.Content = {
        Type: 'Stamp',
        id: (item.data.Stamp && item.data.Stamp.id),
        bounds: {
          x: item.bounds.topLeft.x,
          y: item.bounds.topLeft.y,
          width: item.bounds.width,
          height: item.bounds.height
        },
        rotation: rotation
      };
      args.into.Definition = $.extend({}, item.data.Stamp);
      if (args.into.Definition.symbol) {
        args.into.Definition.symbol = undefined;
        delete args.into.Definition.symbol;
      }
      let svgLoader = this.getStampSVG(item);
      svgLoader.then((svgData) => {
        args.into.Definition.symbol_def = svgData;
      });
      args.into.Loaders = [svgLoader];
      // rotate item back
      if (rotation) {
        item.rotate(rotation, rotationPoint);
      }
    }
  }

  stampSelected(stamp) {
    if (stamp && stamp.data && stamp.data.Type == 'Stamp') {
    }
  }
  stampUnselected(stamp) {
    if (stamp && stamp.data && stamp.data.Type == 'Stamp') {
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
    if (!this.eventHandlers.ContentImport) {
      this.eventHandlers.ContentImport = this.SL.Paper.on('Content.Import', StampFilter, (args, item) => {
        this.importStamp(item, args);
      }, 'Stamp.Import');
    }
    if (!this.eventHandlers.ContentExport) {
      this.eventHandlers.ContentExport = this.SL.Paper.on('Content.Export', StampFilter, (args, item) => {
        this.exportStamp(item, args);
      }, 'Stamp.Export');
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
    if (this.eventHandlers.ContentImport) {
      this.SL.Paper.off('Content.Import', this.eventHandlers.ContentImport.id);
      delete this.eventHandlers.ContentImport;
      this.eventHandlers.ContentImport = undefined;
    }
    if (this.eventHandlers.ContentExport) {
      this.SL.Paper.off('Content.Export', this.eventHandlers.ContentExport.id);
      delete this.eventHandlers.ContentExport;
      this.eventHandlers.ContentExport = undefined;
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
