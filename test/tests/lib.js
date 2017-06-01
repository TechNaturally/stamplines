import {default as StampLines} from '../../src/stamplines.js';
import {default as PaperCanvas} from '../../src/core/paper-canvas.js';
import {default as CoreComponent} from '../../src/core/component.js';
import {default as CorePalette} from '../../src/core/palette.js';
import {default as CorePanel} from '../../src/core/panel.js';
import {default as CoreTool} from '../../src/core/tool.js';
import {default as UIComponent} from '../../src/core/ui-component.js';
import {default as CoreUtil} from '../../src/core/util.js';

import {default as Palette} from '../../src/palette/palette.js';
import {default as PaletteManager} from '../../src/palette/manager.js';
import {Stamps as StampPalette, Lines as LinePalette} from '../../src/palette/palettes/_index.js';

import {default as Panel} from '../../src/panel/panel.js';
import {default as PanelManager} from '../../src/panel/manager.js';
import {StampPanel, LinePanel} from '../../src/panel/panels/_index.js';

import {default as ToolBelt} from '../../src/tools/toolbelt.js';
import {Select, Move, Scale, Rotate, Delete} from '../../src/tools/core/_index.js';
import {LineTool, CreateLine, EditLine} from '../../src/tools/lines/_index.js';
import {CreateStamp} from '../../src/tools/stamps/_index.js';
import {Connect} from '../../src/tools/connect/_index.js';

import {default as UI} from '../../src/ui/ui.js';
import {default as Dock} from '../../src/ui/dock.js';
import {default as Mouse} from '../../src/ui/mouse.js';
import {default as Keyboard} from '../../src/ui/keyboard.js';
import {default as CursorManager} from '../../src/ui/cursor-manager.js';
import {default as PaperDOM} from '../../src/ui/paper-dom.js';

import {default as Utils} from '../../src/util/utils.js';
import {Bounds, Geo, Grid, RemoteLoader, Snap, ConfigParser, Identity, URL} from '../../src/util/utils/_index.js';
import {default as NamedObjectMap} from '../../src/util/classes/named-object-map.js';

export default {
  Core: {
    StampLines: StampLines,
    PaperCanvas: PaperCanvas,
    Component: CoreComponent,
    Palette: CorePalette,
    Panel: CorePanel,
    Tool: CoreTool,
    UIComponent: UIComponent,
    Util: CoreUtil
  },
  Palette: {
    Palette: Palette,
    Manager: PaletteManager,
    StampPalette: StampPalette,
    LinePalette: LinePalette
  },
  Panel: {
    Panel: Panel,
    Manager: PanelManager,
    StampPanel: StampPanel,
    LinePanel: LinePanel
  },
  Tools: {
    ToolBelt: ToolBelt,
    Core: {
      Select: Select,
      Move: Move,
      Scale: Scale,
      Rotate: Rotate,
      Delete: Delete
    },
    Lines: {
      LineTool: LineTool,
      CreateLine: CreateLine,
      EditLine: EditLine
    },
    Stamps: {
      CreateStamp: CreateStamp
    },
    Connect: {
      Connect: Connect
    }
  },
  UI: {
    UI: UI,
    Dock: Dock,
    Mouse: Mouse,
    Keyboard: Keyboard,
    CursorManager: CursorManager,
    PaperDOM: PaperDOM
  },
  Utils: {
    Classes: {
      NamedObjectMap: NamedObjectMap
    },
    Utils: Utils,
    Bounds: Bounds,
    Geo: Geo,
    Grid: Grid,
    RemoteLoader: RemoteLoader,
    Snap: Snap,
    ConfigParser: ConfigParser,
    Identity: Identity,
    URL: URL
  }
};
