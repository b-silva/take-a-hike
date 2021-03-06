//--------------LOAD API KEY--------------//
var script = $('<script>')
  .attr('src', "https://maps.googleapis.com/maps/api/js?key=" + googleKey + "&callback=initMap")
  .attr('async','').attr('defer','');
script.appendTo($('body'));
//--------------LOAD API KEY--------------//

var hikes = [];
var markers = [];
var infowindow = null;

//--------------INITIATE MAP--------------//
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 49.2819, lng: -123.108},
    zoom: 11,
    scrollwheel:false,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  infoWindow = new google.maps.InfoWindow({content: "Holding..."});

  //--------------SET MAP STYLES--------------/
  map.set('styles',[
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [
        { hue: '#7E6511' },
        { saturation: 10 },
        { lightness: -10 }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        { lightness: -5 }
      ]
    }
  ]);

  $('#difficulty').on('change', getMarkers);
  $('#duration').on('change', getMarkers);
  $('#search_name').on('keyup', getMarkers);

  //--------------GET NEW HIKES ONCE MAP HAS CHANGED--------------/

  google.maps.event.addListener(map, 'idle', getMarkers);

  function getMarkers() {

    var difficulty = $('#difficulty').val();
    var duration = $('#duration').val();
    var name = $('#search_name').val();

    var southWest = map.getBounds().getSouthWest();
    var northEast = map.getBounds().getNorthEast();

    var position = {
      max_lat: northEast.lat(),
      min_lat: southWest.lat(),
      max_lng: northEast.lng(),
      min_lng: southWest.lng()
    };

    // Call server with ajax passing it the bounds
    $.ajax({
      method: 'get',
      url: 'hikes/nearby',
      data: {position: position, difficulty: difficulty, duration: duration, name: name},
      dataType: 'json',
      success: populateMap
    });

  }

  // Sets the map on all markers in the array.
  function setMapOnAll(map,markers) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers(markers) {
    setMapOnAll(null,markers);
  }

  // Shows any markers currently in the array.
  function showMarkers(markers) {
    setMapOnAll(map,markers);
  }

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers(markersToDelete, newMarkerArray) {
    clearMarkers(markersToDelete);
    markers = newMarkerArray;
  }

  //------ ADD ALL MARKERS TO MAP START ----//

  function populateMap(response){
    var hikes = response.hikes;
    var hikesCompleted = response.completed;

    // create map of previous markers
    var prevMarkersRef = {};
    markers.forEach(function(marker){
      prevMarkersRef[marker.id] = true;
    });


    // create map of new markers
    var newMarkersRef = {};
    hikes.forEach(function(hike){
      newMarkersRef[hike.id] = true;
    });

    // create array with new hikes only
    var newHikes = hikes.filter(function(hike){
      return !prevMarkersRef[hike.id];
    });

    // create arrays with markers to delete (outside of map view) and markers to keep (remained inside view)
    var markersToDelete = [];
    var markersToKeep = [];
    markers.forEach(function(marker){
      if (newMarkersRef[marker.id]) {
        markersToKeep.push(marker);
      } else {
        markersToDelete.push(marker);
      }
    });

    // delete markers outside view and set marker array to the markers that remained in view
    deleteMarkers(markersToDelete, markersToKeep);

    // add new markers to map
    newHikes.forEach(function(hike){
      var hikeIcon;
      var completed = '';

      if (hikesCompleted.indexOf(hike.id) >= 0) {
        completed = '-completed';
      }

      switch (hike.difficulty){
        case 1:
          hikeIcon = 'media/hiking-medium' + completed + '.png';
          hikeClass = 'medium-difficulty';
          break;
        case 2:
          hikeIcon = 'media/hiking-hard' + completed + '.png';
          hikeClass = 'hard-difficulty';
          break;
        case 3:
          hikeIcon = 'media/hiking-extreme' + completed + '.png';
          hikeClass = 'extreme-difficulty';
          break;
        default:
          hikeIcon = 'media/hiking' + completed + '.png';
          hikeClass = 'easy-difficulty';
      }

      var marker = new google.maps.Marker({
      position: {lat:hike.start_lat, lng:hike.start_lng},
      icon: hikeIcon,
      map: map,
      name: hike.name,
      id: hike.id,
      distance: hike.distance_in_km,
      time: hike.time_in_hours
      });

      markers.push(marker);

      //----- ADD INFO WINDOW FOR EACH MARKER -----//

      google.maps.event.addListener(marker, 'click', function(){
        windowContent = "<h5>"+"<a href=/hikes/"+this.id+">"+this.name+"</a></h5><p>Length: <strong>"+this.distance+"</strong> km</p><p>Duration: <strong>"+this.time+"</strong> hours</p>";
        // calcRoute(this.position);
        infoWindow.setContent(windowContent);
        infoWindow.open(map, this);
      });
    });

    // clear and repopulate table
    $('#searched_hikes').dataTable().fnDestroy();
    $('#searched_hikes').find('tbody').empty();

    hikes.forEach(function(hike){

      //------ POPULATE TABLE WITH DATA ----------//

      var hikeClass;

      switch (hike.difficulty){
        case 1:
          hikeClass = 'medium-difficulty';
          break;
        case 2:
          hikeClass = 'hard-difficulty';
          break;
        case 3:
          hikeClass = 'extreme-difficulty';
          break;
        default:
          hikeClass = 'easy-difficulty';
      }

      var name = $('<td>').append($('<a>').attr('href', '/hikes/' + hike.id).text(hike.name));
      var dist = $('<td>').text(hike.distance_in_km).addClass('distance');
      var difficulty = $('<td>').text(hike.difficulty).addClass('difficulty');
      var time = $('<td>').text(hike.time_in_hours).addClass('time');
      var rating = $('<td>').text( Math.round(hike.avg_rating) ).addClass("hide-on-collapse");

      var row = $('<tr>')
        .addClass('hike-row')
        .addClass(hikeClass)
        .attr('data-difficulty', hike.difficulty)
        .attr('data-distance', hike.distance_in_km)
        .append(name)
        .append(dist)
        .append(time)
        .append(difficulty)
        .append(rating);

      row.on('click', function(){
        $(this).find('a')[0].click();
      });
      $('#searched_hikes').append(row);

    });

    addDataTable();
  }

  //--------------------------------GEO LOCATION STUFF-----------------------//
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      map.setCenter(pos);

      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'Current Location',
        icon: 'media/here.png',
      });

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}
//------------END OF INITIATE MAP------------------//

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}
//---------------------------------GEO LOCATION STUFF-----------------------//




