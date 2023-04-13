import { createMarker } from "./extras.js";
let service;
let cebu = { lat: 10.311175, lng: 123.885159 };

function initMap() {
  const request = {
    query: "restaurant",
    location: cebu,
    radius: 9000,
  };
  let map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: cebu,
  });
  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      // MARKERS
      createMarker(results);
    }
  });
}

window.initMap = initMap;
