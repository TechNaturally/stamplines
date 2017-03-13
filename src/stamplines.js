var stamplines = (function() {
	function StampLines(canvas){
		var self = this;
		this.canvas = $(canvas);

		this.stamps = [];

		function sortStamps(idOrder, debug){
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
		}

		this.loadStamps = function(stampNames, stampPath, callback){
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

					$.ajax(stamp.image, {})
					.fail(function stampImageNotFound(){
						console.error('Could not load "'+stamp.id+'" image => "'+stamp.image+'"');
						stamp.image = undefined;
					})
					.always(function stampImageProcessed(){
						self.stamps.push(stamp);
						sortStamps(stampNames);
					});
				})
				.fail(function stampNotFound(){
					console.error('Could not load "'+this.name+'.json"');
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
		};
	}

	return {
		getInstance: function(canvas){
			return new StampLines(canvas);
		}
	};
}());