// +++++ Leaflet Challenge +++++

// store API endpoints inside variables
var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// make API call to USGS and perform a GET request to the query URL

d3.json(quakeUrl, function(data) {
   // after a response, send the data.features object to the createFeatures function
   createFeatures(data.features);
});

// Circle radius function
function circleSize(magnitude) {
   return magnitude **2 * 2000 
};

// Circle color function by depth
function circleColor(depth) {
   switch (true) {
      case (depth > 90):
         return "#d73027"; //red
      case (depth > 70):
         return "#fc8d59"; //darkorange
      case (depth > 50):
         return "#fee08b"; //lightorange
      case (depth > 30):
         return "#d9ef8b"; //yellow
      case (depth > 10):
         return "#91cf60"; //yellowgreen
      default:
         return "#1a9850"; //green
   }
};

function createFeatures(earthquakeData) {

   // define a function and run once for each feature in the features array
   // give each feature a popup describing the place and time of the earthquake
   var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: function(feature, layer) {
         layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Depth: " + feature.geometry.coordinates[2] + " km</h3><hr><h4>Location: " + feature.properties.place + "</h4><hr><p>" + new Date(feature.properties.time) + "</p>");
      },

      pointToLayer: function(feature, latlng) {
         return new L.circle(latlng, {
            radius: circleSize(feature.properties.mag),
            fillColor: circleColor(feature.geometry.coordinates[2]),
            color: "black",
            weight: .5,
            fillOpacity: 0.8
         })
      }
   });
  
   // send earthquakes layer to the createMap function
   createMap(earthquakes);
}

function createMap(earthquakes) {

   // define lightmap layer
   var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",  
      accessToken: MAPBOX_KEY
   });

   // define lightmap layer
   var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/dark-v10",  
      accessToken: MAPBOX_KEY
   });

   // define satellite map layer
   var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-v9",  
      accessToken: MAPBOX_KEY
   });

   // Define outdoors map layer
   var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/outdoors-v11",  
      accessToken: MAPBOX_KEY
   });

   // create faultline layer
   var tecPlateLines = new L.LayerGroup();

   // add faultline data
   d3.json(plateUrl, function(plateData) {
      L.geoJSON(plateData, {         
         color: "#fc56c6",
         weight: 3         
      }).addTo(tecPlateLines);
      // onEachFeature: function(feature,layer){
      //    layer.bindPopup("Plate Name: " + features.properties.PlateName)
      // }
   });

   // define a baseMaps object to hold our base layers
   var baseMaps = {
      "Dark": darkmap,
      "Light": lightmap,
      "Satellite": satellite,
      "Outdoors": outdoors      
   };

   // create overlay object to hold overlay layer
   var overlayMaps = {
      //"Fault Lines": plates,
      "Earthquakes": earthquakes,
      "Tectonic Plate Boundaries": tecPlateLines
    };

   // create the map, giving it the properties to display on load
   var myMap = L.map("map", {
      center: [47, -114],
      zoom: 4,
      layers: [darkmap, earthquakes, tecPlateLines]
   });

   // create a layer control
   // pass in the baseMaps and overlayMaps
   // add the layer control to the map
   L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
   }).addTo(myMap);

   // add legend to the map
   var info = L.control({
      position: "bottomright"
   });
 
   info.onAdd = function (){
      var div = L.DomUtil.create("div", "legend");
      return div;
   }
   
   info.addTo(myMap);

   document.querySelector(".legend").innerHTML=legendColor();

}

function legendColor(){
   var legendInfo = [{
       limit: "<b>Less than 10</b>",
       color: "#1a9850"
   },{
       limit: "<b>10 to 30</b>",
       color: "#91cf60"
   },{
       limit:"<b>30 to 50</b>",
       color:"#d9ef8b"
   },{
       limit:"<b>50 to 70</b>",
       color:"#fee08b"
   },{
       limit:"<b>70 to 90</b>",
       color:"#fc8d59"
   },{
       limit:"<b>More than 90</b>",
       color:"#d73027"
   }];

   var header = "<h3>Earthquake Depth (km)</h3><hr>";

   var table = "";
  
   for (i = 0; i < legendInfo.length; i++){
       table += "<p style = \"background-color: "+legendInfo[i].color+"\">"+legendInfo[i].limit+"</p> ";
   }
   
   return header+table;

}

