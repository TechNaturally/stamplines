var stamplines = (function() {
	function StampLines(canvas, config){
		var self = this;

		var SL = {
			assertPaper: function(){
				if(paper != undefined){
					return true;
				}
				SL.error('Could not find Paper.js library');
				return false;
			},
			config: function(setting, value){
				if(value === undefined){
					return self.config[setting];
				}
				self.config[setting] = value;
			},
			error: function(message){
				console.error('StampLines: '+message);
			},
			init: function(canvas, config){
				self.canvas = $(canvas);
				self.stamps = [];
				self.tools = {};

				self.config = $.extend({
					'grid.show': true,
					'grid.size': 25,
					'grid.snap': true,
					'rotate.slices': (360/45),
					'rotate.snap': true,
					'selection.padding': 10
				}, config);

				if(SL.Canvas.isSet()){
					self.canvasID = self.canvas.attr('id');
				}

				if(SL.assertPaper()){
					if(SL.Canvas.isSet()){
						paper.setup(self.canvas[0]);
						SL.Canvas.init();
					}

					Util.init();
					UI.init();
					Tools.init();
				}
			},
			Canvas: {
				callbacks: {
					resize: {}
				},
				init: function(){
					paper.view.onResize = SL.Canvas.resized;
				},
				isResizeable: function() {
					return (SL.Canvas.isSet() && self.canvas.attr('resize') != undefined);
				},
				isSet: function(){
					return (self.canvas && self.canvas.length);
				},
				offResize: function(handlerID){
					if(handlerID && this.callbacks.resize[handlerID]){
						this.callbacks.resize[handlerID] = undefined;
					}
				},
				onResize: function(handlerID, callback){
					if(handlerID){
						this.callbacks.resize[handlerID] = callback;
					}
				},
				resized: function(event){
					console.log('CANVAS RESIZED =>', event);
					for(var handlerID in this.callbacks.resize){
						var callback = this.callbacks.resize[handlerID];
						if(typeof callback == 'function'){
							callback(event);
						}
					}
				},
				size: function(){
					if(!this.canvasSize){
						this.canvasSize = new paper.Size();
					}
					var width = 0;
					var height = 0;
					if(SL.Canvas.isSet()){
						width = self.canvas.width();
						height = self.canvas.height();
					}
					this.canvasSize.set(width, height);
					return this.canvasSize;
				}
			}
		};

		var Stamps = {
			add: function(stamp, position){
				if(stamp.symbol){
					var halfSize = Util.Calc.halfSize(stamp.symbol.item);
					var canvasSize = SL.Canvas.size();
					if(!position){
						var min, max;

						// random x
						min = halfSize.width;
						max = (canvasSize.width ? (canvasSize.width - halfSize.width) : min);
						var x = Math.floor(Math.random() * (max - min + 1)) + min;

						// random y
						min = halfSize.height;
						max = (canvasSize.height ? (canvasSize.height - halfSize.width) : min);
						var y = Math.floor(Math.random() * (max - min + 1)) + min;

						position = new paper.Point(x, y);
					}
					else{
						position = position.add(new paper.Point(halfSize.width, halfSize.height));
					}

					// lock it to whatever Bounding filters are active
					position = Util.Bound.position(position, stamp.symbol.item);

					// place an instance of the symbol
					stamp.symbol.place(position);
				}
			},
			load: function(stampNames, stampPath, callback){
				var processed = [];
				for(var i=0; i < stampNames.length; i++){
					var stampName = stampNames[i];
					$.ajax(stampPath+stampName+'.json', {
						context: {
							name: stampName,
							path: stampPath
						}
					})
					.done(function stampLoaded(data){
						if(data){
							if(data.id){
								delete data.id;
							}
							if(data.image){
								data.image = this.path+data.image;
							}
						}
						var stamp = $.extend(
							{
								id: this.name,
								name: this.name,
								image: this.path+this.name+'.svg'
							}, data);

						$.ajax(stamp.image, {
							context: {
								stamp: stamp
							}
						})
						.done(function stampImageLoaded(svg){
							if(SL.assertPaper()){
								// import the loaded SVG into a symbol
								this.stamp.symbol = new paper.Symbol( paper.project.importSVG(svg) );
							}
						})
						.fail(function stampImageNotFound(){
							SL.error('Could not load stamp: "'+stamp.id+'" image => "'+stamp.image+'"');
							this.stamp.image = undefined;
						})
						.always(function stampImageProcessed(){
							self.stamps.push(this.stamp);
							Stamps.sort(stampNames);
						});
					})
					.fail(function stampNotFound(){
						SL.error('Could not load stamp: "'+this.name+'.json"');
					})
					.always(function stampProcessed(){
						processed.push(this.name);
						if(processed.length >= stampNames.length){
							if(typeof callback == 'function'){
								callback();
							}
						}
					});
				}
			},
			refreshPanel: function(){
				if(UI.Dock.isSet()){
					if(!self.stampsPanel){
						self.stampsPanel = $('<ul class="sl-stamps"></ul>');
						var stampsPanelWrap = $('<div class="sl-stamps-wrap sl-dock-scroll"></div>');
						stampsPanelWrap.append(self.stampsPanel);
						UI.dock.append(stampsPanelWrap);
					}
					self.stampsPanel.empty();
					for(var i=0; i < self.stamps.length; i++){
						var stamp = self.stamps[i];
						var newStampButton = $('<a class="sl-stamp-button"></a>');
						newStampButton.data('stamp', stamp);
						newStampButton.click(function stampButtonClicked(){
							Stamps.add($(this).data('stamp'));
						});

						var newStampContent = $('<div class="sl-stamp-content sl-stamp-img" draggable="true"></div>');
						if(stamp.image){
							newStampContent.append($('<img src="'+stamp.image+'" />'));
						}
						newStampContent.on('dragstart', function stampImageDragStart(event){
							var elemBounds = this.getBoundingClientRect();
							var elemPoint = new paper.Point(elemBounds.left, elemBounds.top);
							$(this).data('dragOffset', elemPoint.subtract(new paper.Point(event.clientX, event.clientY)));
						});
						newStampContent.on('dragend', function stampImageDragEnd(event){
							var target = $(this).closest('.sl-stamp-button');
							var stamp = target.data('stamp');
							if(stamp && stamp.id && stamp.symbol){
								var dropOffset = new paper.Point(0, 0);
								var dragImg = $(this).find('img').first();
								if(dragImg.length){
									dropOffset.set($(this)[0].offsetLeft-dragImg[0].offsetLeft, $(this)[0].offsetTop-dragImg[0].offsetTop);
								}

								var dropPoint = new paper.Point(event.clientX, event.clientY);
								var canvasPoint = new paper.Point(0, 0);

								if(SL.Canvas.isSet()){
									var canvasBounds = self.canvas[0].getBoundingClientRect();
									canvasPoint.set(canvasBounds.left, canvasBounds.top);
								}

								var spawnPoint = dropPoint.subtract(canvasPoint).subtract(dropOffset);

								var offsetPoint = $(this).data('dragOffset');
								if(offsetPoint){
									spawnPoint = spawnPoint.add(offsetPoint);
								}

								Stamps.add(stamp, spawnPoint);
							}
						});
						newStampButton.append(newStampContent);

						newStampContent = $('<span class="sl-stamp-content">'+(stamp.name || stamp.id)+'</span>');
						newStampButton.append(newStampContent);


						var newStampItem = $('<li class="sl-stamp"></li>');
						newStampItem.append(newStampButton);

						self.stampsPanel.append(newStampItem);
					}
				}
			},
			sort: function(idOrder){
				self.stamps.sort(function(a, b){
					var idxA = idOrder.indexOf(a.id);
					var idxB = idOrder.indexOf(b.id);
					if(idxA == -1 && idxB == -1){
						return 0;
					}
					else if(idxA == -1){
						return 1;
					}
					else if(idxB == -1){
						return -1;
					}
					return (idxA - idxB);
				});
				Stamps.refreshPanel();
			}

		};

		var Tools = {
			init: function(){
				if(SL.assertPaper()){
					if(UI.Dock.isSet() && !self.toolsPanel){
						self.toolsPanel = $('<ul class="sl-tools"></ul>');
						UI.dock.prepend(self.toolsPanel);
					}

					Tools.initMaster();
					if(self.tools.master){
						self.tools.master.activate();
					}
				}
			},
			addButton: function(toolID, icon, callback){
				if(self.toolsPanel){
					var newButton = $('<a class="sl-tool-button"></a>');
					newButton.click(callback);
					newButton.append($('<span class="sl-tool-icon icon-'+icon+'"></span>'));
					var newTool = $('<li class="sl-tool sl-tool-'+toolID+'"></li>');
					newTool.append(newButton);
					self.toolsPanel.append(newTool);
				}
			},
			initMaster: function(){
				var MT = new paper.Tool();
				MT.Mouse = { Hover: {} };
				MT.Selection = {
					Group: new paper.Group(),
					add: function(item){
						if(item && !this.contains(item)){
							this.Group.appendBottom(item);
							this.refresh();
							return true;
						}
					},
					contains: function(item){
						return (item && this.Group.isChild(item));
					},
					count: function(){
						return this.Group.children.length;
					},
					refresh: function(){
						this.Group.selected = (this.count() > 1);
						if(this.count()){
							if(!MT.UI.outline){
								MT.UI.outline = new paper.Shape.Rectangle();
							}
							MT.UI.outline.selected = true;
							MT.UI.outline.selectedColor = ((this.count() > 1) ? '#00EC9D' : '#009DEC');
							MT.UI.outline.set({position: this.Group.bounds.center, size: this.Group.bounds.size.add(SL.config('selection.padding'))});
							MT.UI.enable(MT.UI.outline);

							this.Group.bringToFront();
							MT.UI.Group.bringToFront();
						}
						else{
							MT.UI.disable(MT.UI.outline);
							MT.UI.outline = undefined;
						}
					},
					remove: function(item){
						if(item){
							item.selected = false;
							if(this.contains(item)){
								item.remove();
								paper.project.activeLayer.addChild(item);
								this.refresh();
							}
						}
					},
					reset: function(){
						var unselectedItems = this.Group.removeChildren();
						for(var i=0; i < unselectedItems.length; i++){
							var unselected = unselectedItems[i];
							unselected.selected = false;
							paper.project.activeLayer.addChild(unselected);
						}
						this.refresh();
					}
				};
				MT.UI = {
					Group: new paper.Group(),
					add: function(item){
						if(item && !this.contains(item)){
							this.Group.appendTop(item);
							return true;
						}
					},
					contains: function(item){
						return (item && this.Group.isChild(item));
					},
					disable: function(item){
						if(item){
							item.selected = false;
							item.visible = false;
							item.remove();
						}
					},
					enable: function(item){
						if(item){
							item.visible = true;
							this.add(item);
						}
					},
					remove: function(item){
						if(item && this.contains(item)){
							item.remove();
							paper.project.activeLayer.addChild(item);
						}
					}
				};

				MT.activate = function(util){
					if(this.active != util){
						if(this.active){
							this.active.active = false;
							if(typeof this.active.deactivate == 'function'){
								this.active.deactivate();
							}
						}
						this.active = util;
						if(this.active){
							this.active.active = true;
							if(typeof this.active.activate == 'function'){
								this.active.activate();
							}
						}
					}
				};
				MT.utilsHandle = function(func, args){
					for(var name in this.Utils){
						var util = this.Utils[name];
						if(typeof util[func] == 'function'){
							return util[func](args);
						}
					}
				};
				MT.utilsHandleActive = function(func, args){
					if(this.active && typeof this.active[func] == 'function'){
						this.active[func](args);
					}
				};

				MT.Utils = {
					Select: {
						activate: function(){
							this.refreshCursor();
						},
						activatePriority: function(point){
							return 10;
						},
						refreshCursor: function(){
							if(this.active){
								var cursor = 'default';
								if(this.multi && !MT.Mouse.Hover.targetLocked){
									if(MT.Mouse.Hover.targetSelected && MT.Selection.count() > 1){
										cursor = 'minus';
									}
									else if(MT.Mouse.Hover.targetItem && !MT.Mouse.Hover.targetSelected){
										cursor = 'plus';
									}
								}
								UI.Cursor.activate(cursor);
							}
						},
						onKeyDown: function(event){
							if(event.key == 'shift'){
								this.multi = true;
								this.refreshCursor();
								MT.checkActive();
							}
						},
						onKeyUp: function(event){
							if(event.key == 'shift'){
								this.multi = false;
								this.refreshCursor();
								MT.checkActive();
							}
						},
						onMouseMove: function(event){
							MT.Mouse.Hover.targetSelected = (MT.Mouse.Hover.targetItem && MT.Selection.contains(MT.Mouse.Hover.targetItem));
							MT.Mouse.Hover.targetUnselected = (MT.Mouse.Hover.targetItem && !MT.Mouse.Hover.targetSelected);

							MT.Mouse.Hover.selection = (MT.Mouse.point && MT.UI.outline && MT.UI.outline.contains(MT.Mouse.point));

							this.refreshCursor();
							MT.checkActive();
						},
						onMouseDown: function(event){
							if(this.active){
								if(MT.Mouse.Hover.targetItem && !MT.Mouse.Hover.targetLocked){
									if(!MT.Mouse.Hover.targetSelected){
										if(!this.multi){
											MT.Selection.reset();
										}
										MT.Selection.add(MT.Mouse.Hover.targetItem);
										this.onMouseMove(event);
									}
									else if(this.multi && MT.Mouse.Hover.targetSelected && MT.Selection.count() > 1){
										MT.Selection.remove(MT.Mouse.Hover.targetItem);
										this.onMouseMove(event);
									}
								}
								else{
									MT.Selection.reset();
								}
							}
						}
					},
					Move: {
						activate: function(){
							this.refreshCursor();
						},
						activatePriority: function(point){
							if(MT.Mouse.Hover.selection && !MT.Utils.Select.multi){
								return 5;
							}
							return -1;
						},
						refreshCursor: function(){
							if(this.active){
								UI.Cursor.activate('move');
							}
						},
						onMouseDrag: function(event){
							if(this.active){
								var position = MT.Selection.Group.position.add(event.delta);
								position = Util.Bound.position(position, MT.Selection.Group, SL.config('selection.padding'), true);
								MT.Selection.Group.set({position: position});
								MT.UI.Group.set({position: position});
							}
						},
						onMouseUp: function(event){
							if(MT.Mouse.drag){
								var position = MT.Selection.Group.position;
								position = Util.Bound.position(position, MT.Selection.Group);
								MT.Selection.Group.set({position: position});
								MT.UI.Group.set({position: position});
							}
						}
					},
					Rotate: {
						activate: function(){
							this.refreshCursor();
						},
						activatePriority: function(point){
							return -1;
						},
						refreshCursor: function(){
							if(this.active){
								UI.Cursor.activate('rotate');
							}
						}
					},
					Text: {
						activate: function(){
							this.refreshCursor();
						},
						activatePriority: function(point){
							return -1;
						},
						refreshCursor: function(){
							if(this.active){
								UI.Cursor.activate('text');
							}
						}
					}
				};
				MT.activate(MT.Utils.Select);

				MT.checkActive = function(){
					if(this.Mouse.point){
						var activate;
						for(var name in this.Utils){
							if(typeof this.Utils[name].activatePriority == 'function'){
								var priority = this.Utils[name].activatePriority(this.Mouse.point);
								if(priority >= 0 && (!activate || priority <= activate.priority)){
									if(!activate){
										activate = {};
									}
									activate.util = this.Utils[name];
									activate.priority = priority;
								}
							}
						}
						if(activate && activate.util){
							this.activate(activate.util);
						}
					}
				};

				MT.checkTarget = function(){
					if(this.Mouse.point){
						var target = paper.project.hitTest(this.Mouse.point);
						this.Mouse.Hover.target = target;
						this.Mouse.Hover.targetItem = ((target && target.item) ? target.item : null);
						this.Mouse.Hover.targetLocked = (target && target.item && target.item.data && target.item.data.locked);
					}
				};

				MT.onKeyDown = function(event){
					this.utilsHandle('onKeyDown', event);
				};
				MT.onKeyUp = function(event){
					this.utilsHandle('onKeyUp', event);
				};
				MT.onMouseMove = function(event){
					this.Mouse.point = event.point;
					this.checkTarget();
					this.checkActive();
					this.utilsHandle('onMouseMove', event);
				};
				MT.onMouseDown = function(event){
					this.Mouse.down = true;
					this.utilsHandle('onMouseDown', event);
				};
				MT.onMouseUp = function(event){
					this.Mouse.down = false;
					this.utilsHandle('onMouseUp', event);
					this.Mouse.drag = false;
				};
				MT.onMouseDrag = function(event){
					this.Mouse.drag = true;
					this.utilsHandle('onMouseDrag', event);
				};

				self.tools.master = MT;
			}
		};

		var UI = {
			init: function(){
				if(SL.Canvas.isSet()){
					if(!UI.Dock.isSet()){
						UI.Dock.init();
					}
				}

				UI.Cursor.config('plus', {awesomeCursor:{}});
				UI.Cursor.config('minus', {awesomeCursor:{}});
				UI.Cursor.config('rotate', {awesomeCursor:{icon:'rotate-right'}});
				UI.Cursor.config('move', {awesomeCursor:{icon:'arrows'}});
				UI.Cursor.config('expand-nesw', {awesomeCursor:{icon:'expand'}});
				UI.Cursor.config('expand-senw', {awesomeCursor:{icon:'expand',flip: 'horizontal'}});
				UI.Cursor.config('expand-ns', {awesomeCursor:{icon:'arrows-v'}});
				UI.Cursor.config('expand-ew', {awesomeCursor:{icon:'arrows-h'}});
			},
			Cursor: {
				active: 'default',
				custom: {},
				activate: function(name){
					if(!name){
						name = 'default';
					}
					if(this.active == name){
						return;
					}
					if(SL.Canvas.isSet()){
						var value;
						if(this.custom[name]){
							if(this.custom[name].awesomeCursor){
								var awesome = this.custom[name].awesomeCursor;
								self.canvas.awesomeCursor(
									(awesome.icon || name), 
									awesome
								);
							}
							else if(this.custom[name].value){
								value = this.custom[name].value;
							}
						}
						else{
							value = name;
						}
						if(value){
							self.canvas.css('cursor', value);
						}
						this.active = name;
					}
				},
				config: function(name, config){
					if(name){
						if(!config){
							config = {};
						}
						if(config.awesomeCursor){
							$.extend(config.awesomeCursor, {
								font: {
									family: 'icomoon',
									cssClass: 'icon icon-%s'
								},
								hotspot: 'center'
							});
						}
						this.custom[name] = config;
					}
				}
			},
			Dock: {
				init: function(){
					UI.dock = $('<div class="sl-dock"></div>');

					if(SL.Canvas.isSet()){
						if(self.canvasID){
							UI.dock.addClass('sl-dock-'+self.canvasID);
						}

						SL.Canvas.onResize('resizeDock', function resizeDock(event){
							console.log('RESIZE THE DOCK =>', event);
							// TODO: resize dock
						});

						self.canvas.after(UI.dock);
					}
				},
				isSet: function(){
					return (UI.dock);
				}
			}
		};

		var Util = {
			init: function(){
				Util.Grid.init();
			},
			Bound: {
				position: function(point, item, padding, interactive){
					if(item){
						var bounds = item.strokeBounds.clone();
						if(padding){
							bounds = bounds.expand(padding);
						}

						// handle snap to grid
						if(!interactive && SL.config('grid.snap')){
							// shift to the new point
							bounds.center = point;

							// bound to grid
							var gridSize = SL.config('grid.size');
							var origX = bounds.left;
							var origY = bounds.top;
							var check;

							check = Math.round(origX / gridSize) * gridSize;
							if(check != origX){
								point.x += (check - origX);
							}

							check = Math.round(origY / gridSize) * gridSize;
							if(check != origY){
								point.y += (check - origY);
							}
						}

						// shift to the new point
						bounds.center = point;

						// bound to canvas
						var canvasSize = SL.Canvas.size();
						if(bounds.left < 0){
							point.x -= bounds.left;
						}
						else if(bounds.right > canvasSize.width){
							point.x -= (bounds.right - canvasSize.width);
						}
						if(bounds.top < 0){
							point.y -= bounds.top;
						}
						else if(bounds.bottom > canvasSize.height){
							point.y -= (bounds.bottom - canvasSize.height);
						}
					}
					return point;
				}
			},
			Calc: {
				halfSize: function(item){
					if(item){
						return new paper.Size( item.strokeBounds ).divide(2.0);
					}
				}
			},
			Grid: {
				init: function(){
					this.drawGrid();
					SL.Canvas.onResize('drawGrid', this.drawGrid);
					if(SL.config('grid.show')){
						this.enable();
					}
					else{
						this.disable();
					}
				},
				disable: function(){
					this.enabled = false;
					if(Util.grid){
						Util.grid.visible = false;
					}
				},
				enable: function(){
					this.enabled = true;
					if(Util.grid){
						Util.grid.visible = true;
					}
				},
				drawGrid: function(){
					if(!Util.grid){
						Util.grid = new paper.Group();
						paper.project.activeLayer.addChild(Util.grid);
						Util.grid.sendToBack();
					}
					Util.grid.removeChildren();

					var gridWidth = SL.config('grid.width') || 1.0;
					var gridColor = SL.config('grid.color') || '#DDDDDD';
					var gridSize = SL.config('grid.size') || 25;

					var canvasSize = SL.Canvas.size();
					var pos1 = new paper.Point(0, 0);
					var pos2 = new paper.Point(0, canvasSize.height);

					while(pos1.x <= canvasSize.width){
						var newLine = new paper.Path.Line(pos1, pos2);
						newLine.data.locked = true;
						newLine.strokeWidth = gridWidth;
						newLine.strokeColor = gridColor;
						Util.grid.addChild(newLine);
						pos1.x += gridSize;
						pos2.x += gridSize;
					}

					pos1.set(0, 0);
					pos2.set(canvasSize.width, 0);
					while(pos1.y <= canvasSize.height){
						var newLine = new paper.Path.Line(pos1, pos2);
						newLine.data.locked = true;
						newLine.strokeWidth = gridWidth;
						newLine.strokeColor = gridColor;
						Util.grid.addChild(newLine);
						pos1.y += gridSize;
						pos2.y += gridSize;
					}
				}
			}
		};

		// Public
		this.config = SL.config;
		this.addStamp = Stamps.add;
		this.loadStamps = Stamps.load;

		// constructor
		SL.init(canvas, config);
	}

	return {
		init: function(canvas, config){
			return new StampLines(canvas, config);
		}
	};
}());
// Object.values shim
Object.values = Object.values || (obj => Object.keys(obj).map(key => obj[key]));