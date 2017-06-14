import Panel from '../../core/panel.js';
export default class StampPanel extends Panel {
  constructor(SL, config) {
    super(SL, config);
  }
  refreshItem(item) {
    this.SL.Paper.Item.callCustomMethod(item, 'refresh');
  }
  setItemLabel(item, label) {
    if (item) {
      if (!item.data) {
        item.data = {};
      }
      item.data.label = label;
      this.refreshItem(item);
    }
  }
  setItemLabelPosition(item, labelPosition) {
    if (item) {
      if (!item.data) {
        item.data = {};
      }
      item.data.labelPosition = labelPosition;
      this.refreshItem(item);
    }
  }
  setData(data={}) {
    super.setData(data);
    if (this.data && this.data.item && this.data.item.data) {
      let itemData = this.data.item.data;
      if (itemData.Stamp) {
        this.setTitle(itemData.Stamp.name || itemData.Stamp.id);
      }
      if (this.DOM && this.DOM.labelInput) {
        this.DOM.labelInput.data('original', itemData.label);
        this.DOM.labelInput.val(itemData.label);
      }
      if (this.DOM && this.DOM.labelPositionGroup) {
        itemData.labelPosition = (itemData.labelPosition || 'center');
        this.DOM.labelPositionGroup.data('original', itemData.labelPosition);
        this.DOM.labelPositionGroup.children('input[name="item-label-position"]').val([itemData.labelPosition]);
      }
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

    // label input
    formGroup = $('<div class="form-group form-group-text input-item-label"></div>');
    formInput = $('<input type="text" name="item-label" id="'+form.attr('name')+'-item-label'+'" />');
    formGroup.append($('<label for="'+formInput.attr('id')+'">Label</label>'));
    formGroup.append(formInput);
    formContent.append(formGroup);
    this.DOM.labelInput = formInput;

    let originalValue = '';
    if (this.data && this.data.item && this.data.item.data && this.data.item.data.label) {
      originalValue = this.data.item.data.label;
    }
    this.DOM.labelInput.data('original', originalValue);
    this.DOM.labelInput.val(originalValue);

    // label position
    formGroup = $('<div class="form-group form-group-vertical form-group-position input-item-label-position"></div>');
    formInput = $('<div class="sl-position-input sl-position-5-way"></div>');
    formInput.append($('<input type="radio" name="item-label-position" class="sl-position position-center" value="center" id="'+form.attr('name')+'-item-label-position-center" />'));
    formInput.append($('<input type="radio" name="item-label-position" class="sl-position position-top" value="top" id="'+form.attr('name')+'-item-label-position-top" />'));
    formInput.append($('<input type="radio" name="item-label-position" class="sl-position position-right" value="right" id="'+form.attr('name')+'-item-label-position-right" />'));
    formInput.append($('<input type="radio" name="item-label-position" class="sl-position position-bottom" value="bottom" id="'+form.attr('name')+'-item-label-position-bottom" />'));
    formInput.append($('<input type="radio" name="item-label-position" class="sl-position position-left" value="left" id="'+form.attr('name')+'-item-label-position-left" />'));
    formGroup.append('<label>Label Position</label>');
    formGroup.append(formInput);
    formContent.append(formGroup);
    this.DOM.labelPositionGroup = formInput;
    originalValue = 'center';
    if (this.data && this.data.item && this.data.item.data && this.data.item.data.labelPosition) {
      originalValue = this.data.item.data.labelPosition;
    }
    this.DOM.labelPositionGroup.data('original', originalValue);
    this.DOM.labelPositionGroup.children('input[name="item-label-position"]').val([originalValue]);

    form.append(formContent);

    // buttons
    formContent = $('<div class="form-footer"></div>');
    formGroup = $('<div class="form-group form-buttons"></div>');
    formInput = $('<button type="button" class="save"><i class="icon icon-check"></i> Save</button>');
    formInput.on('click', (event) => {
      if (this.data && this.data.item) {
        if (this.DOM.labelInput) {
          this.setItemLabel(this.data.item, this.DOM.labelInput.val());
        }
        if (this.DOM.labelPositionGroup) {
          this.setItemLabelPosition(this.data.item, this.DOM.labelPositionGroup.children('input[name="item-label-position"]:checked').val());
        }
      }
      this.close();
    });
    formGroup.append(formInput);

    formInput = $('<button type="button" class="cancel"><i class="icon icon-close"></i> Cancel</button>');
    formInput.on('click', (event) => {
      if (this.data && this.data.item) {
        if (this.DOM.labelInput) {
          this.setItemLabel(this.data.item, this.DOM.labelInput.data('original'));
        }
        if (this.DOM.labelPositionGroup) {
          this.setItemLabelPosition(this.data.item, this.DOM.labelPositionGroup.data('original'));
        }
      }
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
