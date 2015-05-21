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
				}
			},
			getTicketFields: function(){
				return {
					url: "/api/v2/ticket_fields.json",
					type: "GET",
					dataType: "json"
				}
			},
			getTicketFieldsByPage: function(x){
				return {
					url: "/api/v2/ticket_fields.json?page=" + x,
					type: "GET",
					dataType: "json"
				}
			}
      },
      
      events: {
        'keydown #zForm': 'cancelSubmission',
        'keyup #zQuery': 'submitForm',
        'app.activated': 'maintainLayout'
      },
      
      cancelSubmission: function(e) {
          if (e.keyCode == 13){
              e.preventDefault();
          }
      },
      
      submitForm: function(e) {
          if (e.keyCode == 13){
              if(this.$("input#zQuery")[0].value){
                  var query = this.$("input#zQuery")[0].value;
                  this.switchTo('loading');
                  this.ajax('getSearchResults', query)
                    .done(function(data) {
						if (data.count == 0){this.switchTo('searchbar');return;}
						var size = Math.ceil(data.count/100);
						var results = (size == 1) ? new Array(0) : new Array(size-2);
						results.push(data.results);
						for (var i = 1; i < size; i++){
							this.ajax('getSearchResultsByPage', query, i+1)
								.done(function(restdata){
									results.push(restdata.results);
								});
						}
						this.ajax('requestCSV', results)
							.done(function(data) {
								//TODO create CSV file based on settings
								console.dir(data);
                                this.switchTo('searchbar');
							});
                  });
              }
          }
      },
	  
      maintainLayout: function(e){
          if(this.currentLocation() == "nav_bar"){
			  this.ajax('getTicketFields')
                    .done(function(data) {
						if (data.count == 0){this.switchTo('navbar');return;}
						var size = Math.ceil(data.count/100);
						var results = (size == 1) ? new Array(0) : new Array(size-2);
						results.push(data.ticket_fields);
						for (var i = 1; i < size; i++){
							this.ajax('getTicketFieldsByPage', i+1)
								.done(function(restdata){
									results.push(restdata.ticket_fields);
								});
						}
						
						var fields = new Array();
						for(var i = 0; i < results.length; i++ ){
							for(var j = 0; j < results[i].length; j++){
								var id = results[i][j].id;
								var title = results[i][j].title;
								fields.push({id: id, title: title});
							}
							
							/*for (var a in results[i]){
								console.dir(a.id);
								//fields.push({id: results[i][x].id, title: results[i][x].title});
							}*/
						}
						console.dir(fields);
						this.switchTo('settings', {
							ticket_fields: fields
						});
					});
			  //get available ticket fields
          } else {
              this.switchTo('searchbar');
          }
      }
  };
    
}());