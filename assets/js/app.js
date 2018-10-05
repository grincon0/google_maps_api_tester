var map;

var address = [];

var markerObjs = [];

var finishedMark = [];


var markCount = 0;
// pushes user address inputs int the address array
function getAddress() {
    var street = $("#house").val().trim();
    var city = $("#city").val().trim();
    var state = $("#state").val().trim();

    address.push(street, city, state);
}

//holds the name of our icons
var imgArray = ['esp', 'gas', 'hax', 'hun', 'lux', 'mes', 'regi', 'sep', 'shu', 'sui', 'ven', 'war'];

var apiKey = "AIzaSyDEewIlfcIcurMzXVtLW1QTqvCp19nhuLA";
// var zip = $("#zip_code").val().trim();



console.log(address);



$('#submit-geo').on('click', function () {
    //pushes form values into the address array
    getAddress();

    //creates a string with the address array, giving us a string with the user's address
    var useAddress = address.join();
    console.log(useAddress)
    //passes the user address as a single string to the address parameter
    var queryUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${useAddress}&key=${apiKey}`;
    var coords;
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


//inits map and it icons (these can be seperated)
function initMap(coords) {
    // create our Google map
    var map = new google.maps.Map(document.getElementById('map'), {
        center: coords,
        zoom: 11
    });

   getVetPlaces(map, coords);
   
   
}


function getPetPlaces(coords){
    getVetPlaces(coords);
   
}

function getVetPlaces ( map, coords){

    var corNumArray = [];

    for (prop in coords) {
        corNumArray.push(coords[prop]);
    }
    
    var originalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=${corNumArray[0]},${corNumArray[1]}&radius=10000&type=veterinary_care&key=${apiKey}`;
    var queryUrl = "https://cors-anywhere.herokuapp.com/" + originalUrl;

    $.ajax({
        url: queryUrl,
        method: 'GET',
        dataType: "json",
        headers: {
            "x-requested-with" : "xhr"
        }
    }).then(function(response){
        console.log('CORS anywhere response', response);
        let source = response.results;
        for( var i = 0; i < source.length; i++ ){
            console.log('latitude', source[i].geometry.location.lat);
            console.log('longitude', source[i].geometry.location.lng);
            console.log('name', source[i].name);
            //console.log('photos', source[i].photos[i].html_attributions[0]);

            var markerInfo = {
                name : source[i].name,
                lat : source[i].geometry.location.lat,
                lng : source[i].geometry.location.lng,
                id : source[i].place_id,
                rating :  source[i].rating,
            }

            markerObjs.push(markerInfo);
            console.log('marker info var', markerInfo);

            console.log(map);
        }
        console.log(markerObjs);
        createMarkers(map, markerObjs);

    });

}

function getShopPlaces(coords) {
    var queryUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?&location=34.0312751,-83.6011126&radius=25000&type=pet_store&keyword=pet&key=${apiKey}`;
    $.ajax({
        url: queryUrl,
        method: 'GET'
    }).then(function(response){
        console.log('pet shop', response);
    });
}



function createMarkers(map, markerArr){
    for(var i = 0; i < markerArr.length; i++){
        var marker = new google.maps.Marker({
            position: { lat: markerArr[i].lat, lng: markerArr[i].lng },
            map: map,
            icon: {
                url: `assets/images/markers/hax.png`,
                size: new google.maps.Size(34, 34),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(25.5, 29)
            }
        });
        
        
        var infoWindow = new google.maps.InfoWindow({
            content: `<p>A wild Pokemon has been spotted!</p>
                      <p>${markerArr[i].name}</p>`
        
        });
        
        var obj = {
            mark : marker,
            info : infoWindow
        }

        finishedMark.push(obj);

    }

    console.log('its finished', finishedMark);
    putWindows(map, finishedMark);


}

function putWindows(map, finishedMark){
    for(var i = 0; i < finishedMark.length; i++){
        console.log(finishedMark[i]);
        let info = finishedMark[i].info;
        finishedMark[i].mark.addListener('click', function () {
            info.open(map, finishedMark[i].mark);
        
        });
    }

}




var marker = new google.maps.Marker({
    position: { lat: plLat, lng: plLng },
    map: map,
    icon: {
        url: `assets/images/markers/hax.png`,
        size: new google.maps.Size(34, 34),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25.5, 29)
    }
});


var infoWindow = new google.maps.InfoWindow({
    content: `<p>A wild Pokemon has been spotted!</p>
              <p>${source[i].name}</p>`

});

marker.addListener('click', function () {
    infoWindow.open(map, marker);

});