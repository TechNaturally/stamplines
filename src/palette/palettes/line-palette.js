import Palette from '../../core/palette.js';
export default class LinePalette extends Palette {
  constructor(SL, config) {
    super(SL, config);
    this.id = 'Lines';
    this.PaperItems = [];
    this.previewImagePaths = {};
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

  getLineDef(id) {
    if (this.config && this.config.lines) {
      let lineDef = this.config.lines.find((item) => {
        return (item && item.id == id);
      });
      return lineDef;
    }
  }
  getImagePath(item, config={}) {
    let width = config.width || (this.config.preview && this.config.preview.width ) || 36;
    let height = config.height || (this.config.preview && this.config.preview.height ) || 25;
    let pathID = (config.id || item.id || Object.keys(this.previewImagePaths).length) + `-${width}x${height}`;
    if (!this.previewImagePaths[pathID]) {
      let linePreviewCanvas = $(`<canvas width="${width}" height="${height}"></canvas>`);
      let linePreview = linePreviewCanvas[0].getContext('2d');
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
      this.previewImagePaths[pathID] = linePreviewCanvas[0].toDataURL('image/png');
    }
    return this.previewImagePaths[pathID];
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
  getPreviewItem(item, config={}) {
    if (item && item.data && item.data.Line) {
      let width = config.width || 50;
      let height = config.height || 50;
      let pt1 = new paper.Point(0, 0);
      let pt2 = new paper.Point(width, 0);
      let preview = this.SL.Paper.generatePaperItem({Source: (config.Source || this), Type: 'LinePreview', Line: item.data.Line, Class: 'ContentAddon', Layer: 'GROUPED'}, paper.Path.Line, pt1, pt2);
      if (item.data.Line.style) {
        this.SL.Paper.applyStyle(preview, item.data.Line.style);
      }
      preview.remove();
      return preview;
    }
    return null;
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
  importLine(item, args) {
    if (item && item.data && item.data.id && item.data.points && item.data.points.length >= 2) {
      let lineDef = (args && args.Line) || this.getLineDef(item.data.id);
      if (lineDef) {
        let Snap = this.SL.Utils.get('Snap');
        let pt1 = new paper.Point(item.data.points[0]);
        let pt2 = new paper.Point(item.data.points[1]);
        let line = this.createLine({point: pt1}, {point: pt2}, lineDef);
        if (line) {
          if (item.data.points.length > 2) {
            for (let i=2; i < item.data.points.length; i++) {
              let pt = new paper.Point(item.data.points[i]);
              line.add(pt);
            }
          }
          if (Snap && line.segments) {
            for (let i=0; i < line.segments.length; i++) {
              let segment = line.segments[i];
              let endPoint = (i==0 || i==(line.segments.length-1));
              if (endPoint) {
                this.SL.Paper.emit('LineEndTarget', {toggle: true});
              }
              segment.point.set(Snap.Point(segment.point, {
                context: 'line-point',
                interactive: false,
                segment: segment
              }));
              if (endPoint) {
                this.SL.Paper.emit('LineEndTarget', {toggle: false});
              }
            }
          }
        }
      }
    }
  }
  exportLine(item, args) {
    if (item && item.data && item.data.Type == 'Line' && args && args.into) {
      let points = [];
      if (item.segments) {
        for (let segment of item.segments) {
          if (segment.point) {
            points.push({ x: segment.point.x, y: segment.point.y });
          }
        }
      }
      args.into.Content = {
        Type: 'Line',
        id: (item.data.Line && item.data.Line.id),
        points
      };
      args.into.Definition = $.extend({}, item.data.Line);
    }
  }

  // @TODO: item label stuff can be removed in favour of the LabelConnector tool
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
        let normal = Geo.Normalize.pointOnLine(item, distance, true);
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
    if (!this.eventHandlers.ContentImport) {
      this.eventHandlers.ContentImport = this.SL.Paper.on('Content.Import', ItemFilter, (args, item) => {
        this.importLine(item, args);
      }, 'Line.Import');
    }
    if (!this.eventHandlers.ContentExport) {
      this.eventHandlers.ContentExport = this.SL.Paper.on('Content.Export', ItemFilter, (args, item) => {
        this.exportLine(item, args);
      }, 'Line.Export');
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
