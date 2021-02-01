$(document).ready(function () {

  var apiKey = 'gv6tmP4JQDOhpB8OVmK9LaoSODwYWgPAVYqlFkJh';

  // Initialize the Materialize select element
  $('select').formSelect();

  // Get last search from local storage and call displayParks
  var lastState = localStorage.getItem('lastState');
  console.log("lastState: " + lastState);

  var lastCoordStr = localStorage.getItem('lastCoord');
  console.log("lastCoord: " + lastCoordStr);
  var lastCoordObj = JSON.parse(lastCoordStr);

  if (lastState !== "") {
    displayParks(lastState);
  }
  if (lastCoordObj !== null) {
    displayLastMap(lastCoordObj);
  }

  // code for state select button 
  document.getElementById('run-search').addEventListener('click', function (event) {
    event.preventDefault();

    var statesel = document.getElementById('stateselection');
    // var activitysel = document.getElementsByClassName('activity');

    // for (var i = 0; i < activitysel.length; i++) {
    //   if (activitysel[i].checked) {
    //     console.log(activitysel[i].value)
    //   }
    // }

    var stateCode = statesel.value;
    console.log("stateCode: " + stateCode);
    localStorage.setItem('lastState', stateCode);

    localStorage.setItem('lastCoord', null);

    displayParks(stateCode);
  });

  // Get response from API and write parks to cards in page
  function displayParks(stateCode) {
    $("#parkinfo").empty();
    $('#map').empty();
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
       var imageUrl = eachPark.images[0].url;

       if (imageUrl) {
        var image = $("<img>").attr("src", imageUrl);
         parkListItem.append(image);
       }
       // Converting the arrays in addresses data into strings and storing them in a variable
       var addresses = eachPark.addresses[0].line1;
       var addressesCity = eachPark.addresses[0].city;
       var addressesState = eachPark.addresses[0].stateCode;
       console.log(addresses, addressesCity, addressesState)
 
       // If the park data contains an address, city, & state, append it to the list item
       if (addresses && addressesCity && addressesState) {
         console.log(addresses, addressesCity, addressesState);
         parkListItem.append("<br>" + addresses, "<br>", addressesCity + ", " + addressesState);
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

      //  Add map button to card
      var mapBtn = $('<a>');
      mapBtn.addClass('waves-effect waves-light btn mapBtn')
      mapBtn.attr('data-index', a);
      mapBtn.text('MAP');
      mapBtn.on('click', function (event) {
        event.preventDefault();
        var index = $(this).attr('data-index');
        console.log("thisName: " + response.data[index].name);
        getLatLong(index);
      });
      parkListItem.append('<br>');
      parkListItem.append(mapBtn);

       // Append the list item to the unordered list
       parkList.append(parkListItem);
     }

      function getLatLong(index) {
        var latitude = response.data[index].latitude;
        var longitude = response.data[index].longitude;
        var coordinates = new google.maps.LatLng(latitude, longitude);
        console.log("thisCoord: " + coordinates);

        localStorage.setItem('lastCoord', JSON.stringify(coordinates));

        displayMap(coordinates);
      }

      // Initialize and add the map
      function displayMap(coordinates) {
        // The map, centered at park
        const map = new google.maps.Map(document.getElementById("map"), {
          zoom: 6,
          center: coordinates,
        });
        // The marker, positioned at park
        const marker = new google.maps.Marker({
          position: coordinates,
          map: map,
        });
      }
    }).catch(function (error) {
      console.error(error);
    });
  }

  function displayLastMap(coordinates) {
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 6,
      center: coordinates,
    });
    const marker = new google.maps.Marker({
      position: coordinates,
      map: map,
    });
  }

});  // end of document ready function
