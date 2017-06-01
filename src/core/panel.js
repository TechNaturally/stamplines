import Component from './component.js';
export default class Panel extends Component {
  constructor(SL, config) {
    super(SL, config);
    this.DOM = {};
  }
  reset() {
    super.reset();
    this.resetDOM();
  }

  get element() {
    return (this.DOM && this.DOM.panel);
  }

  close() {
    if (this.manager) {
      this.manager.closePanel(this);
    }
    else {
      this.reset();
    }
  }

  positionPanel() {
    if (this.DOM && this.DOM.panel) {
      let bounds = this.SL.Paper.view.bounds.clone();
      bounds = bounds.scale(0.5, 0.6);
      this.DOM.panel.css('top', '10%');
      this.DOM.panel.css('left', bounds.left+'px');
      this.DOM.panel.css('width', bounds.width+'px');
    }
  }

  setData(data={}) {
    this.data = data;
  }
  setTitle(title='') {
    if (title) {
      if (!this.DOM.title) {
        this.assertDOMHeader();
        this.DOM.title = $(`<h3 class="panel-title">${title}</h3>`);
        this.DOM.header.prepend(this.DOM.title);
      }
    }
    else if (this.DOM && this.DOM.title) {
      this.DOM.title.remove();
      this.DOM.title = undefined;
      delete this.DOM.title;
    }
  }

  getPanelClass() {
    return ['sl-panel'];
  }
  getPanelID() {
    if (this.id) {
      return `sl-panel-${this.id}`;
    }
  }
  assertDOM() {
    if (!this.DOM) {
      this.DOM = {};
    }
  }
  assertDOMHeader() {
    this.assertDOM();
    if (!this.DOM.header) {
      this.DOM.header = $('<div class="panel-header"></div>');
      if (this.DOM.panel) {
        this.DOM.panel.prepend(this.DOM.header);
      }
    }
    return this.DOM.header;
  }
  assertDOMContent() {
    this.assertDOM();
    if (!this.DOM.content) {
      this.DOM.content = $('<div class="panel-content"></div>');
      if (this.DOM.panel) {
        this.DOM.panel.append(this.DOM.content);
      }
    }
    return this.DOM.content;
  }
  assertDOMControls() {
    this.assertDOM();
    if (!this.DOM.controls) {
      this.DOM.controls = $('<div class="panel-controls"></div>');
      this.DOM.panel.append(this.DOM.controls);
    }
    if (!this.DOM.Control) {
      this.DOM.Control = {};
    }
  }
  assertDOMControlCloseButton() {
    this.assertDOMControls();
    if (!this.DOM.Control.closeButton) {
      this.DOM.Control.closeButton = $('<button><i class="icon icon-close"></i></button>');
      this.DOM.Control.closeButton.on('click', (event) => {
        this.close();
      });
      this.DOM.controls.append(this.DOM.Control.closeButton);
    }
  }
  generateDOM() {
    this.assertDOM();
    if (this.DOM.panel) {
      return this.DOM.panel;
    }
    this.DOM.panel = $('<div class="sl-panel"></div>');
    this.DOM.panel.addClass(this.getPanelClass().join(' '));
    this.DOM.panel.attr('id', this.getPanelID());

    // add header if it's waiting
    if (this.DOM.header) {
      this.DOM.panel.append(this.DOM.header);
    }

    // content
    let content = this.assertDOMContent();

    // position and size
    let bounds = this.SL.Paper.view.bounds.clone();
    bounds = bounds.scale(0.5, 0.6);
    this.DOM.panel.css('top', '10%');
    this.DOM.panel.css('left', bounds.left+'px');
    this.DOM.panel.css('width', bounds.width+'px');

    // panel controls
    this.assertDOMControls();

    // close button
    this.assertDOMControlCloseButton();

    this.positionPanel();
    
    return this.DOM.panel;
  }
  resetDOM() {
    if (!this.DOM) {
      return;
    }
    this.resetDOMPanel();
  }
  resetDOMTitle() {
    if (this.DOM.title) {
      this.DOM.title.remove();
      this.DOM.title = undefined;
    }
  }
  resetDOMHeader() {
    this.resetDOMTitle();
    if (this.DOM.header) {
      this.DOM.header.remove();
      this.DOM.header = undefined;
    }
  }
  resetDOMPanel() {
    this.resetDOMHeader();
    this.resetDOMControls();
    if (this.DOM.panel) {
      this.DOM.panel.remove();
      this.DOM.panel = undefined;
    }
  }
  resetDOMControls() {
    this.resetDOMControlCloseButton();
    if (this.DOM.controls) {
      this.DOM.controls.remove();
      this.DOM.controls = undefined;
    }
  }
  resetDOMControlCloseButton() {
    if (this.DOM.Control && this.DOM.Control.closeButton) {
      this.DOM.Control.closeButton.remove();
      this.DOM.Control.closeButton = undefined;
    }
  }
}
