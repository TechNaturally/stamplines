import Tool from '../../core/tool.js';
export class Select extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.Items = [];
    this.Group = this.SL.Paper.generatePaperItem({Source: this, Class: 'SELECTED', Layer: 'UI_BG'}, paper.Group);
    this.State = {
      multi: false
    };
    this.UI = {};
    this.initialized = true;
  }
  destroy() {
    super.destroy();
    this.SL.Paper.destroyPaperItem(this.Group);
    this.Group = undefined;
    delete this.Group;
  }
  get activationPriority() {
    if (this.State.multi && this.Belt.State.Mouse.Hover.targetItem) {
      return 25;
    }
    return 0;
  }
  configure(config) {
    config = super.configure(config);
    if (config.padding == undefined) {
      config.padding = 6;
    }
    if (!config.colorSingle) {
      config.colorSingle = '#009DEC';
    }
    if (!config.colorMulti) {
      config.colorMulti = '#00EC9D';
    }
    if (!config.selectableClasses) {
      config.selectableClasses = [];
    }
    if (config.selectableClasses.indexOf('Content') == -1) {
      config.selectableClasses.push('Content');
    }
    if (!config.singleSelectedTypes) {
      config.singleSelectedTypes = [];
    }
    if (config.singleSelectedTypes.indexOf('Line') == -1) {
      config.singleSelectedTypes.push('Line');
    }
    return config;
  }
  reset() {
    super.reset();
    if (!this.initialized) {
      return;
    }
    this.Unselect();
    this.resetState();
    this.resetUI();
  }
  resetState() {
    this.State.multi = false;
  }
  isSelectable(item) {
    if (item && item.data && item.data.Class) {
      if (item.data.Class.constructor === Array) {
        for (let Class of item.data.Class) {
          if (this.config.selectableClasses.indexOf(Class) != -1) {
            return true;
          }
        }
      }
      else if (this.config.selectableClasses.indexOf(item.data.Class) != -1) {
        return true;
      }
    }
    return false;
  }
  isSelected(item) {
    return !!(item && this.Items.indexOf(item) != -1);
  }
  Select(item) {
    if (this.isSelectable(item) && !this.isSelected(item)) {
      this.Items.push(item);
      item.selected = true;
      item.data.parentOrig = item.parent;
      this.Group.appendBottom(item);
      this.Group.bringToFront();
      this.refreshUI();
    }
  }
  Unselect(item) {
    if (item) {
      let selectIdx = this.Items.indexOf(item);
      if (selectIdx != -1) {
        this.Items.splice(selectIdx, 1);
        item.selected = false;
        if (item.data && item.data.parentOrig) {
          item.data.parentOrig.addChild(item);
          item.data.parentOrig = undefined;
        }
      }
    }
    else {
      // no item, unselect all
      for (let item of this.Items) {
        item.selected = false;
        if (item.data && item.data.parentOrig) {
          item.data.parentOrig.addChild(item);
          item.data.parentOrig = undefined;
        }
      }
      this.Items.length = 0;
    }
  }
  refreshUI() {
    if (this.isActive()) {
      let cursor = 'crosshair';
      if (this.State.multi) {
        let targetItem = this.Belt.State.Mouse.Hover.targetItem;
        if (targetItem) {
          if (this.isSelected(targetItem) && this.Items.length > 1) {
            cursor = 'minus';
          }
          else if (this.isSelectable(targetItem) && !this.isSelected(targetItem) && this.Items.length) {
            cursor = 'plus';
          }
        }
      }
      this.SL.UI.Mouse.Cursor.activateCursor(cursor);
      this.refreshSelected();
    }
    this.refreshUIOutline();
  }
  resetUI() {
    this.resetUIOutline();
  }
  refreshUIOutline() {
    if (this.Items.length) {
      if (!this.UI.outline) {
        this.UI.outline = this.SL.Paper.generatePaperItem({Source: this, Class:'UI'}, paper.Shape.Rectangle);
        this.UI.outline.selected = true;
      }
      this.UI.outline.selectedColor = ((this.Items.length > 1) ? this.config.colorMulti : this.config.colorSingle);
      this.UI.outline.set({position: this.Group.bounds.center, size: this.Group.bounds.size.add(this.config.padding*2.0)});
    }
    else {
      this.resetUIOutline();
    }
  }
  resetUIOutline() {
    if (this.UI.outline) {
      this.SL.Paper.destroyPaperItem(this.UI.outline);
      this.UI.outline = undefined;
      delete this.UI.outline;
    }
  }
  refreshSelected() {
    for (let item of this.Items) {
      item.selected = (this.Items.length > 1 || (item.data && item.data.Type && this.config.singleSelectedTypes.indexOf(item.data.Type) != -1));
    }
  }
  onKeyDown(event) {
    if (event.key == 'shift') {
      this.State.multi = true;
      this.refreshUI();
      this.Belt.checkActiveTool();
    }
  }
  onKeyUp(event) {
    if (event.key == 'shift') {
      this.State.multi = false;
      this.refreshUI();
      this.Belt.checkActiveTool();
    }
  }
  onMouseDown(event) {
    if (this.isActive()) {
      if (event.event.button === 0) {
        let targetItem = this.Belt.State.Mouse.Hover.targetItem;
        if (targetItem && this.isSelectable(targetItem)) {
          if (this.isSelected(targetItem) && this.Items.length > 1) {
            if (this.State.multi) {
              this.Unselect(targetItem);
            }
          }
          else {
            if (!this.State.multi) {
              this.Unselect();
            }
            this.Select(targetItem);
          }
        }
        else {
          this.Unselect();
        }
        this.refreshUI();
        this.onMouseMove();
        this.Belt.checkActiveTool();
      }
    }
  }
  onMouseMove(event) {
    this.Belt.State.Mouse.Hover.targetSelected = (this.Belt.State.Mouse.Hover.targetItem && this.isSelected(this.Belt.State.Mouse.Hover.targetItem));
    this.Belt.State.Mouse.Hover.targetUnselected = (this.Belt.State.Mouse.Hover.targetItem && !this.Belt.State.Mouse.Hover.targetSelected);

    let wasHover = this.Belt.State.Mouse.Hover.selection;
    this.Belt.State.Mouse.Hover.selection = !!(this.SL.UI.Mouse.State.active && this.SL.UI.Mouse.State.point && this.UI.outline && this.UI.outline.contains(this.SL.UI.Mouse.State.point));
    if (this.Belt.State.Mouse.Hover.selection && !wasHover) {
      this.Belt.onSelectionHover(event);
    }
    else if (!this.Belt.State.Mouse.Hover.selection && wasHover) {
      this.Belt.onSelectionUnhover(event);
    }
    this.refreshUI();
    this.Belt.checkActiveTool();
  }
}
