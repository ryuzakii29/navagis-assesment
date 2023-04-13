var markers = [];
let cebu = { lat: 10.311175, lng: 123.885159 };
let contentString = [];
let restoType = [];
let service;
let food = ["Soup", "Beef", "Pork", "Chicken", "Veggies"];

export const createMarker = (results, animation, radiusCenter) => {
  let infowindow = new google.maps.InfoWindow();
  let map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: radiusCenter ? radiusCenter : cebu,
  });
  console.log(radiusCenter);
  service = new google.maps.places.PlacesService(map);
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const directionsService = new google.maps.DirectionsService();

  for (let i = 0; i < results.length; i++) {
    let place = results[i];
    let latitude = place.geometry.location.lat();
    let longitude = place.geometry.location.lng();
    let request = {
      placeId: place.place_id,
    };
    markers[i] = new google.maps.Marker({
      map,
      title: place.name,
      position: { lat: latitude, lng: longitude },
      animation: animation,
    });
    service.getDetails(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // RESTO INFO
        contentString[i] =
          `<div class="content">` +
          '<div id="siteNotice">' +
          "</div>" +
          `<h3 id="firstHeading" class="firstHeading">${place.name}</h3>` +
          '<div id="bodyContent">' +
          `<p><b>Specialty</b>: ${
            place.name.toLowerCase().includes("cafe")
              ? "Coffee"
              : food[Math.floor(Math.random() * food.length)]
          } </p>` +
          `<p><b>Visits:</b> ${
            results.user_ratings_total !== undefined
              ? results.user_ratings_total
              : 0
          }</p>` +
          `<p><b>Ratings:</b> ${place.rating}</p>` +
          "</div>" +
          "</div>";
        infowindow[i] = new google.maps.InfoWindow({
          content: contentString[i],
          ariaLabel: place.name,
        });
        markers[i].addListener("click", () => {
          infowindow[i].open({
            anchor: markers[i],
            map,
          });

          //   get direction

          // Try HTML5 geolocation.
          let infoWindow2 = new google.maps.InfoWindow();
          if (navigator.geolocation) {
            infoWindow2 = new google.maps.InfoWindow();
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                directionsRenderer.setMap(map);
                calculateAndDisplayRoute(
                  directionsService,
                  directionsRenderer,
                  pos,
                  { lat: latitude, lng: longitude }
                );

                infoWindow2.setPosition(pos);
                infoWindow2.setContent("Location found.");
                infoWindow2.open(map);
                map.setCenter(pos);
              },
              () => {
                handleLocationError(true, infoWindow2, map.getCenter());
              }
            );
          } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow2, map.getCenter());
          }
        });
      }
    });

    for (let p = 0; p < place.types.length; p++) restoType.push(place.types[p].replace(/_/g , " "));
  }

  const drawingManager = new google.maps.drawing.DrawingManager({
    // drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.CIRCLE],
    },
    markerOptions: {
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    },
    circleOptions: {
      fillColor: "#ffff00",
      fillOpacity: 0.1,
      strokeWeight: 5,
      clickable: false,
      editable: true,
      zIndex: 1,
    },
  });
  drawingManager.setMap(map);
  google.maps.event.addListener(
    drawingManager,
    "circlecomplete",
    function (circle) {
      var radius = circle.getRadius();
      let latitude = circle.center.lat();
      let longitude = circle.center.lng();
      const request = {
        query: "food",
        location: { lat: latitude, lng: longitude },
        radius,
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // MARKERS
          createMarker(results, undefined, { lat: latitude, lng: longitude });
          map.setCenter({ lat: latitude, lng: longitude });
        }
      });
    }
  );

  if (animation == undefined) restaurantTypes(map);
};

let restaurantTypes = (map) => {
  // getting types of resto
  let uniqueChars = [...new Set(restoType)];
  const placesTypes = document.getElementById("type");

  for (let x = 0; x < uniqueChars.length; x++) {
    let li = document.createElement("li");
    li.textContent = uniqueChars[x];
    placesTypes.appendChild(li);

    li.addEventListener("click", () => {
      const request = {
        keyword: li.innerHTML,
        location: cebu,
        type: ["food"],
        radius: 9000,
      };
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // MARKERS
          createMarker(results, google.maps.Animation.BOUNCE);
        }
      });
    });
  }
};

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function calculateAndDisplayRoute(
  directionsService,
  directionsRenderer,
  pos,
  destination
) {
  directionsService
    .route({
      origin: pos,
      destination,
      travelMode: google.maps.TravelMode["DRIVING"],
    })
    .then((response) => {
      directionsRenderer.setDirections(response);
      console.log(pos);
      console.log(destination);
    })
    .catch((e) => window.alert("Directions request failed due to " + e));
}
