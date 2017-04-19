import Palette from '../../core/palette.js';
export default class StampPalette extends Palette {
  constructor(SL, config) {
    super(SL, config);
    this.id = 'Stamps';
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
  generateDOMItem(item) {
    let itemName = (item.name || item.id);
    let stampButton = $('<a></a>');
    stampButton.addClass('sl-palette-button');
    stampButton.addClass('sl-stamp-button');
    stampButton.data('Stamp', item);
    stampButton.attr('alt', itemName);
    stampButton.attr('title', itemName);
    stampButton.click((event) => {
      let target = $(event.currentTarget);
      let stamp = target.data('Stamp');
      console.log('Create a new Stamp => ', stamp);
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
}
