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
		pressOption: function(e){
			e.preventDefault();
			//if (mousedown){return;}
			mousedown = true;
			el = e.target;
			dragoffset.x = e.pageX - el.offsetLeft;
			dragoffset.y = (e.pageY - el.offsetTop + el.style.marginTop + el.style.marginBottom + this.$(".main_panes").context.scrollTop);
		},
		releaseOption: function(e){
			mousedown = false;
			if (dragged == true){
				el.style.left = "";
				el.style.top = "";
				el.style.position = "";
				el.style.zIndex = "";
				this.$(".droptarget")[0].parentNode.insertBefore(el, this.$(".droptarget")[0].nextSibling);
				this.$(".droptarget")[0].parentNode.removeChild(this.$(".droptarget")[0]);
				//el = null;
				dragoffset = {
					x: 0,
					y: 0
				}
                coordinates = new Array();
                var itable = this.$(".sortable")
                //TODO Adjust this functionality
                for (var i = 0; i < itable.length; i++){
                    var element = itable[i];
                    var offsetleft = element.parentNode.getAttribute("id") == "settinglist" ? element.offsetLeft : element.offsetLeft + this.$("#settinglist")[0].offsetWidth;
                    coordinates.push({
                        dom: element,
                        left: (offsetleft + this.$(".sortable_table")[0].offsetLeft),
                        top: (element.offsetTop),
                        right: offsetleft + this.$(".sortable_table")[0].offsetLeft + element.offsetWidth,
                        bottom: (element.offsetTop) + element.offsetHeight
                    });
                }
			}
			dragged = false;
		},
		moveOption: function(e){
			if (mousedown){
				dragged = true;
				//check if el is absolute or not
				e.preventDefault();
				if (el.style.position !== 'absolute'){
					var droptarget = document.createElement("li");
					droptarget.setAttribute("class", "droptarget");
					el.parentNode.insertBefore(droptarget, el.nextSibling);
					el.style.position = "absolute";
					el.style.zIndex = "1000";
					dragoffset.x = e.pageX - el.offsetLeft;
					dragoffset.y = (e.pageY - el.offsetTop + (this.$(".main_panes").context.scrollTop + 12));
					//once pressed create drop container.
				} else if (e.pageY > this.$(".main_panes").context.offsetHeight){
					//scroll down
					this.$(".main_panes").context.scrollTop += 10;
				} else if (e.pageY < (here.$(".main_panes").context.offsetTop + 100)){
					//scroll up
					this.$(".main_panes").context.scrollTop -= 10;
				}
                for (var i = 0; i < coordinates.length; i++) {
                    if (e.pageX >= coordinates[i].left && e.pageX <= coordinates[i].right) {
                        if (((e.pageY - dragoffset.y) + this.$(".main_panes").context.scrollTop) >= coordinates[i].top && ((e.pageY - dragoffset.y) + this.$(".main_panes").context.scrollTop) <= coordinates[i].bottom) {
                            // Yes, the mouse is on a droppable area
                            //change coordinates
                            console.dir(coordinates[i].dom);
                            coordinates[i].dom.parentNode.insertBefore( this.$(".droptarget")[0], coordinates[i].dom.previousSibling);
                        }
                    } else {
                        // Nope, we did not hit any objects yet
                    }
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
				dragged = false;
				scrollValue = this.$(".main_panes").context.scrollTop;
				scrolled = 0;
				coordinates = new Array();
				//this.inDOM = true;
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
						//TODO load previously set ticketfields by the user
						this.switchTo('settings', {
							ticket_fields: fields
						});
						//TODO http://stackoverflow.com/questions/8614073/how-to-start-mouseover-event-while-dragging
						//check coordinates
                        var itable = this.$(".sortable")
                        for (var i = 0; i < itable.length; i++){
                            var element = itable[i];
                            var offsetleft = element.parentNode.getAttribute("id") == "settinglist" ? element.offsetLeft : element.offsetLeft + this.$("#settinglist")[0].offsetWidth;
                            coordinates.push({
                                dom: element,
                                left: (offsetleft + this.$(".sortable_table")[0].offsetLeft),
                                top: (element.offsetTop + this.$(".sortable_table")[0].offsetTop + this.$("#settinglist")[0].offsetTop),
                                right: offsetleft + this.$(".sortable_table")[0].offsetLeft + element.offsetWidth,
                                bottom: (element.offsetTop + this.$(".sortable_table")[0].offsetTop + this.$("#settinglist")[0].offsetTop) + element.offsetHeight
                            });
                        }
                    console.dir(coordinates);
					});
			} else {
				this.switchTo('searchbar');
			}
		}
	};
    
}());