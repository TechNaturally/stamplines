import Palette from '../../core/palette.js';
export default class LinePalette extends Palette {
  constructor(SL, config) {
    super(SL, config);
    this.id = 'Lines';
    this.PaperItems = [];
    this.initialized = true;
    this.configure();
  }
  get paletteType() {
    return 'Lines';
  }
  get paletteItems() {
    if (this.config && this.config.lines) {
      return this.config.lines;
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

  getImagePath(item) {
    var width = (this.config.preview && this.config.preview.width ) || 50;
    var height = (this.config.preview && this.config.preview.height ) || 25;
    var linePreviewCanvas = $(`<canvas width="${width}" height="${height}"></canvas>`);
    var linePreview = linePreviewCanvas[0].getContext('2d');
    if (item.style) {
      if (item.style.strokeColor) {
        linePreview.strokeStyle = item.style.strokeColor;
      }
      if (item.style.strokeWidth) {
        linePreview.lineWidth = item.style.strokeWidth;
      }
      if (item.style.dashArray) {
        linePreview.setLineDash(item.style.dashArray);
      }
    }
    linePreview.beginPath();
    linePreview.moveTo(0, height/2.0);
    linePreview.lineTo(width, height/2.0);
    linePreview.stroke();
    return linePreviewCanvas[0].toDataURL('image/png');
  }
  generateDOMItem(item) {
    let itemName = (item.name || item.id);
    let lineButton = $('<a></a>');
    lineButton.addClass('sl-palette-button');
    lineButton.addClass('sl-line-button');
    lineButton.data('Line', item);
    lineButton.data('Palette', this);
    lineButton.attr('alt', itemName);
    lineButton.attr('title', itemName);
    lineButton.click((event) => {
      let target = $(event.currentTarget);
      let line = target.data('Line');
      let palette = target.data('Palette');
      this.SL.Tools.Belt['CreateLine'].loadLine(line, palette);
    });
    let lineContent = $('<div></div>');
    lineContent.addClass('sl-palette-content sl-palette-img');
    lineContent.addClass('sl-line-content sl-line-img');
    lineContent.attr('draggable', false);
    let imagePath = this.getImagePath(item);
    if (imagePath) {
      lineContent.append($(`<img src="${imagePath}" draggable="false" />`));
    }
    lineButton.append(lineContent);
    if (this.config.showNames) {
      lineContent = $(`<div>${itemName}</div>`);
      lineContent.addClass('sl-palette-content sl-palette-item-name');
      lineContent.addClass('sl-line-content sl-line-name');
      lineButton.append(lineContent);
    }
    return lineButton;
  }
  createLine(from, to, lineDef) {
    let line = this.SL.Paper.generatePaperItem({Source: this, Type: 'Line', Line: lineDef}, paper.Path.Line, from.point, to.point);
    this.SL.Paper.Item.addCustomMethod(line, 'refresh', this.refreshItem, this);
    if (lineDef && lineDef.style) {
      this.SL.Paper.applyStyle(line, lineDef.style);
    }
    return line;
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

  assertItemLabel(item) {
    if (item && item.data && !item.data.paperLabel) {
      let labelData = {
        Source: this,
        Type: 'LineLabel',
        Class: 'ContentAddon',
        Layer: ((item.data && item.data.Layer) ? item.data.Layer : 'CONTENT'),
        ParentItem: item,
        position: {x: 0, y: 0} // @TODO: is labelData.position needed?
      };
      // @TODO: configure Line.Label (position, font)
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
      if (Geo && item.data.paperLabel.data) {
        let rotation = item.rotation;
        let rotationPoint = item.bounds.center;
        if (rotation) {
          item.rotate(-rotation, rotationPoint);
        }
        let position = ((item.data.labelPosition == 'bottom') ? -1.0 : 1.0);
        let distance = (item.data.labelDistance || 0.5);
        var space = (item.data.labelSpace || 15);
        let normal = Geo.Normalize.pointAtLineDistance(item, distance, true);
        normal.vector = normal.vector.rotate(-90);
        normal.vector.length = space*position;
        let point = normal.point.add(normal.vector);
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

  lineSelected(line) {
    if (line && line.data && line.data.Type == 'Line') {
      if (line.data.paperLabel) {
        line.data.paperLabel.insertAbove(line);
      }
    }
  }
  lineUnselected(line) {
    if (line && line.data && line.data.Type == 'Line') {
      if (line.data.paperLabel) {
        line.data.paperLabel.insertAbove(line);
      }
    }
  }
  snapItem(item, config={}) {
    if (item && item.data && item.data.Type == 'Line') {
      this.SL.Paper.Item.callCustomMethod(item, 'refresh');
    }
    return item;
  }
  snapPoint(point, config={}) {
    if (config.context == 'line-point' && config.segment && config.segment.path) {
      this.SL.Paper.Item.callCustomMethod(config.segment.path, 'refresh');
    }
  }

  initEventHandlers() {
    if (!this.initialized) {
      return;
    }
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }
    let ItemFilter = {Type: 'Line'};
    if (!this.eventHandlers.ItemSelected) {
      this.eventHandlers.ItemSelected = this.SL.Paper.on('SelectionItemSelected', ItemFilter, (args, item) => {
        if (!item && args && args.item && this.SL.Paper.Item.passesFilter(args.item, ItemFilter)) {
          item = args.item;
        }
        if (item && this.SL.Paper.Item.passesFilter(item, ItemFilter)) {
          this.lineSelected(item);
        }
      }, 'Line.Selected');
    }
    if (!this.eventHandlers.ItemUnselected) {
      this.eventHandlers.ItemUnselected = this.SL.Paper.on('SelectionItemUnselected', ItemFilter, (args, item) => {
        if (args.items) {
          args.items.forEach((item) => {
            if (item && this.SL.Paper.Item.passesFilter(item, ItemFilter)) {
              this.lineUnselected(item);
            }
          });
        }
        else if (item && this.SL.Paper.Item.passesFilter(item, ItemFilter)) {
          this.lineUnselected(item);
        }
      }, 'Line.Unselected');
    }
    if (!this.eventHandlers.ItemDestroyed) {
      this.eventHandlers.ItemDestroyed = this.SL.Paper.on('Destroy', ItemFilter, (args, item) => {
        this.removeItemLabel(item);
      }, 'Item.Destroyed');
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
      this.Snappers.point = Snap.addSnapper('point', {
        priority: 1000,
        callback: (point, config) => {
          return this.snapPoint(point, config);
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
    if (this.Snappers.point) {
      Snap.dropSnapper('point', this.Snappers.point.id);
      this.Snappers.point = undefined;
    }
  }
}
