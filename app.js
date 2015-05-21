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
			
			getSearchPageResults: function(query, x){
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
			}
      },
      
      events: {
        'keydown #zForm': 'cancelSubmission',
        'keyup #zQuery': 'submitForm',
        'app.activated': 'maintainLayout',
        'app.created': 'maintainLayout'
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
						var size = Math.ceil(data.count/100);
                        if (size==0){this.switchTo('searchbar');return;}
						var results = new Array(size-2);
						results.push(data.results);
						for (var i = 1; i < size; i++){
							this.ajax('getSearchPageResults', query, i+1)
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
      maintainLayout: function(){
          if(this.currentLocation() == "nav_bar"){
              this.switchTo('settings');
              //if location nav_bar
              //switch to settings template
              //else switch to normal template
          } else {
              this.switchTo('searchbar');
          }
      }
  };
    
}());