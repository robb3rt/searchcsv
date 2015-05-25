(function() {

  return {
		defaultState: 'loading',
      
		requests: {
            getSearchResults: function(query){
                return {
                    url: "/api/v2/search.json?query=type:ticket " + query,
                    type: "GET",
                    dataType: "json"
                };
            },
			
			getSearchResultsByPage: function(query, x){
                return {
                    url: "/api/v2/search.json?page=" + x + "&query=type:ticket " + query,
                    type: "GET",
                    dataType: "json"
                };
            },
			requestCSV: function(data){
				return {
					url: "https://www.robberthink.com/createcsv.php",
					type: "POST",
					data: {data : data},
					cors: true
				};
			},
			getTicketFields: function(){
				return {
					url: "/api/v2/ticket_fields.json",
					type: "GET",
					dataType: "json"
				};
			},
			getTicketFieldsByPage: function(x){
				return {
					url: "/api/v2/ticket_fields.json?page=" + x,
					type: "GET",
					dataType: "json"
				};
			}
		},
      
		events: {
			'keydown #zForm': 'cancelSubmission',
			'keyup #zQuery': 'submitForm',
			'app.activated': 'maintainLayout',
			'mouseenter .sortable': 'enterOption',
			'mousedown .sortable': 'pressOption',
			'mouseout .draggingOption': 'leaveOption',
			'mouseup #mainsection': 'releaseOption',
			'mousemove #mainsection': 'moveOption',
			'scroll .main_panes': 'testReturn'
			//add on scroll
		},
		testReturn: function(e){
			e.preventDefault();
			if (mousedown){
				//el.style.top = (el.offsetTop + this.$(".main_panes").context.scrollTop) + "px";
			}
		},
		cancelSubmission: function(e) {
			if (e.keyCode == 13){
				e.preventDefault();
			}
		},
		enterOption: function(e){
			if (mousedown){
				//console.log(e);
			}
		},
		leaveOption: function(e){
			if (mousedown){
				//
			}
		},
		pressOption: function(e){
			e.preventDefault();
			mousedown = true;
			el = e.target;
			el.className = el.className + " draggingOption";
			dragoffset.x = e.pageX - el.offsetLeft;
			dragoffset.y = (e.pageY - el.offsetTop + this.$(".main_panes").context.scrollTop + 12);
		},
		releaseOption: function(e){
			mousedown = false;
			el = null;
			//console.log(e);
			dragoffset = {
					x: 0,
					y: 0
			}
		},
		moveOption: function(e){
			if (mousedown){
				//check if el is absolute or not
				e.preventDefault();
				if (el.style.position !== 'absolute'){
					var droptarget = document.createElement("li");
					droptarget.setAttribute("class", "droptarget");
					el.parentNode.insertBefore(droptarget, el.nextSibling);
					el.style.position = 'absolute';
					dragoffset.x = e.pageX - el.offsetLeft;
					dragoffset.y = (e.pageY - el.offsetTop + (this.$(".main_panes").context.scrollTop + 12));
					//once pressed create drop container.
				} else if (e.pageY > this.$(".main_panes").context.offsetHeight){
					//scroll down
					console.log(this.$(".main_panes").context.scrollTop + " " + this.$(".main_panes").context.scrollHeight);
					console.dir(this.$(".main_panes").context);
					this.$(".main_panes").context.scrollTop += 10;
				} else if (e.pageY < (here.$(".main_panes").context.offsetTop + 100)){
					//scroll up
					this.$(".main_panes").context.scrollTop -= 10;
				}
				el.style.left = (e.pageX - dragoffset.x) + "px";
				el.style.top = ((e.pageY - dragoffset.y) + this.$(".main_panes").context.scrollTop) + "px";
			}
		},
		submitForm: function(e) {
			if (e.keyCode == 13){
				if(this.$("input#zQuery")[0].value){
					var query = this.$("input#zQuery")[0].value;
					this.switchTo('loading');
					this.ajax('getSearchResults', query)
						.done(function(data) {
							if (data.count === 0){this.switchTo('searchbar');return;}
							var size = Math.ceil(data.count/100);
							var results = (size == 1) ? new Array(0) : new Array(size-2);
							results.push(data.results);
							for (var i = 1; i < size; i++){
								/*jshint loopfunc: true */
								this.ajax('getSearchResultsByPage', query, i+1)
									.done(function(restdata){
										results.push(restdata.results);
									});
							}
							console.dir(results);
							this.switchTo('searchbar');
							/*this.ajax('requestCSV', results)
								.done(function(data) {
									//TODO create CSV file based on settings
									//console.dir(data);
									this.switchTo('searchbar');
								});*/
						});
				}
			}
		},
		maintainLayout: function(e){
			if(this.currentLocation() == "nav_bar"){
				mousedown = false;
				dragoffset = {
					x: 0,
					y: 0
				}
				el = null;
				here = this;
				scrollValue = this.$(".main_panes").context.scrollTop;
				scrolled = 0;
				this.inDOM = true;
				this.ajax('getTicketFields')
					.done(function(data) {
						if (data.count === 0){this.switchTo('navbar');return;}
						var size = Math.ceil(data.count/100);
						var results = (size == 1) ? new Array(0) : new Array(size-2);
						results.push(data.ticket_fields);
						for (var i = 1; i < size; i++){
							/*jshint loopfunc: true*/
							this.ajax('getTicketFieldsByPage', i+1)
								.done(function(restdata){
									results.push(restdata.ticket_fields);
								});
						}
						var fields = new Array();
						for(var h = 0; h < results.length; h++ ){
							for(var j = 0; j < results[h].length; j++){
								var id = results[h][j].id;
								var title = results[h][j].title;
								fields.push({id: id, title: title});
							}
						}
						this.switchTo('settings', {
							ticket_fields: fields
						});
					});
			} else {
				this.switchTo('searchbar');
			}
		}
	};
    
}());