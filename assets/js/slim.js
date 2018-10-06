
const address = [];
const apiKey = "";
const placeIDs = [];

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

let map;
let parkIDs = [];

//check to see if check boxes are disabled
let btnDisabled = false;

//term to search for
let toSearchFor = "";

//checks to see if user completed form
let isFormComplete = false;



$(document).ready(function () {
    $(".filled-in").on("click", function () {
        $(this).attr("isSelected", "true");
        toSearchFor = "";
        toSearchFor = $(this).attr("data-text");

        isFormComplete = true;
        parkIDs = [];

        if (!btnDisabled) {
            disableBoxes(this);
            console.log(btnDisabled);
        } else if (btnDisabled) {
            releaseBoxes(this);
            console.log(btnDisabled);
        }

        console.log(toSearchFor);
        console.log('is form complete', isFormComplete);
    });
});

// disables other boxes after the user chooses one
const disableBoxes = (caller) => {
    let chosenBox = caller;
    let storedTxt = $(chosenBox).attr("data-text");
    let selectAttr = $(chosenBox).attr("isSelected");
    btnDisabled = true;
    switch (storedTxt) {
        case "dogpark":
            $("#check-vet").attr("disabled", "disabled");
            $("#check-store").attr("disabled", "disabled");
            break;
        case "veterinary":
            $("#check-store").attr("disabled", "disabled");
            $("#check-park").attr("disabled", "disabled");
            break;
        case "pet+store":
            $("#check-park").attr("disabled", "disabled");
            $("#check-vet").attr("disabled", "disabled");
            break;
        default:
            return;
    }
}

//if the user deselects their box, the other boxes will be clickable
const releaseBoxes = (caller) => {
    let selectAttr = $(caller).attr("isSelected");
    let storedTxt = $(caller).attr("data-text");
    console.log('release');
    switch (storedTxt) {
        case "dogpark":
            $("#check-vet").removeAttr("disabled");
            $("#check-store").removeAttr("disabled");
            btnDisabled = false;
            console.log('works');
            break;
        case "veterinary":
            $("#check-store").removeAttr("disabled");
            $("#check-park").removeAttr("disabled");
            btnDisabled = false;
            console.log('works');
            break;
        case "pet+store":
            $("#check-park").removeAttr("disabled");
            $("#check-vet").removeAttr("disabled");
            btnDisabled = false;
            console.log('works');
            break;
        default:
            return;
    }

}


//gets the address the user inputs
const getAddress = () => {
    let street = $("#house").val().trim();
    let city = $("#city").val().trim();
    let state = $("#state").val().trim();

    //pushes it to the address array
    address.push(street, city, state);
}

$('#submit-geo').on('click', function () {
    //if the user has given an address and chosen what they want to search for
    if (isFormComplete) {
        getAddress();

        //sets the address
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
                //creates a variable that will hold the users lat and lng coordinates
                coords = { lat: source[i].geometry.location.lat, lng: source[i].geometry.location.lng };
                console.log(coords);
            }
            //initialize map with user's coordinates
            initMap(coords);
        });
    } else {
        return false;
    }

});

//creates a map to said id
const initMap = (coords) => {
    map = new google.maps.Map(document.getElementById('map'), {
        center: coords,
        //controls how 'zoomed' the map will start
        zoom: 11
    });
    //recieve locations at a 10 mile radius from the user's coordinates
    getPetPlaces(coords);
}

// returns places around the user at 10-mile radius
const getPetPlaces = (coords) => {

    let coordsArr = [];

    for (num in coords) {
        coordsArr.push(coords[num]);
    }

    let originalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordsArr[0]},${coordsArr[1]}&radius=10000&keyword=${toSearchFor}&key=${apiKey}`;
    let queryUrl = "https://cors-anywhere.herokuapp.com/" + originalUrl;

    $.ajax({
        url: queryUrl,
        method: 'GET',
        dataType: "json",
        headers: {
            "x-requested-with": "xhr"
        }
    }).then(function (response) {
        console.log("places", response);
        let source = response.results;
        for (var i = 0; i < source.length; i++) {
            //create obj that holds an id of the place received by the api
            let place = {
                id: source[i].place_id
            }
            //pushes place id into parkIDs
            parkIDs.push(place);

        }
        //renders palce markers to the map
        renderMarks(map, parkIDs);
    });
}


const renderMarks = (map, idArr) => {
    //initialize info window
    let infowindow = new google.maps.InfoWindow();
    // initialize google place details service
    let service = new google.maps.places.PlacesService(map);
    for (var i = 0; i < idArr.length; i++) {

        service.getDetails({
            //passes ids for each of the places in the array
            placeId: idArr[i].id
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                //create for a place
                var marker = new google.maps.Marker({
                    icon: {
                        url: getRndIcon(),
                        size: new google.maps.Size(34, 34),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(25.5, 29)
                    },
                    map: map,
                    animation: google.maps.Animation.DROP,
                    position: place.geometry.location
                });
                marker.addListener('click', toggleBounce);
                //if click on the marker, an info window will render above it showing specific detais about the place
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.setContent('<div id="fade-test"><strong>' + place.name + '</strong><br>' +
                        'Rating: ' + place.rating + '<br>' + place.formatted_phone_number + '<br>' +
                        place.formatted_address + '</div>');
                    infowindow.open(map, this);
                });
                function toggleBounce() {
                    if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                    } else {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                    }
                }
                //checks to see if the place has a phone
                function checkPhone() {
                    let phone = place.formatted_phone_number;

                    if (typeof phone !== typeof undefined && phone !== false) {
                        //if phone number is present, add phone to the content
                        return `<br> ${phone} <br>`;

                    } else {
                        //else just had a space
                        return `<br>`;
                    }

                }
                //if the place rating is greater than or equal to 4.6, render the follwoing conent to the 'recommendations' div
                if (place.rating >= 4.6) {

                    let text = $('<div id="fade-test"><strong>' + place.name + '</strong><br>' +
                        'Rating: ' + place.rating + checkPhone() +
                        place.formatted_address + '</div>');

                    $("#location-dump").append(text);

                }
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

