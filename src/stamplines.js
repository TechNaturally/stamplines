var stamplines = (function() {
	function StampLines(canvas, config){
		var self = this;

		var SL = {
			assertPaper: function(){
				if(paper != undefined){
					return true;
				}
				SL.error('Could not find Paper.js library!');
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
				self.ui = {};

				self.config = $.extend({
					'grid.show': true,
					'grid.size': 25,
					'grid.snap': true,
					'rotate.slices': (360/45),
					'rotate.snap': true,
					'scale.edgeSize': 6,
					'selection.padding': 15
				}, config);

				if(SL.Canvas.isSet()){
					self.canvas.addClass('stamplines');
					self.canvasID = self.canvas.attr('id');
					self.canvas.bind('contextmenu', function(e){
						return false;
					});
				}

				if(SL.assertPaper()){
					if(SL.Canvas.isSet()){
						paper.setup(self.canvas[0]);
						SL.Canvas.init();
					}
					Util.init();
					UI.init({
						Cursors: {
							custom: {
								'plus': {awesomeCursor:{}},
								'minus': {awesomeCursor:{}},
								'rotate': {awesomeCursor:{icon:'rotate-right'}},
								'move': {awesomeCursor:{icon:'arrows'}},
								'expand-nesw': {awesomeCursor:{icon:'expand'}},
								'expand-senw': {awesomeCursor:{icon:'expand',flip: 'horizontal'}},
								'expand-ns': {awesomeCursor:{icon:'arrows-v'}},
								'expand-ew': {awesomeCursor:{icon:'arrows-h'}},
								'link': {awesomeCursor:{}},
								'unlink': {awesomeCursor:{}},
								'crosshairs': {awesomeCursor:{}}
							}
						},
						Mouse: {
							dragMaxPoints: 2
						}
					});
					Tools.init();
					Tools.activateDefault();
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
			initTools: function(){
				this.Lines.initTools();
				this.Stamps.initTools();
			},
			load: function(path){
				var defer = $.Deferred();
				$.ajax( path )
					.done(function paletteLoaded(data){
						if(!data){
							data = {};
						}
						var loaders = [];

						// read the stamp and line configs
						var stampConfig = $.extend({
							path: ''
						}, data.Stamp);

						var lineConfig = $.extend({
							preview: {
								width: 50,
								height: 50
							}
						}, data.Line);

						// normalize asset paths
						var basePath = '';
						var lastSlash = path.lastIndexOf('/');
						if(lastSlash != -1){
							basePath = path.substr(0, lastSlash+1);
						}
						if(stampConfig.path && stampConfig.path != '/' && basePath){
							stampConfig.path = basePath+stampConfig.path;
						}
						if(lineConfig.path && lineConfig.path != '/'){
							lineConfig.path += '/';
						}

						// initialize the palette
						Palette.name = data.name;

						Palette.Stamps.init(stampConfig);
						Palette.Lines.init(lineConfig);

						// load the stamps and lines
						if(data.stamps){
							loaders.push( Palette.Stamps.load(data.stamps) );
						}
						if(data.lines){
							loaders.push( Palette.Lines.load(data.lines) );
						}

						// wait for all loaders to complete
						$.when.apply($, loaders).always(function PaletteLoaded(){
							defer.resolve();
						});
					});
				return defer;
			},

			Lines: {
				config: {},
				lines: [],
				init: function(config){
					this.config = config;
				},
				initTools: function(){
					if(SL.assertPaper()){
						var LT = new paper.Tool();
						LT.Current = {};
						LT.Next = {
							lastPoint: new paper.Point(),
							nextPoint: new paper.Point()
						};

						LT.setLine = function(line){
							if(!LT.Current.line){
								LT.Current.line = {
									points: []
								};
							}
							LT.Current.line.config = line;
						};

						LT.deactivate = function(){
							Tools.activateDefault();
						};

						LT.onActivate = function(event){
							UI.Cursor.activate('crosshairs');
							if(MT.Utils['ShapeConnector']){
								MT.Utils['ShapeConnector'].UI.createConnectionPoints();
							}
						};
						LT.onDeactivate = function(event){
							LT.Current.line = undefined;
							LT.Current.Line = undefined;
							if(LT.Next.segment){
								LT.Next.segment.remove();
								LT.Next.segment = undefined;
							}
							if(MT.Utils['ShapeConnector']){
								MT.Utils['ShapeConnector'].UI.removeConnectionPoints();
							}
						};

						LT.onKeyDown = function(event){
							if(event.key == 'escape'){
								LT.deactivate();
							}
						};

						LT.onMouseDown = function(event){
							if(event.event.button == 2){
								LT.deactivate();
								return;
							}
							if(LT.Current.line){
								LT.Current.line.points.push(UI.Mouse.State.point.clone());
								var points = LT.Current.line.points;
								// add the segment if there are 2 or more points
								if(points.length > 1){
									var SC = MT.Utils['ShapeConnector'];
									if(!LT.Current.Line){
										// initialize the line
										LT.Current.Line = new paper.Path();
										Palette.Lines.applyStyle(LT.Current.Line, LT.Current.line.config.style);
										LT.Current.Line.data.type = 'line';

										// add the last two points
										var pt1 = points[points.length-2].clone();
										var pt2 = points[points.length-1].clone();

										// integrate with ShapeConnector utility
										var connectTo1, connectTo2;
										if(SC){
											connectTo1 = SC.Points.hitTest(pt1);
											if(connectTo1 && connectTo1.position){
												pt1.set(connectTo1.position);
											}
											connectTo2 = SC.Points.hitTest(pt2);
											if(connectTo2 && connectTo2.position){
												pt2.set(connectTo2.position);
											}
										}

										if(!connectTo1){
											Util.Bound.point(pt1);
										}
										if(!connectTo2){
											Util.Bound.point(pt2);
										}
										
										LT.Current.Line.add( pt1, pt2 );
										if(connectTo1 && connectTo1.data && connectTo1.data.type == 'connection-point' && LT.Current.Line.segments.length > 0){
											var segment = LT.Current.Line.segments[0];
											SC.connect(segment, connectTo1.data.connection, connectTo1.data.item);

										}
										if(connectTo2 && connectTo2.data && connectTo2.data.type == 'connection-point' && LT.Current.Line.segments.length > 1){
											var segment = LT.Current.Line.segments[1];
											SC.connect(segment, connectTo2.data.connection, connectTo2.data.item);
										}
									}
									else{
										// add the last point
										var pt = points[points.length-1].clone();
										Util.Bound.point(pt);
										// integrate with ShapeConnector utility
										var connectTo;
										if(SC){
											connectTo = SC.Points.hitTest(event.point);
											if(connectTo && connectTo.position){
												pt.set(connectTo.position);
											}
										}
										var lastSegment = (LT.Current.Line.segments.length ? LT.Current.Line.segments[LT.Current.Line.segments.length-1] : undefined);
										var segment = LT.Current.Line.add( pt );
										if(segment && lastSegment && lastSegment.data && lastSegment.data.connection){
											SC.disconnect(lastSegment, lastSegment.data.connection);
										}
										if(connectTo && connectTo.data && connectTo.data.type == 'connection-point' && segment){
											SC.connect(segment, connectTo.data.connection, connectTo.data.item);
										}
									}
								}

								// draw a live preview to the mouse cursor
								if(points.length){
									var pt;
									// read the last point from the current line
									if(LT.Current.Line && LT.Current.Line.segments && LT.Current.Line.segments.length){
										pt = LT.Current.Line.segments[LT.Current.Line.segments.length-1].point;
									}
									// if no point, read the last mouse point
									if(!pt){
										pt = points[points.length-1].clone();
										Util.Bound.point( pt );
									}

									// integrate with ShapeConnector utility
									var connectTo;
									if(MT.Utils['ShapeConnector']){
										connectTo = MT.Utils['ShapeConnector'].Points.hitTest(event.point);
										if(connectTo && connectTo.position){
											pt.set(connectTo.position);
										}
									}

									// set the lastPoint
									LT.Next.lastPoint.set( pt );

									// initialize the live preview if there is not one
									if(!LT.Next.segment){
										LT.Next.segment = new paper.Path();
										Palette.Lines.applyStyle(LT.Next.segment, LT.Current.line.config.style);
									}

									// draw the line segments
									LT.Next.segment.removeSegments();
									LT.Next.segment.add( LT.Next.lastPoint, LT.Next.nextPoint );
								}
							}
						};
						LT.onMouseMove = function(event){
							// update the nextPoint for the live preview
							var pt = UI.Mouse.State.point.clone();
							Util.Bound.point( pt );

							// integrate with ShapeConnector utility
							if(MT.Utils['ShapeConnector']){
								var connectTo = MT.Utils['ShapeConnector'].Points.hitTest(event.point);
								if(connectTo && connectTo.position){
									pt.set(connectTo.position);
								}
							}

							LT.Next.nextPoint.set( pt );
							if(LT.Next.segment){
								LT.Next.segment.removeSegments();
								LT.Next.segment.add( LT.Next.lastPoint, LT.Next.nextPoint );
							}
						};
						Tools.addTool('lines', LT);

						var MT = self.tools['master'];
						var LE = {
							State: {
								selectedPoint: undefined
							},
							UI: {
								Group: undefined,
								assertGroup: function(){
									if(!LE.UI.Group){
										LE.UI.Group = new paper.Group();
										LE.UI.Group.remove(); // remove it from main layer, it gets added to MT.UI when enabled
										MT.UI.enable(LE.UI.Group);
									}
									LE.UI.Group.bringToFront();
								}
							},
							activate: function(){
								LE.UI.assertGroup();
								MT.UI.enable(LE.UI.Group);
								MT.setUtilityControl(true);

								if(!this.State.target){
									this.State.target = MT.Mouse.Hover.target;
								}
								this.UI.Outline.addToSegment( this.State.target );

								this.refreshCursor();
							},
							deactivate: function(){
								this.reset();
								this.State.target = undefined;
								this.State.Drag = undefined;
								this.exitAppend();
								MT.UI.disable(LE.UI.Group);
								MT.setUtilityControl(false);
							},
							activatePriority: function(point){
								if(this.State.target){
									return 1;
								}
								return -1;
							},
							exitAppend: function(){
								if(LE.State.Append){
									if(LE.State.Append.Line){
										LE.State.Append.Line.remove();
									}
									LE.State.Append = undefined;
								}
								if(MT.Utils['ShapeConnector']){
									MT.Utils['ShapeConnector'].UI.removeConnectionPoints();
								}
								if(LE.State.selectedPoint && (!MT.Mouse.Hover.targetItem || !MT.Mouse.Hover.targetItem.data || !MT.Mouse.Hover.targetItem.data.segment || MT.Mouse.Hover.targetItem.data.segment != LE.State.selectedPoint)){
									LE.unselectPoint(LE.State.selectedPoint);
								}
								MT.redraw();
							},
							refreshCursor: function(){
								if(this.active){
									UI.Cursor.activate('crosshairs');
								}
							},
							refreshUI: function(){
								if(LE.UI.Group && LE.UI.Group.children){
									for(var i=0; i < LE.UI.Group.children.length; i++){
										var item = LE.UI.Group.children[i];
										if(item && item.data && item.data.segment && item.data.segment != this.State.target){
											LE.UI.Outline.removeFromSegment(item.data.segment);
										}
									}
								}
								if(LE.State.selectedPoint){
									var item = LE.State.selectedPoint;
									if(!item.outline){
										this.UI.Outline.addToSegment( item );
									}
									if(item.outline){
										var delta = item.point.subtract(item.outline.position);
										item.outline.translate(delta);
									}
								}
							},
							reset: function(){
								// unselect all points
								LE.unselectPoint();
							},
							selectPoint: function(item){
								// make sure target is selected
								if(item && LE.State.selectedPoint != item){
									LE.UI.Outline.removeFromSegment(LE.State.selectedPoint);

									LE.State.selectedPoint = item;
									LE.UI.Outline.addToSegment(LE.State.selectedPoint);
								}
							},
							unselectPoint: function(item){
								if(item == undefined){
									item = LE.State.selectedPoint;
								}
								// unselect all points
								if(item && LE.State.selectedPoint == item){
									if(item.outline){
										item.outline.remove();
										item.outline = undefined;
									}
									LE.State.selectedPoint = undefined;
								}
							},
							onSelectionChange: function(){
								if(!MT.Selection.count()){
									this.reset();
								}
							},
							onDoubleClick: function(event){
								if(LE.active && LE.State.target && event.event && event.event.button === 0){
									if(LE.State.target.path && LE.State.target.path.segments && LE.State.target.path.segments.length > 2){
										if(LE.State.Append){
											LE.exitAppend();
										}
										LE.unselectPoint(LE.State.target);
										LE.State.target.remove();
										MT.redraw();
									}
								}
							},
							onKeyDown: function(event){
								if(LE.active && LE.State){
									if(LE.State.Append){
										// Append Mode
										if(event.key == 'escape'){
											LE.exitAppend();
											MT.checkActive();
											return;
										}
									}
								}
							},
							onMouseDown: function(event){
								if(LE.active && LE.State.target){
									LE.State.mouseDownExitAppend = false;
									if(LE.State.Append){
										// Append Mode
										if(event.event.button == 2){
											// right click cancels
											LE.State.mouseDownExitAppend = true;
											LE.exitAppend();
											MT.checkActive();
											return;
										}
										if(LE.State.Append.lastPoint && LE.State.Append.nextPoint && 
											(LE.State.Append.lastPoint.x != LE.State.Append.nextPoint.x || LE.State.Append.lastPoint.y != LE.State.Append.nextPoint.y)){
											// mouse down somewhere not on the last point
											// add a new point
											var pt = LE.State.Append.nextPoint.clone();
											Util.Bound.point( pt );

											// integrate with ShapeConnector utility
											var SC = MT.Utils['ShapeConnector'];
											var connectTo;
											if(SC){
												connectTo = SC.Points.hitTest(event.point);
												if(connectTo && connectTo.position){
													pt.set(connectTo.position);
												}
											}
											var newSegment, lastSegment;
											if(LE.State.Append.toStart){
												if(LE.State.Append.target.segments.length){
													lastSegment = LE.State.Append.target.segments[0];
												}
												newSegment = LE.State.Append.target.insert(0, pt);
											}
											else{
												if(LE.State.Append.target.segments.length){
													lastSegment = LE.State.Append.target.segments[LE.State.Append.target.segments.length-1];
												}
												newSegment = LE.State.Append.target.add(pt);
											}
											if(newSegment && lastSegment && lastSegment.data && lastSegment.data.connection){
												SC.disconnect(lastSegment, lastSegment.data.connection);
											}
											if(newSegment && connectTo && connectTo.data && connectTo.data.type == 'connection-point'){
												SC.connect(newSegment, connectTo.data.connection, connectTo.data.item);
											}

											// advance the last point and next point
											LE.State.Append.lastPoint = pt;
											LE.State.Append.nextPoint = UI.Mouse.State.point.clone();

											// select the new end point
											this.selectPoint(newSegment);

											// refresh UI
											this.onMouseMove(event);
											MT.redraw();
										}
									}
									else if(LE.State.target){
										LE.selectPoint(LE.State.target);
									}
								}
							},
							onMouseDrag: function(event){
								if(this.active && event.delta && this.State.target){
									// Append Mode
									if(event.event.button == 2){
										// right click cancels
										LE.State.mouseDownExitAppend = true;
										LE.exitAppend();
										MT.checkActive();
										return;
									}
									if(!this.State.Append){
										this.State.Drag = true;

										// make sure target is selected
										if(this.State.selectedPoint != this.State.target){
											this.selectPoint(this.State.target);
										}

										if(this.State.selectedPoint){
											// calculate the new position for the item
											var item = this.State.selectedPoint;
											var pt = item.point.add(event.delta);

											// integrate with ShapeConnector utility
											var SC = MT.Utils['ShapeConnector'];
											var connectTo;
											if(SC){
												connectTo = SC.Points.hitTest(event.point);
												if(connectTo && connectTo.position){
													pt.set(connectTo.position);
												}
											}

											// set the item's new position
											item.point.set(pt);

											if(SC && item){
												if(connectTo && connectTo.data && connectTo.data.type == 'connection-point'){
													SC.connect(item, connectTo.data.connection, connectTo.data.item);
												}
												else if(item.data && item.data.connection){
													SC.disconnect(item, item.data.connection);
												}
											}
										}

										MT.redraw();
									}
								}
							},
							onMouseUp: function(event){
								if(this.active && this.State.target){
									if(this.State.Drag){
										// released a drag
										if(this.State.selectedPoint){
											var item = this.State.selectedPoint;
											var pt = item.point.clone();
											Util.Bound.point( pt );

											var SC = MT.Utils['ShapeConnector'];
											var connectTo;
											if(SC){
												connectTo = SC.Points.hitTest(event.point);
												if(connectTo && connectTo.position){
													pt.set(connectTo.position);
												}
											}

											item.point.set( pt );

											if(SC){
												if(connectTo && connectTo.data && connectTo.data.type == 'connection-point'){
													SC.connect(item, connectTo.data.connection, connectTo.data.item);
												}
												else if(item.data && item.data.connection){
													SC.disconnect(item, item.data.connection);
												}
											}
										}
										this.State.Drag = undefined;
										MT.redraw();
									}
									else if(!this.State.Append && !LE.State.mouseDownExitAppend){
										if(this.State.target.path && this.State.target.path.segments){
											var pathSegments = this.State.target.path.segments;
											var segIndex = this.State.target.index;
											if(segIndex === 0 || segIndex === pathSegments.length-1){
												// end point clicked
												// enter Append Mode
												LE.State.Append = {
													target: LE.State.target.path,
													toStart: (segIndex === 0),
													lastPoint: LE.State.target.point,
													nextPoint: undefined,
													Line: undefined
												};
												// set next point at Mouse position
												var pt = UI.Mouse.State.point.clone();
												Util.Bound.point( pt );
												LE.State.Append.nextPoint = pt;

												// create a line from last point to next point
												LE.State.Append.Line = new paper.Path(LE.State.Append.lastPoint, LE.State.Append.nextPoint);
												LE.State.Append.Line.set({style: LE.State.target.path.style});
											}
										}	
									}
								}
							},
							onMouseMove: function(event){
								var oldTarget = this.State.target;
								if(MT.Mouse.Hover.target && MT.Mouse.Hover.targetSelected && MT.Mouse.Hover.target.type == 'segment' && MT.Mouse.Hover.target.segment){
									this.State.target = MT.Mouse.Hover.target.segment;
									MT.checkActive();
								}
								else if(MT.Mouse.Hover.targetItem && LE.UI.Group && MT.Mouse.Hover.targetItem.isDescendant(LE.UI.Group) 
									&& MT.Mouse.Hover.targetItem.data && MT.Mouse.Hover.targetItem.data.type == 'segment-outline'){

									if(MT.Mouse.Hover.targetItem.data.segment && this.State.target != MT.Mouse.Hover.targetItem.data.segment){
										this.State.target = MT.Mouse.Hover.targetItem.data.segment;
										MT.checkActive();
									}
								}
								else if(this.State.Append){
									if(this.State.Append.Line){
										var pt = UI.Mouse.State.point.clone();
										Util.Bound.point( pt );
										// integrate with ShapeConnector utility
										if(MT.Utils['ShapeConnector']){
											var connectTo = MT.Utils['ShapeConnector'].Points.hitTest(event.point);
											if(connectTo && connectTo.position){
												pt.set(connectTo.position);
											}
										}
										LE.State.Append.nextPoint.set(pt);
										LE.State.Append.Line.removeSegments();
										LE.State.Append.Line.add(LE.State.Append.lastPoint, LE.State.Append.nextPoint);
									}
								}
								else if(this.State.target){
									this.UI.Outline.removeFromSegment(this.State.target);
									this.State.target = undefined;
									MT.setUtilityControl(false);
									MT.checkActive();
								}
							}
						};
						LE.UI.Outline = {
							addToSegment: function(segment){
								if(segment && !segment.outline){
									segment.outline = new paper.Path.Circle( segment.point, 12, 12 );
									segment.outline.data.locked = true;
									segment.outline.data.type = 'segment-outline';
									segment.outline.data.segment = segment;
									segment.outline.remove();
									segment.outline.strokeWidth = 3;
									segment.outline.strokeColor = '#00AA33';
									segment.outline.fillColor = '#FFFFFF';
									segment.outline.opacity = 0.75;
									segment.outline.onDoubleClick = LE.onDoubleClick;
									LE.UI.assertGroup();
									LE.UI.Group.addChild(segment.outline);
								}
							},
							removeFromSegment: function(segment){
								if(segment && segment.outline){
									segment.outline.remove();
									segment.outline = undefined;
								}
							}

						};
						Tools.addUtility('LineEditor', LE);
					}
				},
				load: function(lines){
					var defer = $.Deferred();
					for(var i=0; i < lines.length; i++){
						var line = lines[i];
						if(!line.id){
							continue;
						}
						self.lines.push(line);
					}
					Palette.Lines.refreshPanel();
					defer.resolve();
					return defer;
				},
				applyStyle: function(line, style){
					if(line && style){
						for(var prop in style){
							line[prop] = style[prop];
						}
					}
				},
				refreshPanel: function(){
					if(UI.Dock.isSet()){
						if(!self.linesPanel){
							self.linesPanel = $('<ul class="sl-palette sl-lines"></ul>');
							var linesPanelWrap = $('<div class="sl-palette-wrap sl-dock-scroll"></div>');
							linesPanelWrap.append(self.linesPanel);
							UI.dock.append(linesPanelWrap);
						}
						self.linesPanel.empty();
						for(var i=0; i < self.lines.length; i++){
							var line = self.lines[i];
							var newLineButton = $('<a class="sl-palette-button sl-line-button"></a>');
							newLineButton.data('line', line);
							newLineButton.mousedown(function lineButtonClicked(){
								self.tools.lines.activate();
								self.tools.lines.setLine($(this).data('line'));
							});

							var width = (this.config.preview && this.config.preview.width ) || 50;
							var height = (this.config.preview && this.config.preview.height ) || 50;
							var linePreviewCanvas = $('<canvas width="'+width+'" height="'+height+'"></canvas>');
							var linePreview = linePreviewCanvas[0].getContext("2d");
							if(line.style){
								if(line.style.strokeColor){
									linePreview.strokeStyle = line.style.strokeColor;
								}
								if(line.style.strokeWidth){
									linePreview.lineWidth = line.style.strokeWidth;
								}
								if(line.style.dashArray){
									linePreview.setLineDash(line.style.dashArray);
								}
							}
							linePreview.beginPath();
							linePreview.moveTo(0, height/2.0);
							linePreview.lineTo(width, height/2.0);
							linePreview.stroke();

							var newLineContent = $('<div class="sl-palette-content sl-palette-img sl-line-content sl-line-img" draggable="false"></div>');
							var newLineImage = $('<img src="'+linePreviewCanvas[0].toDataURL("image/png")+'"></img>');
							newLineContent.append(newLineImage);
							newLineButton.append(newLineContent);

							newLineContent = $('<span class="sl-palette-content sl-line-content">'+(line.name || line.id)+'</span>');
							newLineButton.append(newLineContent);

							var newLineItem = $('<li class="sl-palette-item sl-line"></li>');
							newLineItem.append(newLineButton);

							self.linesPanel.append(newLineItem);
						}
					}
				}
			},

			Stamps: {
				config: {},
				stamps: [],
				init: function(config){
					this.config = config;
				},
				initTools: function(){
					var MT = self.tools['master'];
					var SC = {
						UI: {
							ConnectionPoints: undefined,

							createConnectionPoints: function(){
								if(!this.ConnectionPoints){
									this.ConnectionPoints = new paper.Group();
									this.ConnectionPoints.remove();
								}
								for(var i=0; i < Palette.Stamps.stamps.length; i++){
									var item = Palette.Stamps.stamps[i];
									this.createConnectionPointsForStamp(item);
									
								}
								MT.UI.enable(this.ConnectionPoints);
							},
							createConnectionPointsForStamp: function(item){
								if(item && item.data && item.data.connections){
									var connections = item.data.connections;
									for(var i=0; i < connections.length; i++){
										var connection = connections[i];
										var point = Palette.Stamps.denormalizePoint( new paper.Point(connection.source), item );
										var connectUI = new paper.Shape.Circle(point, 9);
										connectUI.data.locked = true;
										connectUI.data.type = 'connection-point';
										connectUI.data.item = item;
										connectUI.data.connection = connection;
										connectUI.strokeColor = '#9900AA';
										connectUI.strokeWidth = 3;
										connectUI.strokeScaling = false;
										connectUI.fillColor = '#FFFFFF';
										connectUI.opacity = 0.75;
										this.ConnectionPoints.addChild(connectUI);
									}
								}
							},
							eachConnectionPoints: function(callback, args){
								if(this.ConnectionPoints && this.ConnectionPoints.children && typeof callback == 'function'){
									for(var i=0; i < this.ConnectionPoints.children.length; i++){
										var connectionPoint = this.ConnectionPoints.children[i];
										var item = ((connectionPoint && connectionPoint.data) ? connectionPoint.data.item : undefined);
										if(callback(connectionPoint, item, i, args) === true){
											return;
										}
									}
								}
							},
							hasConnectionPoints: function(){
								return (this.ConnectionPoints && this.ConnectionPoints.children && this.ConnectionPoints.children.length);
							},
							removeConnectionPoints: function(immediate){
								if(this.ConnectionPoints){
									this.ConnectionPoints.removeChildren();
									MT.UI.disable(this.ConnectionPoints);
								}
							}
						},
						connect: function(segment, connection, item){
							if(connection && connection.connected && connection.connected.indexOf(segment) == -1){
								connection.connected.push(segment);
								if(!segment.data){
									segment.data = {};
								}
								if(segment.data && (segment.data.connection != connection || segment.data.connectedTo != item)){
									this.disconnect(segment, segment.data.connection);
								}
								segment.data.connection = connection;
								segment.data.connectedTo = item;
							}
						},
						disconnect: function(segment, connection){
							if(!connection && segment && segment.data && segment.data.connection){
								connection = segment.data.connection;
							}
							if(connection && connection.connected){
								var connectedIdx = connection.connected.indexOf(segment);
								if(connectedIdx != -1){
									connection.connected.splice(connectedIdx, 1);
								}
								if(segment.data){
									segment.data.connection = undefined;
									segment.data.connectedTo = undefined;
								}
							}
						},
						refreshConnected: function(item){
							if(item && item.data && item.data.connections){
								for(var i=0; i < item.data.connections.length; i++){
									var connection = item.data.connections[i];
									if(connection && connection.source && connection.connected && connection.connected.length){
										for(var j=0; j < connection.connected.length; j++){
											var connected = connection.connected[j];
											var point = Palette.Stamps.denormalizePoint( new paper.Point(connection.source), item );
											connected.point.set(point);
										}
									}
								}
							}
						},
						Points: {
							hitTest: function(point){
								// check if the point is on a connection point
								var connection = { check: point };
								SC.UI.eachConnectionPoints(function checkConnectionPoint(connectPt, connectionItem, idx, match){
									var hit = connectPt.hitTest(match.check);
									if(hit && hit.item){
										connection.hit = hit.item;
									}
								}, connection);
								return connection.hit;
							},
							each: function(callback, args){
								if(typeof callback == 'function'){
									for(var i=0; i < Palette.Stamps.stamps.length; i++){
										var item = Palette.Stamps.stamps[i];
										if(item && item.data && item.data.stamp && item.data.stamp.connections){
											var connections = item.data.stamp.connections;
											for(var j=0; j < connections.length; j++){
												if(callback(connections[j], item, j, args) === true){
													return;
												}
											}
										}
									}
								}
							}
						},
						onMouseHoverTargetChange: function(event){
							var target = event.target;
							var oldTarget = event.oldTarget;

							var targetSegment = ((target && target.segment)?target.segment:undefined);
							var oldTargetSegment = ((oldTarget && oldTarget.segment)?oldTarget.segment:undefined);

							if(!targetSegment && target && target.item && target.item.data && target.item.data.segment){
								targetSegment = target.item.data.segment;
							}

							if(!oldTargetSegment && oldTarget && oldTarget.item && oldTarget.item.data && oldTarget.item.data.segment){
								oldTargetSegment = oldTarget.item.data.segment;
							}
							var endTargetted = false;
							var wasEndTargetted = false;
							if(targetSegment != oldTargetSegment){
								var pathSegments, segIndex;
								if(targetSegment && targetSegment.path && MT.Selection.contains(targetSegment.path)){
									pathSegments = targetSegment.path.segments;
									segIndex = targetSegment.index;
									if(segIndex === 0 || segIndex === pathSegments.length-1){
										endTargetted = true;
									}
								}
								if(oldTargetSegment && oldTargetSegment.path){
									pathSegments = oldTargetSegment.path.segments;
									segIndex = oldTargetSegment.index;
									if(segIndex === 0 || segIndex === pathSegments.length-1){
										wasEndTargetted = true;
									}
								}
							}
							if(endTargetted){
								this.UI.createConnectionPoints();
							}
							else if(wasEndTargetted 
								&& (!MT.Utils['LineEditor'] || !MT.Utils['LineEditor'].State || !MT.Utils['LineEditor'].State.selectedPoint)
								&& (!self.tools['lines'] || !self.tools['lines'].active )){
								this.UI.removeConnectionPoints();
							}
						}
					};
					Tools.addUtility('ShapeConnector', SC);
				},
				denormalizePoint: function(point, stamp){
					if(point && stamp && stamp.position && stamp.strokeBounds){
						var rotation = stamp.rotation;
						if(rotation){
							stamp.rotate(-rotation);
						}
						var bounds = new paper.Point(stamp.strokeBounds.width/2.0, stamp.strokeBounds.height/2.0);
						point = stamp.position.add(point.multiply(bounds));
						if(rotation){
							stamp.rotate(rotation);
							point = point.rotate(rotation, stamp.position);
						}
						return point;
					}
				},
				Connections: {
					normalize: function(stamp){
						if(stamp.connections){
							if(stamp.symbol.item){
								var size = stamp.symbol.item.strokeBounds;
								for(var i=0; i < stamp.connections.length; i++){
									var connection = stamp.connections[i];
									if(size.width && (connection.x < -1.0 || connection.x > 1.0)){
										connection.x /= (size.width/2.0);
									}
									if(size.height && (connection.y < -1.0 || connection.y > 1.0)){
										connection.y /= (size.height/2.0);
									}
								}
							}
						}
					}
				},
				load: function(stamps, path){
					if(path == undefined){
						path = this.config.path;
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
								Palette.Stamps.Connections.normalize( this.stamp );
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
						newStamp.data.type = 'stamp';
						newStamp.data.stamp = stamp;
						if(newStamp.data.stamp.connections){
							newStamp.data.connections = [];
							for(var i=0; i < newStamp.data.stamp.connections.length; i++){
								newStamp.data.connections.push({
									source: newStamp.data.stamp.connections[i],
									connected: []
								});
							}
						}
						if(newStamp.bounds.width && newStamp.bounds.height){
							newStamp.scale(size.width/newStamp.bounds.width, size.height/newStamp.bounds.height, newStamp.bounds.topLeft);
						}
						this.stamps.push(newStamp);
					}
				},
				refreshPanel: function(){
					if(UI.Dock.isSet()){
						if(!self.stampsPanel){
							self.stampsPanel = $('<ul class="sl-palette sl-stamps"></ul>');
							var stampsPanelWrap = $('<div class="sl-palette-wrap sl-dock-scroll"></div>');
							stampsPanelWrap.append(self.stampsPanel);
							UI.dock.append(stampsPanelWrap);
						}
						self.stampsPanel.empty();
						for(var i=0; i < self.stamps.length; i++){
							var stamp = self.stamps[i];
							var newStampButton = $('<a class="sl-palette-button sl-stamp-button"></a>');
							newStampButton.data('stamp', stamp);
							newStampButton.click(function stampButtonClicked(){
								Palette.Stamps.new($(this).data('stamp'));
							});

							var newStampContent = $('<div class="sl-palette-content sl-palette-img sl-stamp-content sl-stamp-img" draggable="true"></div>');
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

							newStampContent = $('<span class="sl-palette-content sl-stamp-content">'+(stamp.name || stamp.id)+'</span>');
							newStampButton.append(newStampContent);


							var newStampItem = $('<li class="sl-palette-item sl-stamp"></li>');
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
					if(UI.Dock.isSet() && !self.ui.toolsPanel){
						self.ui.toolsPanel = $('<ul class="sl-tools"></ul>');
						UI.dock.prepend(self.ui.toolsPanel);
					}

					Tools.initMaster();
				}
				Palette.initTools();
			},
			activateDefault: function(){
				if(Tools.defaultTool){
					Tools.defaultTool.activate();
				}
				UI.Cursor.activate();
			},
			addButton: function(toolID, icon, callback){
				if(self.ui.toolsPanel){
					var newButton = $('<a class="sl-tool-button"></a>');
					newButton.click(callback);
					newButton.append($('<span class="sl-tool-icon icon-'+icon+'"></span>'));
					var newTool = $('<li class="sl-tool sl-tool-'+toolID+'"></li>');
					newTool.append(newButton);
					self.ui.toolsPanel.append(newTool);
				}
			},
			addTool: function(toolID, tool){
				self.tools[toolID] = tool;
			},
			addUtility: function(utilityID, utility){
				if(self.tools['master'] && self.tools['master'].Utils && !self.tools['master'].Utils[utilityID]){
					self.tools['master'].Utils[utilityID] = utility;
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
					each: function(callback, data){
						if(typeof callback == 'function'){
							for(var i=0; i < this.Group.children.length; i++){
								callback(this.Group.children[i], i, data);
							}
						}
					},
					refresh: function(changed){
						if(changed){
							this.refreshSelected();
						}
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
					refreshSelected: function(){
						var items = this.Group.children;
						for(var i=0; i < items.length; i++){
							items[i].selected = (this.count() > 1 || (items[i].data && items[i].data.type == 'line'));
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
						this.Group.bringToFront();
					},
					remove: function(item){
						if(item && this.contains(item)){
							item.remove();
							paper.project.activeLayer.addChild(item);
						}
					}
				};

				MT.activateUtil = function(util){
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
							if(typeof this.active.enableUI == 'function'){
								this.active.enableUI();
							}
							if(typeof this.active.activate == 'function'){
								this.active.activate();
							}
						}
					}
				};
				MT.setUtilityControl = function(utilityControl){
					var oldValue = this.utilityControl;
					this.utilityControl = utilityControl;
					if(this.utilityControl != oldValue){
						if(this.utilityControl){
							MT.utilsHandleInactive('disableUI');
						}
						else{
							MT.utilsHandleInactive('enableUI');
						}
					}
				};
				MT.utilsHandle = function(func, args, forceAll){
					if(this.utilityControl && !forceAll){
						MT.utilsHandleActive(func, args);
					}
					else{
						for(var name in this.Utils){
							var util = this.Utils[name];
							if(typeof util[func] == 'function'){
								util[func](args);
							}
						}
					}
				};
				MT.utilsHandleActive = function(func, args){
					if(this.active && typeof this.active[func] == 'function'){
						this.active[func](args);
					}
				};
				MT.utilsHandleInactive = function(func, args){
					for(var name in this.Utils){
						var util = this.Utils[name];
						if(!util.active && typeof util[func] == 'function'){
							util[func](args);
						}
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
								var cursor;
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

							MT.Mouse.Hover.selection = (UI.Mouse.State.active && UI.Mouse.State.point && MT.Selection.UI.outline && MT.Selection.UI.outline.visible && MT.Selection.UI.outline.contains(UI.Mouse.State.point));

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
							if(MT.Mouse.Hover.selection && !MT.Utils.Select.multi && (MT.Mouse.Hover.targetLocked || !MT.Mouse.Hover.targetUnselected)){
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
								
								if(MT.Utils['ShapeConnector']){
									MT.Selection.each(function processDragged(item, idx, data){
										if(item && item.data && item.data.connections){
											MT.Utils['ShapeConnector'].refreshConnected(item);
										}
										if(item && item.segments){
											for(var i=0; i < item.segments.length; i++){
												var segment = item.segments[i];
												if(segment.data && segment.data.connectedTo){
													MT.Utils['ShapeConnector'].refreshConnected(segment.data.connectedTo);
												}
											}
										}
									});
								}
								MT.redraw();
							}
						},
						onMouseUp: function(event){
							if(this.active && UI.Mouse.State.button.drag){
								var position = MT.Selection.Group.position.clone();
								position = Util.Bound.position(position, MT.Selection.Group);

								var delta = position.subtract(MT.Selection.Group.position);
								MT.Selection.Group.translate(delta);

								MT.Selection.each(function processMoved(item, idx, data){
									if(item && item.data && item.data.type == 'line' && item.segments && item.segments.length){
										// since all points should be already locked to grid,
										// any offset on the first point should also apply to the entire line
										// this is more efficient than processing each point individually
										var pt = item.segments[0].point.clone();
										Util.Bound.point( pt );
										var lineDelta = pt.subtract(item.segments[0].point);
										item.translate(lineDelta);
									}

									if(MT.Utils['ShapeConnector']){
										if(item && item.data && item.data.connections){
											MT.Utils['ShapeConnector'].refreshConnected(item);
										}
										if(item && item.segments){
											for(var i=0; i < item.segments.length; i++){
												var segment = item.segments[i];
												if(segment.data && segment.data.connectedTo){
													MT.Utils['ShapeConnector'].refreshConnected(segment.data.connectedTo);
												}
											}
										}
									}
								});
								MT.redraw();
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
						disableUI: function(){
							if(this.UI.Group){
								this.UI.Group.visible = false;
							}
						},
						enableUI: function(){
							if(this.UI.Group){
								this.UI.Group.visible = true;
							}
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
										this.UI.Group.remove(); // remove it from main layer, it gets added to MT.UI when enabled
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

								MT.Selection.each(function processRotated(item, idx, data){
									if(MT.Utils['ShapeConnector']){
										if(item && item.data && item.data.connections){
											MT.Utils['ShapeConnector'].refreshConnected(item);
										}
										if(item && item.segments){
											for(var i=0; i < item.segments.length; i++){
												var segment = item.segments[i];
												if(segment.data && segment.data.connectedTo){
													MT.Utils['ShapeConnector'].refreshConnected(segment.data.connectedTo);
												}
											}
										}
									}
								});
								
								MT.redraw();
							}
						},
						onMouseMove: function(event){
							MT.Mouse.Hover.rotateHandle = (this.UI.Group && this.UI.Group.visible && this.UI.currentHandle && this.UI.currentHandle.strokeBounds.contains(UI.Mouse.State.point));
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
									MT.Selection.each(function scaleItem(item, idx, data){
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

										if(MT.Utils['ShapeConnector']){
											if(item && item.data && item.data.connections){
												MT.Utils['ShapeConnector'].refreshConnected(item);
											}
											if(item && item.segments){
												for(var i=0; i < item.segments.length; i++){
													var segment = item.segments[i];
													if(segment.data && segment.data.connectedTo){
														MT.Utils['ShapeConnector'].refreshConnected(segment.data.connectedTo);
													}
												}
											}
										}
									}, data);

									MT.redraw();
								}
							}
						},
						onMouseUp: function(event){
							if(this.active && UI.Mouse.State.button.drag && MT.Selection.count()){
								MT.Selection.each(function processScaled(item){
									Util.Bound.lockToGrid(item);

									if(MT.Utils['ShapeConnector']){
										if(item && item.data && item.data.connections){
											MT.Utils['ShapeConnector'].refreshConnected(item);
										}
										if(item && item.segments){
											for(var i=0; i < item.segments.length; i++){
												var segment = item.segments[i];
												if(segment.data && segment.data.connectedTo){
													MT.Utils['ShapeConnector'].refreshConnected(segment.data.connectedTo);
												}
											}
										}
									}
								});
								MT.redraw();
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

							if(UI.Mouse.State.active && UI.Mouse.State.point && MT.Selection.UI.outline && MT.Selection.UI.outline.visible){
								var checkBounds = MT.Selection.UI.outline.handleBounds.expand(edgeSize);
								if(checkBounds.contains(UI.Mouse.State.point)){
									var checkRect = new paper.Rectangle();
									var checkPoint = new paper.Point();

									checkPoint.set(checkBounds.right, checkBounds.top+edgeSize);
									checkRect.set(checkBounds.topLeft, checkPoint);
									MT.Mouse.Hover.selectionEdge.top = checkRect.contains(UI.Mouse.State.point);

									checkPoint.set(checkBounds.left, checkBounds.bottom-edgeSize);
									checkRect.set(checkPoint, checkBounds.bottomRight);
									MT.Mouse.Hover.selectionEdge.bottom = checkRect.contains(UI.Mouse.State.point);

									checkPoint.set(checkBounds.left+edgeSize, checkBounds.bottom);
									checkRect.set(checkBounds.topLeft, checkPoint);
									MT.Mouse.Hover.selectionEdge.left = checkRect.contains(UI.Mouse.State.point);

									checkPoint.set(checkBounds.right-edgeSize, checkBounds.top);
									checkRect.set(checkPoint, checkBounds.bottomRight);
									MT.Mouse.Hover.selectionEdge.right = checkRect.contains(UI.Mouse.State.point);
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
				MT.activateUtil(MT.Utils.Select);

				MT.checkActive = function(){
					if(UI.Mouse.State.active && UI.Mouse.State.point && !this.utilityControl){
						var activate;
						for(var name in this.Utils){
							if(typeof this.Utils[name].activatePriority == 'function'){
								var priority = this.Utils[name].activatePriority(UI.Mouse.State.point);
								if(priority >= 0 && (!activate || priority <= activate.priority)){
									if(!activate){
										activate = {};
									}
									activate.name = name;
									activate.util = this.Utils[name];
									activate.priority = priority;
								}
							}
						}
						if(activate && activate.util){
							this.activateUtil(activate.util);
						}
					}
				};

				MT.checkTarget = function(){
					if(UI.Mouse.State.active && UI.Mouse.State.point){
						var oldTarget = this.Mouse.Hover.target;
						var target = paper.project.hitTest(UI.Mouse.State.point);
						this.Mouse.Hover.target = target;
						this.Mouse.Hover.targetItem = ((target && target.item) ? target.item : null);
						this.Mouse.Hover.targetLocked = (target && target.item && target.item.data && target.item.data.locked);
						if( (!target && oldTarget) || (target && !oldTarget) || (target && oldTarget && (target.item != oldTarget.item || target.segment != oldTarget.segment)) ){							
							MT.utilsHandle('onMouseHoverTargetChange', {target: target, oldTarget: oldTarget}, true);
						}
					}
				};

				MT.redraw = function(){
					MT.Selection.refresh();
					MT.utilsHandle('refreshUI');
				};

				MT.onActivate = function(event){
					MT.checkActive();
				};
				MT.onKeyDown = function(event){
					this.utilsHandle('onKeyDown', event);
				};
				MT.onKeyUp = function(event){
					this.utilsHandle('onKeyUp', event);
				};
				MT.onMouseMove = function(event){
					this.checkTarget();
					this.checkActive();
					this.utilsHandle('onMouseMove', event);
				};
				MT.onMouseDown = function(event){
					this.utilsHandle('onMouseDown', event);
				};
				MT.onMouseUp = function(event){
					this.utilsHandle('onMouseUp', event);
				};
				MT.onMouseDrag = function(event){
					this.utilsHandle('onMouseDrag', event);
				};

				MT.onSelectionChange = function(){
					this.utilsHandle('onSelectionChange');
				};

				Tools.addTool('master', MT);
				Tools.defaultTool = MT;
			}
		};

		var UI = {
			init: function(config){
				if(!config){
					config = {};
				}
				if(SL.Canvas.isSet()){
					if(!UI.Dock.isSet()){
						UI.Dock.init();
					}
				}

				UI.Cursor.init(config.Cursors);
				UI.Mouse.init(config.Mouse);
			},
			Cursor: {
				active: undefined,
				custom: {},
				init: function(config){
					if(!config){
						config: {};
					}
					UI.Cursor.config = config;
					if(config.custom){
						for(var name in config.custom){
							UI.Cursor.loadCustom(name, config.custom[name]);
						}
					}
					if(!UI.Cursor.active){
						UI.Cursor.activate();
					}
				},
				activate: function(name){
					if(!name){
						name = UI.Cursor.config.default || 'crosshair';
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
				loadCustom: function(name, config){
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
							if(!UI.Cursor.awesomeLoaded && SL.Canvas.isSet()){
								var awesome = config.awesomeCursor;
								self.canvas.awesomeCursor(
									(awesome.icon || name), 
									awesome
								);
								UI.Cursor.activate();
								UI.Cursor.awesomeLoaded = true;
							}
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
			},
			Mouse: {
				State: {
					point: new paper.Point(0, 0),
					button: {}
				},
				init: function(config){
					if(!config){
						config: {};
					}
					UI.Mouse.config = config;
					var Handle = {};
					Handle.onMouseEnter = function(event){
						UI.Mouse.State.active = true;
					};
					Handle.onMouseLeave = function(event){
						UI.Mouse.State.active = false;
					};
					Handle.onMouseMove = function(event){
						UI.Mouse.State.point.x = event.point.x;
						UI.Mouse.State.point.y = event.point.y;
					};
					Handle.onMouseDown = function(event){
						UI.Mouse.State.button.active = event.event.button;
						UI.Mouse.State.button.down = event.point;
					};
					Handle.onMouseUp = function(event){
						setTimeout(function(){
							UI.Mouse.State.button.active = undefined;
							UI.Mouse.State.button.down = undefined;
							UI.Mouse.State.button.drag = undefined;
						});
					};
					Handle.onMouseDrag = function(event){
						UI.Mouse.State.point.x = event.point.x;
						UI.Mouse.State.point.y = event.point.y;
						if(!UI.Mouse.State.button.drag){
							// create a new drag with first point where the mouse was pressed
							UI.Mouse.State.button.drag = {
								points: [ UI.Mouse.State.button.down ]
							};
						}
						UI.Mouse.State.button.drag.points.push(event.point);
						if(UI.Mouse.config && UI.Mouse.config.dragMaxPoints != undefined){
							if(UI.Mouse.State.button.drag.points.length > UI.Mouse.config.dragMaxPoints){
								UI.Mouse.State.button.drag.points.splice(0, (UI.Mouse.State.button.drag.points.length-UI.Mouse.config.dragMaxPoints));
							}
						}
					};
					UI.Mouse.Handlers = Handle;

					if(paper.view){
						UI.Mouse.attachView(paper.view);
					}
				},
				attachView: function(view){
					if(view){
						for(var handler in UI.Mouse.Handlers){
							view[handler] = UI.Mouse.Handlers[handler];
						}
					}
				},
				detachView: function(view){
					if(view){
						for(var handler in UI.Mouse.Handlers){
							if(view[handler] == UI.Mouse.Handlers[handler]){
								view[handler] = undefined;
							}
						}
					}
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
				point: function(point){
					var gridSize = SL.config('grid.size');
					var origX = point.x;
					var origY = point.y;
					var check;

					// bound to grid
					check = Math.round(origX / gridSize) * gridSize;
					if(check != origX){
						point.x += (check - origX);
					}

					check = Math.round(origY / gridSize) * gridSize;
					if(check != origY){
						point.y += (check - origY);
					}

					// bound to canvas
					var canvasSize = SL.Canvas.size();
					if(point.x < 0){
						point.x = 0;
					}
					else if(point.x > canvasSize.width){
						point.x = canvasSize.width;
					}
					if(point.y < 0){
						point.y = 0;
					}
					else if(point.y > canvasSize.height){
						point.y = canvasSize.height;
					}

					return point;
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

		// constructor
		SL.init(canvas, config);

		// Public
		this.loadPalette = Palette.load;
		this.tools.activateDefault = Tools.activateDefault;
	}

	return {
		init: function(canvas, config){
			return new StampLines(canvas, config);
		}
	};
}());
// Object.values shim
Object.values = Object.values || (obj => Object.keys(obj).map(key => obj[key]));