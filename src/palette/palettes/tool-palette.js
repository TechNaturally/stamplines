import Palette from '../../core/palette.js';
export default class ToolPalette extends Palette {
  constructor(SL, config) {
    super(SL, config);
    this.id = 'Tools';
    this.initialized = true;
    this.configure();
  }
  get paletteType() {
    return 'Tools';
  }
  generateDOMItem(item) {
    let toolName = item.tool || item.id;
    let tool = this.SL.Tools.Belt[toolName];
    if (!tool) {
      throw `Could not add tool to palette.  Tool "${toolName}" was not found.`;
    }
    let itemName = (item.name || tool.name || item.id);
    let toolButton = $('<button type="button"></button>');
    toolButton.addClass('sl-palette-button');
    toolButton.addClass('sl-tool-button');
    toolButton.addClass('sl-tool-'+item.id);
    toolButton.data('Tool', tool);
    toolButton.attr('alt', itemName);
    toolButton.attr('title', itemName);
    toolButton.click((event) => {
      let target = $(event.currentTarget);
      let tool = target.data('Tool');
      if (tool) {
        tool.start();
      }
    });
    let icons = item.icon ? item.icon.split(' ') : [''];
    for (let icon of icons) {
      let toolContent = $('<i class="icon"></i>');
      if (icon) {
        toolContent.addClass(icon);
      }
      toolContent.addClass('sl-palette-content sl-palette-icon');
      toolContent.addClass('sl-tool-content sl-tool-icon');
      toolContent.attr('draggable', false);
      toolButton.append(toolContent);
    }
    toolButton.data('activeClass', 'sl-button-active sl-tool-active');
    tool.assignDOM('PaletteButton', toolButton);
    return toolButton;
  }
}
