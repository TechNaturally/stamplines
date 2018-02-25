import {default as Component} from '../core/component.js';
import {default as NamedObjectMap} from '../util/classes/named-object-map.js';
import * as PaletteTypes from './palettes/_index.js';
export default class PaletteManager extends Component {
  constructor(SL, config={}) {
    super(SL, config);
    this.palettes = new NamedObjectMap(SL, {
      config: this.config,
      types: PaletteTypes,
      '#onRemove': [
        (entry, type) => {
          this.removePaletteFromDock(entry.id);
        },
        'destroy']
    });
    this.configure();
  }
  getType() {
    return 'PaletteManager';
  }
  configure(config) {
    config = super.configure(config);
    this.palettes.readConfigured(config, (type, id, config) => {
      this.addPalette(type, id, config);
    });
    return this.config;
  }
  reset() {
    super.reset();
    this.removePalette();
  }
  addPalette(type, id, config) {
    let newPalette = this.palettes.addEntry(type, id, config);
    if (this.SL.UI.Dock) {
      this.SL.UI.Dock.addPalette(newPalette);
    }
    return newPalette;
  }
  getPalette(id) {
    return this.palettes.getEntry(id);
  }
  removePalette(id='*') {
    let removed = this.palettes.removeEntry(id);
    if (removed && this.SL.UI.Dock) {
      if (removed.constructor === Array) {
        removed.forEach((removed) => {
          this.removePaletteFromDock(removed.id);
        });
      }
      else {
        this.removePaletteFromDock(removed.id);
      }
    }
    return removed;
  }
  removePaletteFromDock(id) {
    if (id && this.SL.UI.Dock) {
      this.SL.UI.Dock.removePalette(id);
    }
  }
}
