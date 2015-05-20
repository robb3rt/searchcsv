(function() {

  return {
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
        'keyup #zQuery': 'submitForm'
      },
      
      cancelSubmission: function(e) {
          if (e.keyCode == 13){
              e.preventDefault();
          }
      },
      
      submitForm: function(e) {
          if (e.keyCode == 13){
              if(this.$("input#zQuery")[0].value){
				  //TODO change layout to show that you're currently uploading the data to create a downloadable csv file.
                  this.ajax('getSearchResults', this.$("input#zQuery")[0].value)
                    .done(function(data) {
						var size = Math.ceil(data.count/100);
						var results = new Array(size-2);
						results.push(data.results);
						for (var i = 1; i < size; i++){
							this.ajax('getSearchPageResults', this.$("input#zQuery")[0].value, i+1)
								.done(function(restdata){
									results.push(restdata.results);
								});
						}
						this.ajax('requestCSV', results)
							.done(function(data) {
								//TODO create CSV file based on settings
								console.dir(data);
							});
                  });
              }
          }
      }
  };
    
}());