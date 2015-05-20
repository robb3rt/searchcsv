(function() {

  return {
      requests: { 
            getSearchResults: function(query){
                return {
                    url: "/api/v2/search.json?query=" + query,
                    type: "GET",
                    dataType: "json"
                };
            }
      },
      
      events: {
        // Lifecycle
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
                  //do something here to submit the api call and retrieve results
                  this.ajax('getSearchResults', this.$("input#zQuery")[0].value)
                    .done(function(data) {
                      data.sort(function(a,b) {return (a.result_type > b.result_type) ? 1 : ((b.result_type > a.result_type) ? -1 : 0);} );
                      console.dir(data);
                      //send data to server
                      //create file based on configuration
                      //wait for server to create file
                  });
              }
          }
      }
  };
    
}());