import UIComponent from '../core/ui-component.js';
export default class Dock extends UIComponent {
  constructor(UI, config={}) {
    super(UI, config);
    this.register();
    this.Palettes = {};
  }
  get type() {
    return 'UI.Dock';
  }

  assertDOM() {
    if (!this.UI.DOM.dock) {
      this.UI.DOM.dock = $('<div class="sl-dock"></div>)');
      this.UI.DOM.canvas.after(this.UI.DOM.dock);
      return true;
    }
  }
  destroyDOM() {
    if (this.UI.DOM.dock) {
      this.UI.DOM.dock.remove();
      this.UI.DOM.dock = undefined;
      return true;
    }
  }

  addPalette(palette, id) {
    if (!palette) {
      throw 'No palette to add!';
    }
    this.assertDOM();
    if (!id) {
      id = palette.id;
    }
    if (id && this.Palettes[id]) {
      throw `Palette with id ${id} already exists!`;
    }
    if (!id) {
      let ID = this.UI.SL.Utils.gets('Identity');
      if (ID) {
        id = ID.getUnique(palette.paletteType.toLowerCase(), this.Palettes);
      }
    }

    let paletteDOM = palette.generateDOM().addClass('sl-palette-'+this.UI.classify(id));
    this.UI.DOM.dock.append(paletteDOM);

    this.Palettes[id] = palette;

    return id;
  }
  removePalette(id) {
    if (this.Palettes[id]) {
      this.Palettes[id].destroyDOM();
      this.Palettes[id] = undefined;
      delete this.Palettes[id];
      return true;
    }
  }
}
