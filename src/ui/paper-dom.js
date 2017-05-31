import UIComponent from '../core/ui-component.js';
export default class PaperDOM extends UIComponent {
  constructor(SL, config, UI) {
    super(SL, config, UI);
    config = this.config;
    this.DOM = {};
    this.assertDOM();
  }
  get type() {
    return 'UI.PaperDOM';
  }
  get isBlocked() {
    return !!this.blockCanvas;
  }

  assertDOM() {
    if (!this.DOM.paperDOM) {
      this.DOM.paperDOM = $('<div class="sl-paper-dom"></div>)');
      this.UI.DOM.canvas.before(this.DOM.paperDOM);
    }
    return !!(this.DOM.paperDOM);
  }
  destroyDOM() {
    this.removeElement('*');
    if (this.DOM.paperDOM) {
      this.DOM.paperDOM.remove();
      this.DOM.paperDOM = undefined;
      return true;
    }
  }
  addElement(element, blockCanvas=false) {
    if (element) {
      this.assertDOM();
      if (!this.DOM.elements) {
        this.DOM.elements = [];
      }
      if (this.DOM.elements.indexOf(element) == -1) {
        this.DOM.paperDOM.append(element);
        this.DOM.elements.push(element);
      }
      if (blockCanvas) {
        this.DOM.paperDOM.css('width', '100%');
        this.blockCanvas = true;
      }
    }
  }
  removeElement(element='*') {
    if (!this.DOM.paperDOM) {
      return;
    }
    if (typeof element == 'string') {
      this.DOM.paperDOM.children(element).each((idx, element) => {
        this.removeElement(element);
      });
    }
    else if (typeof element.remove == 'function') {
      element.remove();
      if (this.DOM.elements) {
        let elementIdx = this.DOM.elements.indexOf(element);
        if (elementIdx != -1) {
          this.DOM.elements.splice(elementIdx, 1);
        }
      }
    }
    if (!this.DOM.elements || !this.DOM.elements.length) {
      this.DOM.paperDOM.css('width', '0px');
      this.blockCanvas = false;
    }
  }
}
