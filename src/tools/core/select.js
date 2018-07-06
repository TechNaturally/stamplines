import Tool from '../../core/tool.js';
export class Select extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.Items = [];
    this.Groups = {
      'default': this.SL.Paper.generatePaperItem({Source: this, Class: 'SELECTED', Layer: 'CONTENT_ACTIVE'}, paper.Group)
    };
    this.State = {
      multi: false
    };
    this.UI = {};
    this.initialized = true;
  }
  destroy() {
    super.destroy();
    for (let groupID in this.Groups) {
      this.SL.Paper.destroyPaperItem(this.Groups[groupID]);
      delete this.Groups[groupID];
      this.Groups[groupID] = undefined;
    }
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
    if (config.selectableClasses.indexOf('ContentAddon') == -1) {
      config.selectableClasses.push('ContentAddon');
    }
    // singleSelectedTypes are Types that should activate group selection even when it is the only item selected
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
  addGroup(group, groupID) {
    // TODO: allow generated groupID
    if (!this.Groups[groupID]) {
      this.Groups[groupID] = group;
    }
    return groupID;
  }
  isSelectable(item) {
    let selectable = false;
    this.SL.Paper.Item.forEachClass(item, (itemClass) => {
      if (this.config.selectableClasses.indexOf(itemClass) != -1) {
        selectable = true;
        return true;
      }
    });
    return selectable;
  }
  isSelected(item) {
    return !!(item && this.Items.indexOf(item) != -1);
  }
  Select(item, groupID='default') {
    if (item.constructor == Array) {
      for (let select_item of item) {
        this.Select(select_item);
      }
      return;
    }
    if (this.isSelectable(item) && !this.isSelected(item)) {
      this.Items.push(item);
      item.selected = true;
      item.data.parentOrig = item.parent;
      if (!groupID || !this.Groups[groupID]) {
        groupID = 'default';
      }
      this.Groups[groupID].appendBottom(item);
      this.refreshUI();
      this.Belt.onSelectionItemSelected({ item: item });
      this.SL.Paper.emit('SelectionItemSelected', { item: item }, item);
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
        this.refreshUI();
        this.Belt.onSelectionItemUnselected({ item: item });
        this.SL.Paper.emit('SelectionItemUnselected', { item: item }, item);
      }
    }
    else {
      // no item, unselect all
      let unselected = [];
      for (let item of this.Items) {
        item.selected = false;
        if (item.data && item.data.parentOrig) {
          item.data.parentOrig.addChild(item);
          item.data.parentOrig = undefined;
        }
        unselected.push(item);
      }
      this.Items.length = 0;
      this.refreshUI();
      this.Belt.onSelectionItemUnselected({ items: unselected });
      this.SL.Paper.emit('SelectionItemUnselected', { items: unselected });
    }
  }
  SnapSelected(config={}) {
    let Snap = this.SL.Utils.get('Snap');
    if (Snap) {
      for (let item of this.Items) {
        Snap.Item(item, config);
      }
      this.Belt.refreshUI();
    }
  }
  count() {
    return this.Items.length;
  }
  hasItems() {
    return !!(this.Items.length);
  }
  canTransform(transform) {
    if (this.Items.length == 1) {
      return this.SL.Paper.Item.canTransform(this.Items[0], transform);
    }
    let allBlocked = true;
    for (let item of this.Items) {
      if (item && this.SL.Paper.Item.canTransform(item, transform)) {
        allBlocked = false;
        break;
      }
    }
    return !allBlocked;
  }
  getBounds(padding=true) {
    let bounds = {
      from: undefined,
      to: undefined
    };
    for (let groupID in this.Groups) {
      let Group = this.Groups[groupID];
      if (!Group || Group.isEmpty()) {
        continue;
      }
      if (!bounds.from) {
        bounds.from = new paper.Point(Group.bounds.topLeft);
      }
      if (!bounds.to) {
        bounds.to = new paper.Point(Group.bounds.bottomRight);
      }
      if (Group.bounds.left < bounds.from.x) {
        bounds.from.x = Group.bounds.left;
      }
      if (Group.bounds.top < bounds.from.y) {
        bounds.from.y = Group.bounds.top;
      }
      if (Group.bounds.right > bounds.to.x) {
        bounds.to.x = Group.bounds.right;
      }
      if (Group.bounds.bottom > bounds.to.y) {
        bounds.to.y = Group.bounds.bottom;
      }
    }
    if (padding === true) {
      padding = this.config.padding;
    }
    if (padding && !isNaN(padding)) {
      if (bounds.from) {
        bounds.from.x -= padding;
        bounds.from.y -= padding;
      }
      if (bounds.to) {
        bounds.to.x += padding;
        bounds.to.y += padding;
      }      
    }
    return new paper.Rectangle(bounds);
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
      let bounds = this.getBounds();
      if (!this.UI.outline) {
        this.UI.outline = this.SL.Paper.generatePaperItem({Source: this, Class:'UI'}, paper.Shape.Rectangle);
        this.UI.outline.selected = true;
      }
      this.UI.outline.selectedColor = ((this.Items.length > 1) ? this.config.colorMulti : this.config.colorSingle);
      this.UI.outline.set({position: bounds.center, size: bounds.size});
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
        this.Belt.refreshUI();
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
