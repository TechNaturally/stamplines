import Palette from '../../core/palette.js';
export default class LinePalette extends Palette {
  constructor(SL, config) {
    super(SL, config);
    this.id = 'Lines';
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

  createLine(from, to, lineDef) {
    let line = this.SL.Paper.generatePaperItem({Source: this, Type: 'Line', Line: lineDef}, paper.Path.Line, from.point, to.point);
    this.SL.Paper.Item.addCustomMethod(line, 'refresh', this.refreshItem, this);
    if (lineDef && lineDef.style) {
      this.SL.Paper.applyStyle(line, lineDef.style);
    }
    return line;
  }
  refreshItem(item, args) {
    console.log('[LinePalette]->refreshItem =>', item);
    // @TODO: draw Line label
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
}
