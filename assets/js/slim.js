let map;
const address = [];
const apiKey = "my_API_Key";
const placeIDs = [];
const parkIDs = [];
const placeTypes = ['veterinary_care', 'pet_store'];
const iconTypes = [{
    url: `assets/images/markers/gas.png`,
    size: new google.maps.Size(34, 34),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(25.5, 29)
}, {
    url: `assets/images/markers/esp.png`,
    size: new google.maps.Size(34, 34),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(25.5, 29)
}];

const imgArray = ['esp', 'gas', 'hax', 'hun', 'lux', 'mes', 'regi', 'sep', 'shu', 'sui', 'ven', 'war'];

const vetDump = [];
const shopDump = [];
const doOnce = false;
let isPlaceVet = true;

const getAddress = () => {
    let street = $("#house").val().trim();
    let city = $("#city").val().trim();
    let state = $("#state").val().trim();

    address.push(street, city, state);
}

$('#submit-geo').on('click', function () {
    getAddress();

    let userAddress = address.join();
    let coords;
    let queryUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${userAddress}&key=${apiKey}`;
    $.ajax({
        url: queryUrl,
        method: 'GET'
    }).then(function (response) {
        console.log(response);
        var source = response.results;
        for (var i = 0; i < source.length; i++) {
            coords = { lat: source[i].geometry.location.lat, lng: source[i].geometry.location.lng };
            console.log(coords);
        }
        initMap(coords);
    });
});

const initMap = (coords) => {
    map = new google.maps.Map(document.getElementById('map'), {
        center: coords,
        zoom: 11
    });
    getVetPlaces(coords);
    getParkPlaces(coords);
}

const getVetPlaces = (coords) => {
    let coordsArr = [];

    for (num in coords) {
        coordsArr.push(coords[num]);
    }
    for (var i = 0; i < placeTypes.length; i++) {
        let originalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=${coordsArr[0]},${coordsArr[1]}&radius=10000&type=${placeTypes[i]}&key=${apiKey}`;
        let queryUrl = "https://cors-anywhere.herokuapp.com/" + originalUrl;


        console.log(originalUrl);

        $.ajax({
            url: queryUrl,
            method: 'GET',
            dataType: "json",
            headers: {
                "x-requested-with": "xhr"
            }
        }).then(function (response) {
            let source = response.results;
            for (var i = 0; i < source.length; i++) {
                let place = {
                    id: source[i].place_id
                }

                placeIDs.push(place);
            
            }
            console.log(placeIDs);
            renderMarks(map, placeIDs);
        });
        
    }

    isPlaceVet = false;
}

const getParkPlaces = (coords) => {
    let coordsArr = [];

    for (num in coords) {
        coordsArr.push(coords[num]);
    }
    let originalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordsArr[0]},${coordsArr[1]}&radius=10000&keyword=dogpark&key=${apiKey}`;
    let queryUrl = "https://cors-anywhere.herokuapp.com/" + originalUrl;                    

    $.ajax({
        url: queryUrl,
        method: 'GET',
        dataType: "json",
        headers: {
            "x-requested-with": "xhr"
        }
    }).then(function(response){
        console.log(response);
        let source = response.results;
        for (var i = 0; i < source.length; i++) {
            let place = {
                id: source[i].place_id
            }

            parkIDs.push(place);
        
        }
        renderMarks(map, parkIDs);
    });
}
const renderMarks = (map,  idArr) => {
    let infowindow = new google.maps.InfoWindow();
    let service = new google.maps.places.PlacesService(map);
    for (var i = 0; i < idArr.length; i++) {

        service.getDetails({
            placeId: idArr[i].id
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var marker = new google.maps.Marker({
                    icon : {
                        url: getRndIcon(),
                        size: new google.maps.Size(34, 34),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(25.5, 29)
                    },
                    map: map,
                    position: place.geometry.location
                });
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent('<div id="fade-test"><strong>' + place.name + '</strong><br>' +
                        'Rating: ' + place.rating + '<br>' + place.formatted_phone_number + '<br>' +
                        place.formatted_address + '</div>');
                    infowindow.open(map, this);
                });
            }
        });
    }
}





const getIcon = () => {
    let markIcon;
    if (!isPlaceVet) {
        
        markIcon = iconTypes[1];
        return markIcon;
    } else {
        markIcon = iconTypes[0];
        return markIcon;
    }

}

const getRndIcon = () => {
    let markIcon;
    let rnd = Math.floor(Math.random() * imgArray.length);
    markIcon = imgArray[rnd];

    let iconUrl = `assets/images/markers/${markIcon}.png`

    return iconUrl;


}

