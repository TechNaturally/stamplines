import Panel from '../../core/panel.js';
export default class StampPanel extends Panel {
  constructor(SL, config) {
    super(SL, config);
  }
  refreshItem(item) {
    this.SL.Paper.Item.callCustomMethod(item, 'refresh');
  }
  setData(data={}) {
    super.setData(data);
    if (this.data && this.data.item && this.data.item.data) {
      let itemData = this.data.item.data;
      if (itemData.Stamp) {
        this.setTitle(itemData.Stamp.name || itemData.Stamp.id);
      }
      // read any other itemData into Panel
    }
    this.positionPanel();
  }
  getPanelClass() {
    let result = super.getPanelClass();
    result.push('sl-stamp-panel');
    return result;
  }
  generateDOM() {
    let panel = super.generateDOM();
    let content = this.assertDOMContent();
    let item;
    if (this.data && this.data.item) {
      item = this.data.item;
    }

    // build the form
    let form = $('<form class="sl-form"></form>');
    form.on('submit', (event) => {
      return false;
    });
    form.attr('name', this.getPanelID()+'-form');

    // build form elements
    let formContent, formGroup, formInput;

    formContent = $('<div class="form-content"></div>');

    // build any this.DOM.inputs and formContent.append(input); them
    // to cache reset value use: input.data('original', originalValue);
    // to initialize input use: input.val(originalValue);

    form.append(formContent);

    // buttons
    formContent = $('<div class="form-footer"></div>');
    formGroup = $('<div class="form-group form-buttons"></div>');
    formInput = $('<button type="button" class="save"><i class="icon icon-check"></i> Save</button>');
    formInput.on('click', (event) => {
      // read user input as input.val()
      this.close();
    });
    formGroup.append(formInput);

    formInput = $('<button type="button" class="cancel"><i class="icon icon-close"></i> Cancel</button>');
    formInput.on('click', (event) => {
      // reset input to input.data('original')
      this.close();
    });
    formGroup.prepend(formInput);
    formContent.append(formGroup);
    form.append(formContent);
    this.resetDOMControlCloseButton();

    // add the form to the panel
    content.append(form);

    this.positionPanel();

    return panel;
  }
}
