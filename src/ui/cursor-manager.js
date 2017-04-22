import UIComponent from '../core/ui-component.js';
export default class CursorManager extends UIComponent {
  constructor(SL, config, UI) {
    super(SL, config, UI);
    this.activeCursor = undefined;
    this.cursorTypes = {};
    this.customCursors = {};
    this.register();
    this.configure();
  }
  get type() {
    return 'UI.CursorManager';
  }
  configure(config) {
    config = super.configure(config);
    let types = $.extend(true, {
      'img': {
        useFor: (cursor) => {
          return !!(cursor && cursor.src);
        },
        'dom': '`<img class="sl-cursor" src="${cursor.src}" />`',
        'activateAs': '`img-${cursor.src}`'
      },
      'icon': {
        useFor: (cursor) => {
          return !!(cursor && cursor.icon);
        },
        'dom': '`<div class="sl-cursor icon icon-${cursor.icon}"></div>`',
        'activateAs': '`icon-${cursor.icon}`'
      }
    }, config.types);
    this.addCursorTypes(types);
    this.loadCustomCursors(config.custom);
    if (!this.activeCursor) {
      this.activateCursor();
    }
  }
  onMouseMove(event) {
    if (event && this.UI.DOM.cursor) {
      let pt = {
        x: event.event.clientX,
        y: event.event.clientY
      };
      pt.x -= this.UI.DOM.cursor.width()/2.0;
      pt.y -= this.UI.DOM.cursor.height()/2.0;
      this.UI.DOM.cursor.css('left', `${pt.x}px`);
      this.UI.DOM.cursor.css('top', `${pt.y}px`);
      if (this.SL.DOM.canvas.is(':hover')) {
        this.UI.DOM.cursor.show();
      }
    }
  }
  onMouseDrag(event) {
    this.onMouseMove(event);
  }
  onMouseDown(event) {}
  onMouseUp(event) {}
  onClick(event) {}
  onDoubleClick(event) {}
  activateCursor(cursor) {
    cursor = cursor || this.config.default || 'crosshair';
    if (typeof cursor == 'string' && this.customCursors[cursor]) {
      cursor = this.customCursors[cursor];
    }
    if (typeof cursor == 'object') {
      let cursorType;
      for (name in this.cursorTypes) {
        if (this.cursorTypes[name].useFor(cursor)) {
          cursorType = this.cursorTypes[name];
          break;
        }
      }
      if (cursorType) {
        let activateAs = eval(cursorType.activateAs);
        if (this.activeCursor != activateAs) {
          this.deactivateCursor();
          if (cursorType.dom) {
            this.UI.DOM.cursor = $(eval(cursorType.dom));
            this.UI.DOM.cursor.css('top', '-9999px');
            this.UI.DOM.cursor.css('left', '-9999px');
            this.UI.DOM.cursor.hide();
            $('body').append(this.UI.DOM.cursor);
            this.SL.DOM.canvas.css('cursor', 'none');
            this.SL.DOM.canvas.on('mouseenter.sl-cursor', (event) => {
              if (this.UI.DOM.cursor) {
                this.UI.DOM.cursor.show();
              }
            });
            this.SL.DOM.canvas.on('mouseleave.sl-cursor', (event) => {
              if (this.UI.DOM.cursor) {
                this.UI.DOM.cursor.hide();
              }
            });
            this.onMouseMove(this.UI.Mouse.State.lastMove);
          }
          this.activeCursor = activateAs;
        }
      }
    }
    else if (typeof cursor == 'string' && cursor) {
      this.deactivateCursor();
      this.SL.DOM.canvas.css('cursor', cursor);
      this.activeCursor = cursor;
    }
  }
  deactivateCursor () {
    if (this.UI.DOM.cursor) {
      this.SL.DOM.canvas.off('.sl-cursor');
      this.UI.DOM.cursor.remove();
      this.UI.DOM.cursor = undefined;
    }
    this.SL.DOM.canvas.css('cursor', '');
    let cursor = this.config.default || 'crosshair';
    if (this.activeCursor != cursor) {
      this.SL.DOM.canvas.css('cursor', cursor);
      this.activeCursor = cursor;
    }
  }
  addCursorTypes(definitions) {
    for (let name in definitions) {
      this.addCursorType(name, definitions[name]);
    }
  }
  addCursorType(type, definition) {
    this.cursorTypes[type] = definition;
  }
  loadCustomCursors(definitions, useOriginal=false) {
    for (let name in definitions) {
      let definition = definitions[name];
      if (!useOriginal) {
        definition = $.extend({}, definition);
        for (let prop in definition) {
          if (typeof definition[prop] == 'object') {
            definition[prop] = $.extend({}, definition[prop]);
          }
        }
      }
      this.addCustomCursor(name, definition);
    }
  }
  addCustomCursor(name, definition) {
    if (name) {
      definition = definition || {};
      this.customCursors[name] = definition;
    }
  }
}
