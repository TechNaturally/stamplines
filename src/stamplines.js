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
				self.lines = [];
				self.tools = {};

				self.config = $.extend({
					'grid.show': true,
					'grid.size': 25,
					'grid.snap': true,
					'rotate.slices': (360/45),
					'rotate.snap': true,
					'scale.edgeSize': 6,
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

		var Palette = {
			load: function(path){
				var defer = $.Deferred();
				$.ajax( path )
					.done(function paletteLoaded(data){
						if(!data){
							data = {};
						}
						var loaders = [];

						Palette.name = data.name;
						Palette.Stamps.path = '';

						if(data.Stamp){
							if(data.Stamp.path){
								Palette.Stamps.path = data.Stamp.path;
							}
						}

						var basePath = '';
						var lastSlash = path.lastIndexOf('/');
						if(lastSlash != -1){
							basePath = path.substr(0, lastSlash+1);
						}
						if(Palette.Stamps.path && Palette.Stamps.path != '/' && basePath){
							Palette.Stamps.path = basePath+Palette.Stamps.path;
						}
						if(Palette.Stamps.path && Palette.Stamps.path != '/'){
							Palette.Stamps.path += '/';
						}

						if(data.stamps){
							loaders.push( Palette.Stamps.load(data.stamps) );
						}

						if(data.lines){
							loaders.push( Palette.Lines.load(data.lines) );
						}

						$.when.apply($, loaders).always(function PaletteLoaded(){
							defer.resolve();
						});
					});
				return defer;
			},

			Lines: {
				load: function(lines){
					var defer = $.Deferred();
					for(var i=0; i < lines.length; i++){
						var line = lines[i];
						if(!line.id){
							continue;
						}

						if(SL.assertPaper()){
							line.Group = new paper.Group();
							paper.project.activeLayer.addChild(line.Group);

							var pt1 = new paper.Point( 100.0 + i*100.0,  200 );
							var pt2 = new paper.Point( 125.0 + i*125.0,  500 );

							var testLine = new paper.Path.Line(pt1, pt2);
							line.Group.addChild(testLine);
							line.Group.set(line.style);

							pt1.x += 10;
							pt2.x += 10;
							testLine = new paper.Path.Line(pt1, pt2);
							testLine.set(line.style);
							line.Group.addChild(testLine);
						}

						self.lines.push(line);
					}
					defer.resolve();
					return defer;
				},
				new: function(line, point1, point2){
					if(line && line.Group){
						var newLine = new paper.Path.Line(point1, point2);
						if(line.style){
							newLine.set(line.style);
						}
						line.Group.addChild(newLine);
					}
				}
			},

			Stamps: {
				load: function(stamps, path){
					if(path == undefined){
						path = Palette.Stamps.path;
					}
					var loaders = [];
					var stampIDs = [];
					for(var i=0; i < stamps.length; i++){
						var stamp = stamps[i];
						if(!stamp.id){
							continue;
						}
						if(!stamp.name){
							stamp.name = stamp.id;
						}
						if(!stamp.image){
							stamp.image = stamp.id+'.svg';
						}

						stampIDs.push(stamp.id);

						// load the image
						var imagePath = stamp.image;
						if(imagePath.charAt(0) != '/'){
							imagePath = path+((path.slice(-1)!='/')?'/':'')+imagePath;
						}
						loaders.push($.ajax(imagePath, {
							context: {
								stamp: stamp,
								path: imagePath
							}
						})
						.done(function stampImageLoaded(svg){
							this.stamp.imagePath = this.path;
							if(SL.assertPaper()){
								// import the loaded SVG into a symbol
								var symbolItem = paper.project.importSVG(svg);
								symbolItem.style.strokeScaling = false;
								this.stamp.symbol = new paper.Symbol( symbolItem );
							}
						})
						.fail(function stampImageNotFound(){
							SL.error('Could not load stamp: "'+this.stamp.id+'" image => "'+this.stamp.image+'"');
							this.stamp.image = undefined;
						})
						.always(function stampImageProcessed(){
							self.stamps.push(this.stamp);
							Palette.Stamps.sort(stampIDs);
						}));
					}
					return $.when.apply($, loaders);
				},
				new: function(stamp, position){
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

						var size = stamp.symbol.item.bounds.clone();
						size = Util.Bound.size(size);

						// place an instance of the symbol
						var newStamp = stamp.symbol.place(position);
						if(newStamp.bounds.width && newStamp.bounds.height){
							newStamp.scale(size.width/newStamp.bounds.width, size.height/newStamp.bounds.height, newStamp.bounds.topLeft);
						}
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
								Palette.Stamps.new($(this).data('stamp'));
							});

							var newStampContent = $('<div class="sl-stamp-content sl-stamp-img" draggable="true"></div>');
							if(stamp.imagePath){
								newStampContent.append($('<img src="'+stamp.imagePath+'" />'));
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

									Palette.Stamps.new(stamp, spawnPoint);
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
					Palette.Stamps.refreshPanel();
				}
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
					UI: {
						outline: undefined
					},
					rotation: 0,
					add: function(item){
						if(item && !this.contains(item)){
							this.Group.appendBottom(item);
							this.refresh(true);
							return true;
						}
					},
					contains: function(item){
						return (item && this.Group.isChild(item));
					},
					count: function(){
						return this.Group.children.length;
					},
					eachItem: function(callback, data){
						if(typeof callback == 'function'){
							for(var i=0; i < this.Group.children.length; i++){
								callback(this.Group.children[i], i, data);
							}
						}
					},
					refresh: function(changed){
						this.Group.selected = (this.count() > 1);
						if(this.count()){
							if(!this.UI.outline){
								this.UI.outline = new paper.Shape.Rectangle();
							}
							this.UI.outline.selected = true;
							this.UI.outline.selectedColor = ((this.count() > 1) ? '#00EC9D' : '#009DEC');
							this.UI.outline.set({position: this.Group.bounds.center, size: this.Group.bounds.size.add(SL.config('selection.padding'))});
							MT.UI.enable(this.UI.outline);

							this.Group.bringToFront();
							MT.UI.Group.bringToFront();
						}
						else{
							MT.UI.disable(this.UI.outline);
						}
						if(changed){
							MT.onSelectionChange();
						}
					},
					remove: function(item){
						if(item){
							item.selected = false;
							if(this.contains(item)){
								item.remove();
								paper.project.activeLayer.addChild(item);
								this.refresh(true);
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
						this.refresh(true);
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
							util[func](args);
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

							MT.Mouse.Hover.selection = (MT.Mouse.point && MT.Selection.UI.outline && MT.Selection.UI.outline.visible && MT.Selection.UI.outline.contains(MT.Mouse.point));

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

								var delta = position.subtract(MT.Selection.Group.position);
								MT.Selection.Group.translate(delta);
								MT.UI.Group.translate(delta);
							}
						},
						onMouseUp: function(event){
							if(MT.Mouse.drag){
								var position = MT.Selection.Group.position.clone();
								position = Util.Bound.position(position, MT.Selection.Group);

								var delta = position.subtract(MT.Selection.Group.position);
								MT.Selection.Group.translate(delta);
								MT.UI.Group.translate(delta);
							}
						}
					},
					Rotate: {
						UI: {
							Group: undefined,
							Current: undefined,
							currentHandle: undefined,
							currentLine: undefined,
							grid: undefined
						},
						activate: function(){
							this.refreshUI();
							this.refreshCursor();
						},
						deactivate: function(){
							this.refreshUI();
						},
						activatePriority: function(point){
							if(MT.Mouse.Hover.rotateHandle){
								return 1;
							}
							return -1;
						},
						refreshCursor: function(){
							if(this.active){
								UI.Cursor.activate('rotate');
							}
						},
						refreshUI: function(){
							if(MT.Selection.count()){
								if(MT.Selection.UI.outline && MT.Selection.UI.outline.visible){
									if(!this.UI.Group){
										this.UI.Group = new paper.Group();
										this.UI.Group.remove();
									}

									var rotateSlices = SL.config('rotate.slices');
									var rotateLength = SL.config('rotate.radius') || 100;
									var rotateColor = SL.config('rotate.color') || '#AAAAAA';
									var rotateWidth = 1;

									var rotateVector = new paper.Point({angle: 0, length: rotateLength});
									var rotateVectorFrom = MT.Selection.Group.bounds.center;
									var rotateVectorTo = rotateVectorFrom.add(rotateVector);

									if(rotateSlices){
										if(!this.UI.grid){
											this.UI.grid = new paper.Group();
											this.UI.grid.remove();
											this.UI.Group.appendBottom(this.UI.grid);
										}

										if(this.UI.grid.children.length != rotateSlices){
											this.UI.grid.removeChildren();

											var rotateAngle = 360.0 / rotateSlices;
											rotateVector.length = rotateLength;
											for(var i=0; i < rotateSlices; i++){
												rotateVector.angle = i * rotateAngle;
												rotateVectorFrom = MT.Selection.Group.bounds.center
												rotateVectorTo = rotateVectorFrom.add(rotateVector);

												var newLine = new paper.Path.Line(rotateVectorFrom, rotateVectorTo);
												newLine.data.locked = true;
												newLine.strokeWidth = rotateWidth;
												newLine.strokeColor = rotateColor;
												this.UI.grid.addChild(newLine);
											}
										}

										this.UI.grid.set({position: rotateVectorFrom});

										this.UI.grid.sendToBack();
									}
									else if(this.UI.grid){
										this.UI.grid.remove();
										this.UI.grid = undefined;
									}

									// interactive rotation handle
									rotateLength = SL.config('rotate.current.radius') || SL.config('rotate.radius') || 100;
									rotateColor = SL.config('rotate.current.color') || '#999999';
									rotateWidth = SL.config('rotate.current.width') || 3;

									var handleSize = SL.config('rotate.handle.size') || 15;

									if(this.active){
										rotateColor = SL.config('rotate.current.color.active') || '#333333';
										rotateWidth = SL.config('rotate.current.width.active') || 3;
									}

									rotateVector.angle = MT.Selection.rotation - 90.0; //MT.Selection.Group.rotation - 90.0;
									rotateVectorFrom = MT.Selection.Group.bounds.center
									rotateVectorTo = rotateVectorFrom.add(rotateVector);

									if(!this.UI.Current){
										this.UI.Current = new paper.Group();
										this.UI.Current.remove();
										this.UI.Group.appendTop(this.UI.Current);
									}

									var rotateLine = new paper.Path.Line(rotateVectorFrom, rotateVectorTo);
									if(!this.UI.currentLine){
										this.UI.currentLine = rotateLine.clone();
										this.UI.currentLine.data.locked = true;
										this.UI.Current.addChild(this.UI.currentLine);
									}
									this.UI.currentLine.strokeWidth = rotateWidth;
									this.UI.currentLine.strokeColor = rotateColor;
									this.UI.currentLine.copyContent(rotateLine);


									if(!this.UI.currentHandle){
										this.UI.currentHandle = new paper.Shape.Rectangle(rotateVectorTo.subtract(handleSize/2.0), handleSize);
										this.UI.currentHandle.data.locked = true;
										this.UI.Current.addChild(this.UI.currentHandle);
									}
									this.UI.currentHandle.strokeWidth = 1;
									this.UI.currentHandle.strokeColor = rotateColor;
									this.UI.currentHandle.bounds.center = rotateVectorTo;
									
									this.UI.currentLine.bringToFront();
									this.UI.currentHandle.bringToFront();
									this.UI.Current.bringToFront();
									MT.UI.enable(this.UI.Group);
								}
							}
							else{
								MT.UI.disable(this.UI.Group);
							}

							if(this.UI.grid){
								this.UI.grid.visible = this.active;
							}
						},
						onMouseDrag: function(event){
							if(this.active){
								var rotateVectorFrom = MT.Selection.Group.bounds.center;
								var rotateVector = event.point.subtract(rotateVectorFrom);
								var angle = rotateVector.angle + 90;
								if(angle > 180){
									angle -= 360.0;
								}
								angle = Util.Bound.rotation(angle);

								var delta = angle - MT.Selection.rotation;

								MT.Selection.Group.rotate(delta);
								MT.Selection.rotation = angle;
								MT.Selection.refresh();
								this.refreshUI();
							}
						},
						onMouseMove: function(event){
							MT.Mouse.Hover.rotateHandle = (this.UI.Group && this.UI.Group.visible && this.UI.currentHandle && this.UI.currentHandle.strokeBounds.contains(event.point));

							this.refreshCursor();
							MT.checkActive();
						},
						onSelectionChange: function(){
							MT.Selection.rotation = (MT.Selection.count() == 1) ? MT.Selection.Group.children[0].rotation : 0;
							
							this.refreshUI();
						}
					},
					Scale: {
						activate: function(){
							this.refreshCursor();
						},
						activatePriority: function(point){
							if(MT.Mouse.Hover.selectionEdge && (
								MT.Mouse.Hover.selectionEdge.top || MT.Mouse.Hover.selectionEdge.bottom || 
								MT.Mouse.Hover.selectionEdge.left || MT.Mouse.Hover.selectionEdge.right
								)){
								return 1;
							}
							return -1;
						},
						refreshCursor: function(){
							if(this.active && MT.Mouse.Hover.selectionEdge && MT.Mouse.Hover.selectionEdge.direction){
								switch(MT.Mouse.Hover.selectionEdge.direction){
									case 'N':
									case 'S':
										UI.Cursor.activate('expand-ns');
										break;
									case 'E':
									case 'W':
										UI.Cursor.activate('expand-ew');
										break;
									case 'NE':
									case 'SW':
										UI.Cursor.activate('expand-nesw');
										break;
									case 'SE':
									case 'NW':
										UI.Cursor.activate('expand-senw');
										break;
								}
							}
						},
						onMouseDrag: function(event){
							if(this.active && MT.Mouse.Hover.selectionEdge && MT.Mouse.Hover.selectionEdge.direction){
								// resolve direction to represent the edge or corner that is being dragged
								var direction = new paper.Point(0, 0);
								switch(MT.Mouse.Hover.selectionEdge.direction){
									case 'N':
										direction.x = 0.0;
										direction.y = -1.0;
										break;
									case 'S':
										direction.x = 0.0;
										direction.y = 1.0;
										break;
									case 'E':
										direction.x = 1.0;
										direction.y = 0.0;
										break;
									case 'W':
										direction.x = -1.0;
										direction.y = 0.0;
										break;
									case 'NE':
										direction.x = 1.0;
										direction.y = -1.0;
										break;
									case 'SW':
										direction.x = -1.0;
										direction.y = 1.0;
										break;
									case 'SE':
										direction.x = 1.0;
										direction.y = 1.0;
										break;
									case 'NW':
										direction.x = -1.0;
										direction.y = -1.0;
										break;
								}
								if(direction.x || direction.y){
									direction.length = 1.0;
									var delta = event.delta.clone();

									var data = {
										delta: delta,
										direction: direction
									};
									MT.Selection.eachItem(function scaleItem(item, idx, data){
										var delta = data.delta;
										var direction = data.direction.clone();
										var scale = new paper.Point(delta.x, delta.y);

										// rotate the item back to its original position
										// this avoids the item being skewed if scaled while rotated
										var rotation = item.rotation;
										if(rotation){
											item.rotate(-rotation);
											
											scale = scale.rotate(-rotation);
											scale.x = Util.Calc.round(scale.x, 0.0);
											scale.y = Util.Calc.round(scale.y, 0.0);
											
											direction = direction.rotate(-rotation);
											direction.x = Util.Calc.round(direction.x, 0.0);
											direction.y = Util.Calc.round(direction.y, 0.0);
										}

										// lock for single-axis scaling
										if(direction.x == 0.0){
											scale.x = 0.0;
										}
										if(direction.y == 0.0){
											scale.y = 0.0;
										}

										var bounds = item.bounds;
										var origBounds = bounds.clone();

										// determine the point to base the scaling on
										// this is a point on the edge opposite the dragged edge
										var opPoint = bounds.center.clone();
										if(direction.x < 0){
											opPoint.x = bounds.right;
										}
										else if(direction.x > 0){
											opPoint.x = bounds.left;
										}
										if(direction.y < 0){
											opPoint.y = bounds.bottom;
										}
										else if(direction.y > 0){
											opPoint.y = bounds.top;
										}

										// flip scaling for N+W stretches
										if(direction.x < 0){
											scale.x *= -1.0;
										}
										if(direction.y < 0){
											scale.y *= -1.0;
										}

										// calculate the new size
										var size = bounds.clone();
										size = size.scale( ((bounds.width+scale.x)/bounds.width) , ((bounds.height+scale.y)/bounds.height), opPoint );

										// scale the item
										item.scale((size.width/bounds.width), (size.height/bounds.height), opPoint);

										if(rotation){
											item.rotate(rotation, origBounds.center);
										}
									}, data);

									MT.Selection.refresh();
									MT.utilsHandle('refreshUI');
								}
							}
						},
						onMouseUp: function(event){
							if(this.active && MT.Mouse.drag && MT.Selection.count()){
								for(var i=0; i < MT.Selection.Group.children.length; i++){
									var item = MT.Selection.Group.children[i];
									Util.Bound.lockToGrid(item);
								}
								MT.Selection.refresh();
								MT.utilsHandle('refreshUI');
							}
						},
						onMouseMove: function(event){
							var edgeSize = SL.config('scale.edgeSize') || 6;

							if(!MT.Mouse.Hover.selectionEdge){
								MT.Mouse.Hover.selectionEdge = {};
							}
							MT.Mouse.Hover.selectionEdge.top = false;
							MT.Mouse.Hover.selectionEdge.bottom = false;
							MT.Mouse.Hover.selectionEdge.left = false;
							MT.Mouse.Hover.selectionEdge.right = false;
							MT.Mouse.Hover.selectionEdge.direction = undefined;

							if(MT.Mouse.point && MT.Selection.UI.outline && MT.Selection.UI.outline.visible){
								var checkBounds = MT.Selection.UI.outline.handleBounds.expand(edgeSize);
								if(checkBounds.contains(MT.Mouse.point)){
									var checkRect = new paper.Rectangle();
									var checkPoint = new paper.Point();

									checkPoint.set(checkBounds.right, checkBounds.top+edgeSize);
									checkRect.set(checkBounds.topLeft, checkPoint);
									MT.Mouse.Hover.selectionEdge.top = checkRect.contains(MT.Mouse.point);

									checkPoint.set(checkBounds.left, checkBounds.bottom-edgeSize);
									checkRect.set(checkPoint, checkBounds.bottomRight);
									MT.Mouse.Hover.selectionEdge.bottom = checkRect.contains(MT.Mouse.point);

									checkPoint.set(checkBounds.left+edgeSize, checkBounds.bottom);
									checkRect.set(checkBounds.topLeft, checkPoint);
									MT.Mouse.Hover.selectionEdge.left = checkRect.contains(MT.Mouse.point);

									checkPoint.set(checkBounds.right-edgeSize, checkBounds.top);
									checkRect.set(checkPoint, checkBounds.bottomRight);
									MT.Mouse.Hover.selectionEdge.right = checkRect.contains(MT.Mouse.point);
								}
							}

							if(MT.Mouse.Hover.selectionEdge.top && MT.Mouse.Hover.selectionEdge.right){
								MT.Mouse.Hover.selectionEdge.direction = 'NE';
							}
							else if(MT.Mouse.Hover.selectionEdge.bottom && MT.Mouse.Hover.selectionEdge.right){
								MT.Mouse.Hover.selectionEdge.direction = 'SE';
							}
							else if(MT.Mouse.Hover.selectionEdge.bottom && MT.Mouse.Hover.selectionEdge.left){
								MT.Mouse.Hover.selectionEdge.direction = 'SW';
							}
							else if(MT.Mouse.Hover.selectionEdge.top && MT.Mouse.Hover.selectionEdge.left){
								MT.Mouse.Hover.selectionEdge.direction = 'NW';
							}
							else if(MT.Mouse.Hover.selectionEdge.top){
								MT.Mouse.Hover.selectionEdge.direction = 'N';
							}
							else if(MT.Mouse.Hover.selectionEdge.right){
								MT.Mouse.Hover.selectionEdge.direction = 'E';
							}
							else if(MT.Mouse.Hover.selectionEdge.bottom){
								MT.Mouse.Hover.selectionEdge.direction = 'S';
							}
							else if(MT.Mouse.Hover.selectionEdge.left){
								MT.Mouse.Hover.selectionEdge.direction = 'W';
							}

							this.refreshCursor();
							MT.checkActive();
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

				MT.onSelectionChange = function(){
					this.utilsHandle('onSelectionChange');
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
				lockToGrid: function(item){
					var rotation = item.rotation;
					if(rotation){
						item.rotate(-rotation);
					}
					var bounds = item.bounds.clone();
					var size = bounds.clone();
					size = Util.Bound.size(size);
					item.scale(size.width/bounds.width, size.height/bounds.height);
					if(rotation){
						item.rotate(rotation);
					}

					var position = item.position.clone();
					position = Util.Bound.position(position, item);

					var delta = position.subtract(item.position);
					item.translate(delta);
				},
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
				},
				rotation: function(angle, interactive){
					var rotateSlices = SL.config('rotate.slices');
					if(rotateSlices && !interactive){
						var rotateAngle = 360.0 / rotateSlices;
						angle = Math.round(angle / rotateAngle) * rotateAngle;
					}
					return angle;
				},
				size: function(size, interactive){
					var gridSize = SL.config('grid.size');
					if(gridSize && !interactive){
						size.width = Math.round(size.width / gridSize) * gridSize;
						size.height = Math.round(size.height / gridSize) * gridSize;
					}
					return size;
				}
			},
			Calc: {
				halfSize: function(item){
					if(item){
						return new paper.Size( item.strokeBounds ).divide(2.0);
					}
				},
				round: function(value, around, precision){
					if(!precision){
						precision = 12;
					}
					var threshold = Math.pow(10, -precision);
					if(value >= (around-threshold) && value <= (around+threshold)){
						return around;
					}
					return value;
				},
				roundMatch: function(value, around, precision){
					return (this.round(value, around, precision) == around);
				},
				unitVector: function(vector){
					vector.length = 1.0;
					vector.x = this.round(vector.x, 0.0);
					vector.x = this.round(vector.x, 1.0);
					vector.x = this.round(vector.x, -1.0);
					vector.y = this.round(vector.y, 0.0);
					vector.y = this.round(vector.y, 1.0);
					vector.y = this.round(vector.y, -1.0);
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
		this.loadPalette = Palette.load;
//		this.addStamp = Stamps.add;
//		this.loadStamps = Stamps.load;

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