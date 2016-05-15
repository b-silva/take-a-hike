$(function(){
  $('#search_form').on('keyup change',  function(){
    console.log("event activated");
    var searchName = $('#search_name').val();

    $.ajax({
      dataType: "json",
      url: "/hikes",
      data: {search_name: searchName},
      success: function(hikes){
        $('#all_hikes').remove();
        $('#searched_hikes').find('tbody').empty();
        hikes.forEach(function(hike){
          $('<tr>').addClass('new_row')
          .append($('<td>').text(hike.name).attr("href", "/hikes"+hike.id))
          .append($('<td>').text(hike.distance_in_km + ' km'))
          .append($('<td>').text(hike.time_in_hours + ' hours'))
          .append($('<td>').text(hike.difficulty))
          .appendTo('#searched_hikes');
        });
      }
    });
  });
});