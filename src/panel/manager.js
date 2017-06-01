import {default as Component} from '../core/component.js';
import {default as NamedObjectMap} from '../util/classes/named-object-map.js';
import * as PanelTypes from './panels/_index.js';
export default class PanelManager extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.panels = new NamedObjectMap(SL, {
      config: this.config,
      types: PanelTypes,
      '#onAdd': [
        (entry, type) => {
          this.addPanelToDOM(entry);
        }
      ],
      '#onRemove': [
        (entry, type) => {
          this.removePanelFromDOM(entry);
        },
        'destroy']
    });
    var State = this.State = {
      activePanels: []
    };
    this.configure();
    this.eventHandlers = {};
    this.initEventHandlers();
    this.initialized = true;
  }
  reset() {
    super.reset();
    this.closeItemPanel();
    this.resetEventHandlers();
  }
  get type() {
    return 'UI.PanelManager';
  }

  initEventHandlers() {
    if (!this.eventHandlers.DestroyItem) {
      this.eventHandlers.DestroyItem = this.SL.Paper.on('Destroy', {}, (args, item) => {
        this.closeItemPanel(item);
      }, 'Panel.Manager.Destroy.Item');
    }
    if (!this.eventHandlers.DoubleClick) {
      this.eventHandlers.DoubleClick = this.SL.Paper.on('DoubleClick', {}, (event, item) => {
        if (event && event.event && event.event.button === 0) {
          if (this.SL.Tools.State.Mouse.Hover.targetSelected && this.SL.Tools.State.Mouse.Hover.targetItem) {
            this.openItemPanel(this.SL.Tools.State.Mouse.Hover.targetItem);
          }
        }
      }, 'Panel.Manager.DoubleClick');
    }
  }
  resetEventHandlers() {
    if (!this.initialized) {
      return;
    }
    if (this.eventHandlers.DestroyItem) {
      this.SL.Paper.off('Destroy', this.eventHandlers.DestroyItem.id);
      delete this.eventHandlers.DestroyItem;
      this.eventHandlers.DestroyItem = undefined;
    }
    if (this.eventHandlers.DoubleClick) {
      this.SL.Paper.off('DoubleClick', this.eventHandlers.DoubleClick.id);
      delete this.eventHandlers.DoubleClick;
      this.eventHandlers.DoubleClick = undefined;
    }
  }

  getPanelType(item) {
    let panelType = 'Panel';
    if (item && item.data) {
      if (item.data.PanelType && this.panels.hasType(item.data.PanelType)) {
        panelType = item.data.PanelType;
      }
      else if (item.data.Type && this.panels.hasType(item.data.Type+'Panel')) {
        panelType = item.data.Type+'Panel';
      }
    }
    return panelType;
  }
  getPanelID(item) {
    let panelID;
    return panelID;
  }
  getPanelConfig(item, config={}) {
    $.extend({}, config, {});
    return config;
  }

  addPanelToDOM(panel) {
    if (panel) {
      this.SL.UI.PaperDOM.addElement(panel.generateDOM(), true);
    }
  }
  removePanelFromDOM(panel) {
    if (panel.element) {
      this.SL.UI.PaperDOM.removeElement(panel.element);
    }
  }

  closePanel(panel) {
    if (panel && panel.id) {
      this.panels.removeEntry(panel.id);
    }
  }

  openItemPanel(item) {
    if (this.hasItemPanel(item)) {
      return;
    }
    let panelType = this.getPanelType(item);
    let panelID = this.getPanelID(item);
    let panelConfig = this.getPanelConfig(item);
    let newPanel = this.panels.addEntry(panelType, panelID, panelConfig);
    if (newPanel) {
      newPanel.manager = this;
      newPanel.setData({item: item});
    }
    return newPanel;
  }
  getItemPanel(item='*') {
    let result;
    if (item == '*') {
      result = Object.values(this.panels.table);
    }
    else if (typeof item == 'string') {
      result = [this.panels.getEntry(item)];
    }
    else {
      let check = Object.values(this.panels.table);
      check.forEach((panel) => {
        if (panel && panel.data && panel.data.item == item) {
          if (!result) {
            result = [];
          }
          result.push(panel);
        }
      });
    }
    return result;
  }
  hasItemPanel(item='*') {
    let panel = this.getItemPanel(item);
    return (panel && panel.length);
  }
  closeItemPanel(item='*') {
    let panel = this.getItemPanel(item);
    if (!panel) {
      return;
    }
    if (panel.constructor === Array) {
      panel.forEach((panel) => {
        this.closePanel(panel);
      });
    }
    else {
      this.closePanel(panel);
    }
  }
}
