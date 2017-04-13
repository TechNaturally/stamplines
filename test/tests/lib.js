import {default as CoreComponent} from '../../src/core/component.js';
import {default as CorePalette} from '../../src/core/palette.js';
import {default as CoreTool} from '../../src/core/tool.js';
import {default as CoreUtil} from '../../src/core/util.js';

import {default as Palette} from '../../src/palette/palette.js';
import {StampPalette, LinePalette} from '../../src/palette/palettes/_index.js';

import {default as ToolBelt} from '../../src/tools/toolbelt.js';
import {Select, Scale, Rotate} from '../../src/tools/core/_index.js';
import {CreateLine, EditLine} from '../../src/tools/lines/_index.js';
import {CreateStamp} from '../../src/tools/stamps/_index.js';

import {default as UI} from '../../src/ui/ui.js';
import {default as Mouse} from '../../src/ui/mouse.js';
import {default as Dock} from '../../src/ui/dock.js';

import {default as Utils} from '../../src/util/utils.js';
import {Grid} from '../../src/util/utils/_index.js';

export default {
	Core: {
		Component: CoreComponent,
		Palette: CorePalette,
		Tool: CoreTool,
		Util: CoreUtil
	},
	Palette: {
		Palette: Palette,
		StampPalette: StampPalette,
		LinePalette: LinePalette
	},
	Tools: {
		ToolBelt: ToolBelt,
		Core: {
			Select: Select,
			Scale: Scale,
			Rotate: Rotate
		},
		Lines: {
			CreateLine: CreateLine,
			EditLine: EditLine
		},
		Stamps: {
			CreateStamp: CreateStamp
		}
	},
	UI: {
		UI: UI,
		Mouse: Mouse,
		Dock: Dock
	},
	Util: {
		Utils: Utils,
		Grid: Grid
	}
};
