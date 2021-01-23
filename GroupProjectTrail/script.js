
  var queryURL = "https://opendata.arcgis.com/datasets/9c21cc1f95ba40468deb36bb6fd94943_0.geojson";

  $.ajax({
  url: queryURL,
  method: "GET"
  })
  .then(function(response){
    console.log(JSON.stringify(response) + "worked");
    
  });
