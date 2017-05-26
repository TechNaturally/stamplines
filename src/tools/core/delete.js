import Tool from '../../core/tool.js';
export class Delete extends Tool {
  constructor(SL, config, Belt) {
    super(SL, config, Belt);
  }
  DeleteSelected() {
    let Select = this.Belt.Belt.Select;
    let Selected = Select.Items.slice();
    for (let item of Selected) {
      Select.Unselect(item);
      this.SL.Paper.destroyPaperItem(item);
    }
    this.Belt.refresh();
  }
  onKeyUp(event) {
    if (event.key == 'backspace') {
      this.DeleteSelected();
    }
  }
}
