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

					Tools.initSelector();

					if(self.tools.selector){
						self.tools.selector.activate();
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
			initSelector: function(){
				var selector = new paper.Tool();
				selector.selection = new paper.Group();
				selector.MODES = {
					SELECT: 0,
					MOVE: 	1,
					ROTATE: 2,
					TEXT: 	3
				};
				selector.mode = selector.MODES.SELECT;
				selector.ui = {};
				selector.Hover = {};
				selector.Drag = {};

				selector.setMode = function(mode){
					if(this.mode != mode && Object.values(this.MODES).indexOf(mode) != -1){
						this.mode = mode;
						this.refreshUI();
					}
				};

				selector.refreshMode = function(){
					if(this.Hover.rotateHandle){
						this.setMode(this.MODES.ROTATE);
					}
					else if(this.Hover.selected && !this.Hover.unselected && (!this.Hover.targetSelected || !this.multiSelect)){
						this.setMode(this.MODES.MOVE);
					}
					else{
						this.setMode(this.MODES.SELECT);
					}
				};

				selector.refreshUI = function(){
					if(this.selection.hasChildren()){
						if(!this.ui.outline){
							this.ui.outline = new paper.Shape.Rectangle();
							this.ui.outline.selected = true;
							paper.project.activeLayer.addChild(this.ui.outline);
						}
						this.ui.outline.selectedColor = ((this.selection.children.length > 1) ? '#00EC9D' : '#009DEC');
						this.ui.outline.set({position: this.selection.bounds.center, size: this.selection.bounds.size.add(SL.config('selection.padding'))});


						var rotateActive = false || (this.mode == this.MODES.ROTATE);
						if(!this.ui.rotate){
							this.ui.rotate = new paper.Group();
							paper.project.activeLayer.addChild(this.ui.rotate);
						}

						var rotateSlices = SL.config('rotate.slices');
						var rotateLength = SL.config('rotate.radius') || 100;
						var rotateColor = SL.config('rotate.color') || '#AAAAAA';
						var rotateWidth = 1;

						var rotateVector = new paper.Point({angle: 0, length: rotateLength});
						var rotateVectorFrom = this.selection.bounds.center;
						var rotateVectorTo = rotateVectorFrom.add(rotateVector);

						// the rotation grid (slices)
						if(rotateSlices){
							if(!this.ui.rotateGrid){
								this.ui.rotateGrid = new paper.Group();
								this.ui.rotate.addChild(this.ui.rotateGrid);
							}
							this.ui.rotateGrid.removeChildren();

							var rotateAngle = 360.0 / rotateSlices;
							for(var i=0; i < rotateSlices; i++){
								rotateVector.angle = i * rotateAngle;
								rotateVectorFrom = this.selection.bounds.center;
								rotateVectorTo = rotateVectorFrom.add(rotateVector);

								var newLine = new paper.Path.Line(rotateVectorFrom, rotateVectorTo);
								newLine.data.locked = true;
								newLine.strokeWidth = rotateWidth;
								newLine.strokeColor = rotateColor;
								this.ui.rotateGrid.addChild(newLine);
							}

							this.ui.rotateGrid.visible = rotateActive;
						}
						else if(this.ui.rotateGrid){
							this.ui.rotateGrid.remove();
							this.ui.rotateGrid = undefined;
						}

						// interactive handle
						rotateLength = SL.config('rotate.current.radius') || SL.config('rotate.radius') || 100;
						rotateColor = SL.config('rotate.current.color') || '#999999';
						rotateWidth = SL.config('rotate.current.width') || 3;

						var handleSize = SL.config('rotate.handle.size') || 15;

						if(rotateActive){
							rotateColor = SL.config('rotate.current.color.active') || '#333333';
							rotateWidth = SL.config('rotate.current.width.active') || 3;
						}

						rotateVector.angle = this.selection.rotation - 90.0;
						if(!this.ui.rotateCurrent){
							this.ui.rotateCurrent = new paper.Group();
							this.ui.rotate.addChild(this.ui.rotateCurrent);
						}


						rotateVectorFrom = this.selection.bounds.center;
						rotateVectorTo = rotateVectorFrom.add(rotateVector);
						var rotateLine = new paper.Path.Line(rotateVectorFrom, rotateVectorTo);

						if(!this.ui.rotateCurrentLine){
							this.ui.rotateCurrentLine = rotateLine;
							this.ui.rotateCurrentLine.data.locked = true;
							this.ui.rotateCurrent.addChild(this.ui.rotateCurrentLine);
						}
						this.ui.rotateCurrentLine.strokeWidth = rotateWidth;
						this.ui.rotateCurrentLine.strokeColor = rotateColor;
						this.ui.rotateCurrentLine.copyContent(rotateLine);

						if(!this.ui.rotateHandle){
							this.ui.rotateHandle = new paper.Shape.Rectangle(rotateVectorTo.subtract(handleSize/2.0), handleSize);
							this.ui.rotateHandle.data.locked = true;
							this.ui.rotateCurrent.addChild(this.ui.rotateHandle);
						}
						this.ui.rotateHandle.strokeWidth = 1;
						this.ui.rotateHandle.strokeColor = rotateColor;
						this.ui.rotateHandle.bounds.center = rotateVectorTo;
						this.ui.rotateHandle.bringToFront();

						this.ui.rotateCurrent.bringToFront();

						//this.ui.rotateCurrent


						this.ui.rotate.bringToFront();
					}
					else{
						if(this.ui.outline){
							this.ui.outline.selected = false;
							this.ui.outline.remove();
							this.ui.outline = undefined;
						}
						if(this.ui.rotate){
							this.ui.rotate.remove();
							this.ui.rotate = undefined;
						}
						if(this.ui.rotateHandle){
							this.ui.rotateHandle.remove();
							this.ui.rotateHandle = undefined;
						}
						if(this.ui.rotateCurrentLine){
							this.ui.rotateCurrentLine.remove();
							this.ui.rotateCurrentLine = undefined;
						}
						if(this.ui.rotateCurrent){
							this.ui.rotateCurrent.remove();
							this.ui.rotateCurrent = undefined;
						}
						if(this.ui.rotateGrid){
							this.ui.rotateGrid.remove();
							this.ui.rotateGrid = undefined;
						}
					}

					if(SL.Canvas.isSet()){
						var cursor = 'default';
						if(this.mode == this.MODES.MOVE){
							cursor = 'move';
						}
						else if(this.mode == this.MODES.ROTATE){
							cursor = 'crosshair';
						}
						else if(this.mode == this.MODES.TEXT){
							cursor = 'text';
						}
						self.canvas.css('cursor', cursor);
					}
				};

				selector.onKeyDown = function(event){
					if(event.key == 'shift'){
						this.multiSelect = true;
						this.refreshMode();
					}
				};
				selector.onKeyUp = function(event){
					if(event.key == 'shift'){
						this.multiSelect = false;
						this.refreshMode();
					}
				};
				selector.onMouseDown = function(event){
					this.dragged = false;

					var target = this.Hover.target;
					var targetSelected = this.Hover.targetSelected;
					var hitOutline = this.Hover.selected;

					var newSelect = ((!this.multiSelect || !target) 
										&& (!hitOutline || (target && !targetSelected))
									);

					if(newSelect && this.selection){
						var unselectedItems = this.selection.removeChildren();
						for(var i=0; i < unselectedItems.length; i++){
							var unselected = unselectedItems[i];
							unselected.selected = false;
							paper.project.activeLayer.addChild(unselected);
						}
					}
					
					if(target){
						if(!targetSelected){
							this.selection.appendBottom(target);
						}
						else if(this.multiSelect && targetSelected && (this.selection.children.length > 1)){
							target.selected = false;
							target.remove();
							paper.project.activeLayer.addChild(target);
						}
					}

					this.selection.selected = (this.selection.children.length > 1);
					if(this.selection.hasChildren()){
						this.selection.bringToFront();
					}
					this.refreshUI();
				};
				selector.onMouseDrag = function(event){
					this.dragged = true;
					if(this.selection.hasChildren()){
						var position = this.selection.position.add(event.delta);
						position = Util.Bound.position(position, this.selection, SL.config('selection.padding'), true);
						this.selection.set({position: position})
						this.refreshUI();
					}
				};
				selector.onMouseMove = function(event){
					var target = paper.project.hitTest(event.point);

					// special handling for possibly locked targets
					this.Hover.rotateHandle = (this.ui.rotateHandle && this.ui.rotateHandle.strokeBounds.contains(event.point));

					if(target && target.item && target.item.data && target.item.data.locked){
						target = null;
					}
					this.Hover.target = ((target && target.item) ? target.item : null);
					this.Hover.targetSelected = (this.Hover.target ? this.selection.isChild(this.Hover.target) : false);
					this.Hover.selected = (this.ui.outline && this.ui.outline.contains(event.point));
					this.Hover.unselected = (this.Hover.target && !this.Hover.targetSelected);

					this.refreshMode();
				};
				selector.onMouseUp = function(event){
					if(this.dragged && this.selection.hasChildren()){
						var position = this.selection.position;
						position = Util.Bound.position(position, this.selection);
						this.selection.set({position: position})
						this.refreshUI();
					}
				};

				self.tools.selector = selector;
			}
		};

		var UI = {
			init: function(){
				if(SL.Canvas.isSet()){
					if(!UI.Dock.isSet()){
						UI.Dock.init();
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