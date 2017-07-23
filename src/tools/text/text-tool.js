import Tool from '../../core/tool.js';
export class TextTool extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
    this.loaded = {};
    this.State = {
      textItem: null,
      hoverItem: null,
      cursor: {
        index: null,
        line: null,
        local: null,
        targetX: null
      },
      selectCache: null
    };
    this.UI = {};
  }
  configure(config) {
    config = super.configure(config);
    this.configureFont(config.font);
    this.configureInteractive(config.interactive);
    this.configureUI(config.ui);
    return config;
  }
  configureFont(config={}) {
    this.config.font = config;
    if (config.fontFamily == null) {
      config.fontFamily = 'sans-serif';
    }
    if (config.fontWeight == null) {
      config.fontWeight = 'normal';
    }
    if (config.fontSize == null) {
      config.fontSize = 14;
    }
  }
  configureInteractive(config={}) {
    this.config.interactive = config;
    if (!config.deltaMultiplier) {
      config.deltaMultiplier = 0.5;
    }
    if (!config.allowSizes || !config.allowSizes.length) {
      config.allowSizes = [14, 16, 18, 21, 24, 28, 36];
    }
    config.allowSizes.sort();
    if (!config.minSize) {
      config.minSize = config.allowSizes[0];
    }
    if (!config.maxSize) {
      config.maxSize = config.allowSizes[config.allowSizes.length-1];
    }
  }
  configureUI(config={}) {
    this.config.ui = config;
    if (config.color == null) {
      config.color = '#000000';
    }
    if (config.cursor == null) {
      config.cursor = {};
    }
    if (config.cursor.blink == null) {
      config.cursor.blink = 0.5;
    }
    if (config.cursor.style == null) {
      config.cursor.style = {};
    }
    if (config.cursor.style.strokeWidth == null) {
      config.cursor.style.strokeWidth = 1;
    }
    if (config.cursor.style.strokeColor == null) {
      config.cursor.style.strokeColor = config.color;
    }

    if (config.target == null) {
      config.target = {};
    }
    if (config.target.padding == null) {
      config.target.padding = 2;
    }
    if (config.target.style == null) {
      config.target.style = {};
    }
    if (config.target.style.strokeColor == null) {
      config.target.style.strokeColor = '#6600FF';
    }
    if (config.target.style.strokeWidth == null) {
      config.target.style.strokeWidth = 1;
    }

    if (config.hoverTarget == null) {
      config.hoverTarget = {};
    }
    if (config.hoverTarget.padding == null) {
      config.hoverTarget.padding = config.target.padding;
    }
    if (config.hoverTarget.style == null) {
      config.hoverTarget.style = {};
    }
    if (config.hoverTarget.style.strokeColor == null) {
      config.hoverTarget.style.strokeColor = config.target.style.strokeColor;
    }
    if (config.hoverTarget.style.strokeWidth == null) {
      config.hoverTarget.style.strokeWidth = config.target.style.strokeWidth;
    }
  }
  reset() {
    super.reset();
    this.resetState();
  }
  resetState() {
    this.resetStateCursor();
    this.resetStateTargets();
    this.resetStateSelectCache();
  }
  resetStateCursor() {
    if (this.State && this.State.cursor) {
      this.State.cursor.index = null;
      this.State.cursor.line = null;
      this.State.cursor.local = null;
      this.State.cursor.targetX = null;
    }
  }
  resetStateTargets() {
    this.resetStateHoverTarget();
    this.resetStateTextItem();
  }
  resetStateHoverTarget() {
    if (this.State) {
      if (this.State.hoverItem) {
        this.removeTemporaryStraighten(this.State.hoverItem, 'hoverItem');
      }
      this.State.hoverItem = null;
    }
  }
  resetStateTextItem() {
    if (this.State) {
      if (this.State.textItem) {
        this.removeTemporaryStraighten(this.State.textItem, 'textItem');
        if (!this.State.textItem.content.trim()) {
          this.SL.Paper.destroyPaperItem(this.State.textItem);
        }
      }
      this.State.textItem = null;
    }
  }
  resetStateSelectCache() {
    if (this.State) {
      if (this.State.selectCache) {
        this.Belt.Belt.Select.Select(this.State.selectCache);
      }
      this.State.selectCache = null;
    }
  }

  activate() {
    super.activate();
    if (this.DOM && this.DOM.PaletteButton) {
      this.DOM.PaletteButton.addClass(this.DOM.PaletteButton.data('activeClass'));
    }
    this.SL.Paper.on('Frame', undefined, (event) => {
      this.onFrame(event);
    }, 'TextTool.Frame');
    this.State.selectCache = this.Belt.Belt.Select.Items.slice();
    this.Belt.Belt.Select.Unselect();
  }
  deactivate() {
    super.deactivate();
    this.SL.Paper.off('Frame', 'TextTool.Frame');
    if (this.DOM && this.DOM.PaletteButton) {
      this.DOM.PaletteButton.removeClass(this.DOM.PaletteButton.data('activeClass'));
    }
    this.resetState();
    this.resetUI();
  }
  get activationPriority() {
    return (this.active ? 500 : -1);
  }
  refreshUI() {
    if (this.isActive()) {
      this.SL.UI.Mouse.Cursor.activateCursor('text');
      this.refreshUICursor();
      this.refreshUITarget();
    }
  }
  refreshUICursor(resetBlink=false) {
    if (this.State.textItem && this.State.cursor.line != null && this.State.cursor.local != null) {
      let lineHeight = this.State.textItem.leading;
      let currentLine = ((this.State.cursor.line < this.State.textItem._lines.length) ? this.State.textItem._lines[this.State.cursor.line] : '') || '';
      let cursorTop = {
        x: this.State.textItem.bounds.left + this.getTextWidth(currentLine.substr(0, this.State.cursor.local)),
        y: this.State.textItem.bounds.top + this.State.cursor.line * lineHeight
      };
      let cursorBottom = {
        x: cursorTop.x,
        y: cursorTop.y+lineHeight
      };
      if (!this.UI.cursor) {
        this.UI.cursor = this.SL.Paper.generatePaperItem({Source: this, Class:['UI','Tool'], Layer:'UI_BG'}, paper.Path.Line, new paper.Point(cursorTop), new paper.Point(cursorBottom));
        this.SL.Paper.applyStyle(this.UI.cursor, this.config.ui.cursor.style);
      }
      this.UI.cursor.segments[0].point.set(cursorTop);
      this.UI.cursor.segments[1].point.set(cursorBottom);
      if (resetBlink) {
        this.UI.cursor.data.lastTick = null;
        this.UI.cursor.visible = true;
      }
    }
  }
  refreshUIHoverTarget() {
    let targetItem = this.State.hoverItem;
    if (targetItem && targetItem.content && targetItem.data && targetItem.data.Type == 'Text') {
      if (!this.UI.hoverTarget) {
        this.UI.hoverTarget = this.SL.Paper.generatePaperItem({Source: this, Class:['UI','Tool'], Layer:'UI_BG'}, paper.Shape.Rectangle, targetItem.bounds.clone().expand(this.config.ui.hoverTarget.padding*2.0));
        this.UI.hoverTarget.strokeScaling = false;
        this.SL.Paper.applyStyle(this.UI.hoverTarget, this.config.ui.hoverTarget.style);
      }
      this.UI.hoverTarget.bounds.set(targetItem.bounds.clone().expand(this.config.ui.hoverTarget.padding*2.0));
    }
    else if (this.UI.hoverTarget) {
      this.resetUIHoverTarget();
    }
  }
  refreshUITarget() {
    let targetItem = this.State.textItem;
    if (targetItem && targetItem.content) {
      if (!this.UI.target) {
        this.UI.target = this.SL.Paper.generatePaperItem({Source: this, Class:['UI','Tool'], Layer:'UI_BG'}, paper.Shape.Rectangle, targetItem.bounds.clone().expand(this.config.ui.target.padding*2.0));
        this.UI.target.strokeScaling = false;
        this.SL.Paper.applyStyle(this.UI.target, this.config.ui.target.style);
      }
      this.UI.target.bounds.set(targetItem.bounds.clone().expand(this.config.ui.target.padding*2.0));
    }
    else if (this.UI.target) {
      this.resetUITarget();
    }
  }
  resetUI() {
    this.resetUICursor();
    this.resetUITarget();
    this.resetUIHoverTarget();
  }
  resetUICursor() {
    if (this.UI.cursor) {
      this.SL.Paper.destroyPaperItem(this.UI.cursor);
      this.UI.cursor = undefined;
    }
  }
  resetUITarget() {
    if (this.UI.target) {
      this.SL.Paper.destroyPaperItem(this.UI.target);
      this.UI.target = undefined;
    }
  }
  resetUIHoverTarget() {
    if (this.UI.hoverTarget) {
      this.SL.Paper.destroyPaperItem(this.UI.hoverTarget);
      this.UI.hoverTarget = undefined;
    }
  }

  setHoverTarget(targetItem) {
    if (this.State.hoverItem != targetItem) {
      this.resetStateHoverTarget();
      this.State.hoverItem = targetItem;
      this.addTemporaryStraighten(this.State.hoverItem, 'hoverItem');
      this.refreshUIHoverTarget();
    }
  }
  setTarget(targetItem) {
    if (this.State.textItem != targetItem) {
      this.resetStateTextItem();
      this.State.textItem = targetItem;
      this.addTemporaryStraighten(this.State.textItem, 'textItem');
      this.refreshUITarget();
    }
  }

  addTemporaryStraighten(item, id) {
    if (item && item.data && item.data.Type == 'Text' && item.rotation) {
      if (!item.data) {
        item.data = {};
      }
      if (!item.data.straightened) {
        item.data.straightened = {
          angle: 0,
          by: []
        };
      }
      if (!item.data.straightened.by.length) {
        item.data.straightened.angle = item.rotation;
        item.rotate(-1.0*item.rotation);
        item.data.straightened.by.push(id);
      }
    }
    if (item && item.data && item.data.straightened && item.data.straightened.by.indexOf(id) == -1) {
      item.data.straightened.by.push(id);
    }
  }
  removeTemporaryStraighten(item, id) {
    if (item && item.data && item.data.straightened && item.data.straightened.angle && item.data.straightened.by) {
      let straightenedIndex = item.data.straightened.by.indexOf(id);
      if (straightenedIndex != -1) {
        item.data.straightened.by.splice(straightenedIndex, 1);
        if (!item.data.straightened.by.length) {
          item.rotate(item.data.straightened.angle);
          item.data.straightened = undefined;
          delete item.data.straightened;
        }
      }
    }
  }

  getLineCount(lines, index) {
    let line = 0;
    let check = 0;
    while (line < lines.length && (check + lines[line].length) < index) {
      check += lines[line++].length + 1;
    }
    return Math.max(0, Math.min(line, lines.length-1));
  }
  getLineStartIndex(lines, line) {
    let index = 0;
    for (let i=0; i < lines.length && i < line; i++) {
      index += lines[i].length + 1;
    }
    return index;
  }
  getTextWidth(text, font) {
    if (!font && this.State.textItem) {
      font = this.State.textItem.style.getFontStyle();
    }
    if (!font) {
      return 0;
    }
    return this.SL.Paper.view.getTextWidth(font, [text]);
  }

  getAnchorPoint(edge, rectangle, opposite=false) {
    let result = rectangle.center.clone();
    if (typeof edge == 'string') {
      edge = this.vector(edge);
    }
    if (!edge || edge.x == undefined || edge.y == undefined) {
      throw 'Invalid edge given';
    }
    if (edge.x < 0) {
      result.x = (opposite ? rectangle.right : rectangle.left);
    }
    else if (edge.x >= 0) {
      result.x = (opposite ? rectangle.left : rectangle.right);
    }
    if (edge.y < 0) {
      result.y = (opposite ? rectangle.bottom : rectangle.top);
    }
    else if (edge.y >= 0) {
      result.y = (opposite ? rectangle.top : rectangle.bottom);
    }
    return result;
  }

  calculateCursor(set) {
    let checkString = ((this.State.textItem && this.State.textItem.content) || '');
    if (set.position != null) {
      this.State.cursor.index = 0;
      this.State.cursor.line = 0;
      this.State.cursor.local = 0;
      if (this.State.textItem) {
        if (this.State.textItem.leading) {
          this.State.cursor.line = Math.min((this.State.textItem._lines.length-1), Math.floor(set.position.y / this.State.textItem.leading));
        }
        let line = this.State.textItem._lines[this.State.cursor.line] || '';
        let checkIndex = 0;
        let charWidth = this.getTextWidth('A');
        if (charWidth) {
          // make a guess at the index based on width of A
          checkIndex = Math.floor(set.position.x / charWidth);
        }

        // make sure index is to the left of set.position.x
        let indexLeft = this.getTextWidth(line.substr(0, checkIndex));
        while (indexLeft > set.position.x && checkIndex > 0) {
          checkIndex--;
          indexLeft -= this.getTextWidth(line.substr(checkIndex, 1));
        }

        // make sure index+1 is to the right of set.position.x
        let indexRight = indexLeft + this.getTextWidth(line.substr(checkIndex, 1));
        while (indexRight < set.position.x && checkIndex < line.length) {
          indexLeft += this.getTextWidth(line.substr(checkIndex, 1));
          checkIndex++;
          indexRight = indexLeft + this.getTextWidth(line.substr(checkIndex, 1));
        }

        // clicking on right half of character bumps up to next index (append)
        if (set.position.x > (indexLeft + (indexRight-indexLeft)*0.5) && checkIndex < line.length) {
          checkIndex++;
        }

        // make sure it stays on the line (line selection by set.position.y is quite reliable)
        if (checkIndex > line.length) {
          checkIndex = line.length;
        }

        // assign the calculated index
        this.State.cursor.local = checkIndex;

        // initialize index to the start of current line
        if (this.State.cursor.line) {
          this.State.cursor.index = this.getLineStartIndex(this.State.textItem._lines, this.State.cursor.line);
        }
      }
      // advance index to the "local" position (position on currecnt line)
      this.State.cursor.index += this.State.cursor.local;
    }
    else if (set.index != null) {
      this.State.cursor.index = set.index;
      this.State.cursor.line = this.getLineCount(this.State.textItem._lines, set.index);
      let lineStart = this.getLineStartIndex(this.State.textItem._lines, this.State.cursor.line);
      this.State.cursor.local = set.index - lineStart;
    }
    this.refreshUICursor(true);
  }

  createTextItem(point) {
    let Grid = this.SL.Utils.get('Grid');
    if (Grid) {
      // force rounding to left edge of whatever grid cell was clicked in - same trick as classic int(float(val + 0.5))
      let grid = Grid.getCurrentDefinition();
      point = point.subtract(new paper.Point({x: grid.cell.width/2.0, y: grid.cell.height/2.0}));
    }
    let textItem = this.SL.Paper.generatePaperItem({Source: this, Type: 'Text'}, paper.PointText, point);
    this.SL.Paper.applyStyle(textItem, this.config.font);
    this.SL.Paper.Item.addCustomMethod(textItem, 'SnapItem', this.snapTextItem, this);
    this.SL.Paper.Item.addCustomMethod(textItem, 'ScaleItem', this.scaleTextItem, this);
    this.snapTextItem(textItem);
    this.setTarget(textItem);
    this.calculateCursor({index: 0});
    this.refreshUITarget();
  }
  editTextItem(item, point) {
    this.setTarget(item);
    this.calculateCursor({position: {x: point.x - item.bounds.left, y: point.y - item.bounds.top}});
    this.refreshUITarget();
  }
  snapTextItem(item, args={}) {
    if (item && item.data && item.data.Type == 'Text') {
      let Snap = this.SL.Utils.get('Snap');
      if (Snap) {
        let point = Snap.Point(item.bounds.topLeft, {context: 'text-point', item: item, interactive: args.interactive});
        let delta = point.subtract(item.bounds.topLeft);
        item.translate(delta);
      }
      if (!args.interactive) {
        var snapSizes = this.config.interactive.allowSizes;
        let fontSize = parseFloat(item.fontSize);
        if (snapSizes.indexOf(fontSize) == -1) {
          let lastSize = snapSizes[0];
          for (let [index, size] of snapSizes.entries()) {
            if (!parseFloat(size)) {
              continue;
            }
            lastSize = size;
            if (index < snapSizes.length-1) {
              let sizeDiff = (snapSizes[index+1] - size);
              if (fontSize <= (size + sizeDiff/2.0)) {
                break;
              }
            }
          }
          if (lastSize) {
            item.fontSize = lastSize+'px';
          }
        }
      }
      else {
        // interactive
        if (parseFloat(item.fontSize) < this.config.interactive.minSize) {
          item.fontSize = this.config.interactive.minSize+'px';
        }
        else if (parseFloat(item.fontSize) > this.config.interactive.maxSize) {
          item.fontSize = this.config.interactive.maxSize+'px';
        }
      }
    }
    return item;
  }
  scaleTextItem(item, args) {
    if (item && item.data && item.data.Type == 'Text' && args && args.delta && args.edge) {
      let Geo = this.SL.Utils.get('Geo');
      if (!Geo) {
        return;
      }
      let Snap = this.SL.Utils.get('Snap');
      let delta = args.delta.clone();
      let edge = args.edge.clone();
      if (typeof edge == 'string') {
        edge = Geo.Direction.vector(edge);
      }

      // make true 0.0 values (rotate sometimes gives "almost" 0 values)
      if (Snap) {
        delta.x = Snap.Around(0.0, delta.x);
        delta.y = Snap.Around(0.0, delta.y);
        edge.x = Snap.Around(0.0, edge.x);
        edge.y = Snap.Around(0.0, edge.y);
      }

      // lock for single-axis scaling
      if (edge.x == 0.0) {
        delta.x = 0.0;
      }
      if (edge.y == 0.0) {
        delta.y = 0.0;
      }

      // determine the scale anchor point
      let anchor = this.getAnchorPoint(edge, item.bounds, true);
      if (!anchor) {
        anchor = item.bounds.topLeft;
      }

      // calculate the scaleAmount
      let scaleAmount = 0;
      if (args.point && this.Belt.Belt.Select.UI.outline) {
        let pointOffset = new paper.Point;
        var checkBounds = this.Belt.Belt.Select.UI.outline.handleBounds;
        if (edge.x < 0) {
          // left edge
          pointOffset.x = checkBounds.left - args.point.x;
        }
        else if (edge.x > 0) {
          // right edge
          pointOffset.x = args.point.x - checkBounds.right;
        }

        if (edge.y < 0) {
          // left edge
          pointOffset.y = checkBounds.top - args.point.y;
        }
        else if (edge.y > 0) {
          // right edge
          pointOffset.y = args.point.y - checkBounds.bottom;
        }

        if (pointOffset.y == 0) {
          scaleAmount = pointOffset.x;
        }
        else {
          scaleAmount = pointOffset.y;
        }
      }

      // perform the scale
      if (scaleAmount) {
        let targetSize = parseFloat(item.fontSize) + (scaleAmount*this.config.interactive.deltaMultiplier);
        item.fontSize = targetSize + 'px';
      }

      // check the anchor
      let anchorCheck = this.getAnchorPoint(edge, item.bounds, true);
      if (!anchorCheck) {
        anchorCheck = item.bounds.topLeft;
      }
      let anchorDelta = new paper.Point({
        x: (anchor.x - anchorCheck.x),
        y: (anchor.y - anchorCheck.y)
      });
      item.translate(anchorDelta);

      this.snapTextItem(item, {
        context: 'scale',
        interactive: true,
        size: true,
        position: false,
        scaleAmount: scaleAmount,
        anchor: anchor,
        anchorEdge: edge
      });

      // check the anchor
      anchorCheck = this.getAnchorPoint(edge, item.bounds, true);
      if (!anchorCheck) {
        anchorCheck = item.bounds.topLeft;
      }
      anchorDelta = new paper.Point({
        x: (anchor.x - anchorCheck.x),
        y: (anchor.y - anchorCheck.y)
      });
      item.translate(anchorDelta);
    }
  }
  insertText(text) {
    if (this.State.textItem && this.State.cursor.index != null) {
      let textContent = this.State.textItem.content || '';
      let position = this.State.cursor.index;
      textContent = textContent.substr(0, position) + text + textContent.substr(position);
      let point = this.State.textItem.bounds.topLeft.clone();
      this.State.textItem.content = textContent;
      this.State.textItem.bounds.topLeft.set(point);
      this.snapTextItem(this.State.textItem, {
        context: 'content'
      });
      this.shiftCursor(text.length);
      this.refreshUI();
    }
  }
  deleteText() {
    if (this.State.textItem && this.State.cursor.index != null) {
      let textContent = this.State.textItem.content || '';
      let position = this.State.cursor.index;
      let length = 1; // should we ever allow deleting range of text
      if (length > position) {
        length = position;
      }
      textContent = textContent.substr(0, position-length) + textContent.substr(position);
      let point = this.State.textItem.bounds.topLeft.clone();
      this.State.textItem.content = textContent;
      this.State.textItem.bounds.topLeft.set(point);
      this.snapTextItem(this.State.textItem, {
        context: 'content'
      });
      this.shiftCursor(-length);
      this.refreshUI();
    }
  }
  shiftCursor(shift) {
    if (this.State.cursor.index != null) {
      let index = this.State.cursor.index + shift;
      if (index < 0) {
        index = 0;
      }
      else if (this.State.textItem && this.State.textItem.content != null && index > this.State.textItem.content.length) {
        index = this.State.textItem.content.length;
      }
      if (index != this.State.cursor.index) {
        if (this.State.cursor.targetX != null) {
          this.State.cursor.targetX = null;
        }
        this.calculateCursor({index: index});
      }
    }
  }
  shiftLine(shift) {
    if (this.State.cursor.line != null) {
      let line = this.State.cursor.line + shift;
      if (line < 0) {
        line = 0;
      }
      else if (this.State.textItem && this.State.textItem._lines != null && line >= this.State.textItem._lines.length) {
        line = this.State.textItem._lines.length - 1;
      }
      if (line != this.State.cursor.line && this.State.textItem) {
        if (this.State.cursor.targetX == null && this.UI.cursor) {
          this.State.cursor.targetX = this.UI.cursor.position.x - this.State.textItem.bounds.left;
        }
        if (this.State.cursor.targetX != null) {
          let targetPosition = {
            x: this.State.cursor.targetX,
            y: line * this.State.textItem.leading
          };
          this.calculateCursor({position: targetPosition});
        }
      }
    }
  }

  onFrame(event) {
    if (this.UI.cursor) {
      if (this.config.ui.cursor.blink && this.UI.cursor.data) {
        if (this.UI.cursor.data.lastTick == null) {
          this.UI.cursor.data.lastTick = event.time;
        }
        else if (event.time - this.UI.cursor.data.lastTick > this.config.ui.cursor.blink) {
          this.UI.cursor.visible = !this.UI.cursor.visible;
          this.UI.cursor.data.lastTick = event.time;
        }
      }
      else if (!this.config.ui.cursor.blink && !this.UI.cursor.visible) {
        this.UI.cursor.visible = true;
      }
    }
  }
  onMouseMove(event) {
    if (this.isActive()) {
      this.setHoverTarget(this.Belt.State.Mouse.Hover.targetItem);
    }
  }
  onMouseDown(event) {
    if (this.isActive()) {
      if (event.event.button == 2) {
        this.finish();
      }
      else {
        let targetItem = this.Belt.State.Mouse.Hover.targetItem;
        if (targetItem && targetItem.data && targetItem.data.Type == 'Text') {
          this.editTextItem(targetItem, event.point);
        }
        else {
          this.createTextItem(event.point);
        }
      }
    }
  }
  onKeyDown(event) {
    if (this.isActive()) {
      if (event.key == 'left') {
        this.shiftCursor(-1);
      }
      else if (event.key == 'right') {
        this.shiftCursor(1);
      }
      else if (event.key == 'up') {
        this.shiftLine(-1);
      }
      else if (event.key == 'down') {
        this.shiftLine(1);
      }
      else if (event.key == 'backspace' && this.State.textItem.content.length) {
        this.deleteText();
      }
      else if (this.State.textItem && event.character) {
        this.insertText(event.character);
      }
    }
    else if (event.key == 't' && this.SL.UI.Keyboard.keyActive('control') && this.SL.UI.Keyboard.keyActive('t')) {
      this.start();
    }
  }
}
