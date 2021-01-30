$(document).ready(function () {

  var apiKey = 'gv6tmP4JQDOhpB8OVmK9LaoSODwYWgPAVYqlFkJh';
  var array = [];

  // initialize the Materialize select element
  $('select').formSelect();

  // code for state select button 
  document.getElementById('run-search').addEventListener('click', function () {
    $("#parkinfo").empty();
    var statesel = document.getElementById('stateselection');
    var activitysel = document.getElementsByClassName('activity');

    for (var i = 0; i < activitysel.length; i++) {
      if (activitysel[i].checked) {
        console.log(activitysel[i].value)
      }
    }

    var stateCode = statesel.value;
    var queryURL = 'https://developer.nps.gov/api/v1/parks?stateCode=' + stateCode + '&api_key=' + apiKey;

    $.get({
      url: queryURL,
    }).then(function (response) {
      console.log(response);
       // Storing data into a variable
       var parkData = response.data;

       // Loop through each data response
       for (var a = 0; a < parkData.length; a++) {
         
       // Get info for current index
       var eachPark = parkData[a];
 
       // Create a list group and class name for each data 
       var parkList = $("<ul class='collection with-header'>");
       parkList.addClass("list-group");
 
       // Add the list to the div
       $("#parkinfo").append(parkList);
 
       // Storing each returned park data name in a variable
       var parkName = eachPark.name;
       //Creating a line item with a class name and storing it in a variable
       var parkListItem = $("<li class='list-group-item parkName'>");
       
       // If the park data contains a name, create a line item and append to it
       if (parkName) {
       
         console.log(parkName);
         parkListItem.append("<h4>" + parkName + "</h4>");
       }
 
       // Converting the arrays in addresses data into strings and storing them in a variable
       var addresses = JSON.stringify(eachPark.addresses[0].line1);
       var addressesCity = JSON.stringify(eachPark.addresses[0].city);
       var addressesState = JSON.stringify(eachPark.addresses[0].stateCode);
       console.log(addresses, addressesCity, addressesState)
 
       // If the park data contains an address, city, & state, append it to the list item
       if (addresses && addressesCity && addressesState) {
         console.log(addresses, addressesCity, addressesState);
         parkListItem.append(addresses + ", " + addressesCity + ", " + addressesState);
       }
 
       // Creating variable to store park description
       var parkDescription = eachPark.description;
       console.log(parkDescription);
 
       // If the park data contains description info append it to the list item
       if (parkDescription) {
         parkListItem.append("<p>" + parkDescription + "</p>");
       }
 
       // Append and park url to the list item
       parkListItem.append("<a href='" + eachPark.url + "'>" + eachPark.url + "</a>");
       console.log(eachPark.url);
 
       // Append the list item to the unordered list
       parkList.append(parkListItem);
     }
 
      var arraylength = parseInt(response.data.length);
      for (var i = 0; i < arraylength; i++) {
        var coordinate = response.data[i].latLong;
        array.push(coordinate);
      }
      console.log(array);
    }).catch(function (error) {
      console.error(error);
    });
  });

});  // end of document ready function

// This code for geolocation and Google Maps was adapted from Chapter 5 of the following book:
// Authors: Eric Freeman & Elisabeth Robson
// Title: Head First HTML5 Programming
// Publisher: O'Reilly, 2011
var ourCoords = {
  latitude: 40.625766,
  longitude: -111.82407
};

var watchId = null;

var options = {
  enableHighAccuracy: true,
  timeout: 100,
  maximumAge: 0
};

var prevCoords = null;

window.onload = getMyLocation;

function getMyLocation() {
  if (navigator.geolocation) {
    var watchButton = document.getElementById("watch");
    watchButton.onclick = watchLocation;
    var clearWatchButton = document.getElementById("clearWatch");
    clearWatchButton.onclick = clearWatch;
  }
  else {
    alert("Oops, no geolocation support");
  }
}

function watchLocation() {
  watchId = navigator.geolocation.watchPosition(displayLocation, displayError, options);
}

function clearWatch() {
  if (watchId != null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

function displayLocation(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  var div = document.getElementById("location");
  div.innerHTML = "You are at Latitude: " + latitude + ", Longitude: " + longitude;
  div.innerHTML += " (with " + position.coords.accuracy + " meters accuracy)";
  div.innerHTML += " (found in " + options.timeout + " milliseconds)";

  var km = computeDistance(position.coords, ourCoords);
  var distance = document.getElementById("distance");
  distance.innerHTML = "You are " + km + " kilometers from home";

  if (map == null) {
    showMap(position.coords);
    prevCoords = position.coords;
  }
  else {
    var meters = computeDistance(position.coords, prevCoords) * 1000;
    if (meters > 20) {
      scrollMapToPosition(position.coords);
      prevCoords = position.coords;
    }
  }
}

function displayError(error) {
  var errorTypes = {
    0: "Unknown error",
    1: "Permission denied by user",
    2: "Position is not available",
    3: "Request timed out"
  };

  var errorMessage = errorTypes[error.code];
  if (error.code == 0 || error.code == 2) {
    errorMessage = errorMessage + " " + error.message;
  }

  var div = document.getElementById("location");
  div.innerHTML = errorMessage;
  options.timeout += 100;
  navigator.geolocation.getCurrentPosition(displayLocation, displayError, options);
  div.innerHTML += " ... checking again with timeout=" + options.timeout;
}

function computeDistance(startCoords, destCoords) {
  var startLatRads = degreesToRadians(startCoords.latitude);
  var startLongRads = degreesToRadians(startCoords.longitude);
  var destLatRads = degreesToRadians(destCoords.latitude);
  var destLongRads = degreesToRadians(destCoords.longitude);

  var Radius = 6371; // radius of the Earth in km
  var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) +
    Math.cos(startLatRads) * Math.cos(destLatRads) *
    Math.cos(startLongRads - destLongRads)) * Radius;

  return distance;
}

function degreesToRadians(degrees) {
  var radians = (degrees * Math.PI) / 180;
  return radians;
}

function degreesToDecimal(degrees, minutes, seconds) {
  return degrees + (minutes / 60.0) + (seconds / 3600.0);
}

var map;

function showMap(coords) {
  var googleLatAndLong = new google.maps.LatLng(coords.latitude, coords.longitude);

  var mapOptions = {
    zoom: 17,
    center: googleLatAndLong,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var mapDiv = document.getElementById("map");
  map = new google.maps.Map(mapDiv, mapOptions);

  var title = "Your Location";
  var content = "You are here: " + coords.latitude + ", " + coords.longitude;
  addMarker(map, googleLatAndLong, title, content);
}

function addMarker(map, latlong, title, content) {
  var markerOptions = {
    position: latlong,
    map: map,
    title: title,
    clickable: true
  };

  var marker = new google.maps.Marker(markerOptions);

  var infoWindowOptions = {
    content: content,
    position: latlong
  };

  var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

  google.maps.event.addListener(marker, "click", function () {
    infoWindow.open(map);
  });
}

function scrollMapToPosition(coords) {
  var latitude = coords.latitude;
  var longitude = coords.longitude;
  var latlong = new google.maps.LatLng(latitude, longitude);

  map.panTo(latlong);

  addMarker(map, latlong, "Your new location", "You moved to: " + latitude + ", " + longitude);
}
// end of geolocation and Google Maps
