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
                  this.ajax('getTotalTickets', this.$("input#zQuery")[0].value)
                    .done(function(data) {
                      console.dir(data);
                  });
              }
          }
      }
  };
    
}());