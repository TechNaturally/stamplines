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

				selector.setMode = function(mode){
					if(this.mode != mode && Object.values(this.MODES).indexOf(mode) != -1){
						this.mode = mode;
						this.refreshUI();
					}
				};

				selector.refreshMode = function(){
					if(this.hoverSelected && !this.hoverUnselected && (!this.hoverSelectedChild || !this.multiSelect)){
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
					}
					else if(this.ui.outline){
						this.ui.outline.selected = false;
						this.ui.outline.remove();
						this.ui.outline = undefined;
					}

					if(SL.Canvas.isSet()){
						var cursor = 'default';
						if(this.mode == this.MODES.MOVE){
							cursor = 'move';
						}
						else if(this.mode == this.MODES.ROTATE){
							cursor = 'grab';
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
					var target = paper.project.hitTest(event.point);
					if(target && target.item && target.item.data && target.item.data.locked){
						target = null;
					}
					var hasTarget = (target && target.item);
					var hitOutline = (this.ui.outline && this.ui.outline.contains(event.point));
					var newSelect = ((!this.multiSelect || !hasTarget) 
										&& (!hitOutline || (hasTarget && !this.selection.isChild(target.item)))
									);

					if(newSelect && this.selection){
						var unselectedItems = this.selection.removeChildren();
						for(var i=0; i < unselectedItems.length; i++){
							var unselected = unselectedItems[i];
							unselected.selected = false;
							paper.project.activeLayer.addChild(unselected);
						}
					}
					
					if(hasTarget){
						if(!this.selection.isChild(target.item)){
							this.selection.appendBottom(target.item);
						}
						else if(this.multiSelect && this.selection.isChild(target.item) && (this.selection.children.length > 1)){
							target.item.selected = false;
							target.item.remove();
							paper.project.activeLayer.addChild(target.item);
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
					var hitOutline = (this.ui.outline && this.ui.outline.contains(event.point));

					this.hoverSelected = hitOutline;
					this.hoverSelectedChild = (target && target.item && this.selection.isChild(target.item));
					this.hoverUnselected = (target && target.item && !this.hoverSelectedChild);

					this.refreshMode();
				};
				selector.onMouseUp = function(event){
					if(this.dragged && this.selection.hasChildren()){
						var position = this.selection.position;
						position = Util.Bound.position(position, this.selection, 2.0);
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
						var bounds = item.bounds.clone();
						if(item.strokeWidth){
							bounds = bounds.expand(item.strokeWidth);
						}
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
						return new paper.Size( item.bounds ).add(item.strokeWidth).divide(2.0);
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