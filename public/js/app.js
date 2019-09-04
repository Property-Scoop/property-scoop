'use strict';

$('#newSearch').on('click', function(){
  $('#searchResults .hide').show();
  $('.toggle').hide();
  $('#map').css({'margin-bottom':'23vh'});


});

$('#searchResults .submit').submit('click', function(){
  setTimeout(
    function() {
      $('#map').css({'margin-bottom':'3%'});
      $('#searchResults .hide').hide();
      $('.toggle').show();

    },
    1000);
});
