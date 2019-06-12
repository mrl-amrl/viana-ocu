var states = {
    'map': null,
    'marker': null,
    'marker_spp': null,
    'ready': false,
    'circle': null,
    'base_position': [36.32366982194707, 50.03928838549518],
}

function setBatteryLevel(level) {
    document.getElementById("battery_level").style.width = level + "%";
    document.getElementById("battery_level").classList.remove('high');
    document.getElementById("battery_level").classList.remove('medium');
    document.getElementById("battery_level").classList.remove('low');
    if (level > 66) document.getElementById("battery_level").classList.add('high');
    else if (level >= 33) document.getElementById("battery_level").classList.add('medium');
    else document.getElementById("battery_level").classList.add('low');
}

function map_callback() {
    var mapProp = {
        center: new google.maps.LatLng(states.base_position[0], states.base_position[1]),
        disableDefaultUI: true,
        zoom: 20,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#ff4400"
                    },
                    {
                        "saturation": -68
                    },
                    {
                        "lightness": -4
                    },
                    {
                        "gamma": 0.72
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon"
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#0077ff"
                    },
                    {
                        "gamma": 3.1
                    }
                ]
            },
            {
                "featureType": "water",
                "stylers": [
                    {
                        "hue": "#00ccff"
                    },
                    {
                        "gamma": 0.44
                    },
                    {
                        "saturation": -33
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "stylers": [
                    {
                        "hue": "#44ff00"
                    },
                    {
                        "saturation": -23
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "hue": "#007fff"
                    },
                    {
                        "gamma": 0.77
                    },
                    {
                        "saturation": 65
                    },
                    {
                        "lightness": 99
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "gamma": 0.11
                    },
                    {
                        "weight": 5.6
                    },
                    {
                        "saturation": 99
                    },
                    {
                        "hue": "#0091ff"
                    },
                    {
                        "lightness": -86
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                    {
                        "lightness": -48
                    },
                    {
                        "hue": "#ff5e00"
                    },
                    {
                        "gamma": 1.2
                    },
                    {
                        "saturation": -23
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "saturation": -64
                    },
                    {
                        "hue": "#ff9100"
                    },
                    {
                        "lightness": 16
                    },
                    {
                        "gamma": 0.47
                    },
                    {
                        "weight": 2.7
                    }
                ]
            }
        ],
    };
    var map = new google.maps.Map(document.getElementById("google_map"), mapProp);
    states.map = map;
    states.ready = true;
    var init_position = new google.maps.LatLng(36.323643, 50.039436);
    var marker = new google.maps.Marker({
        position: init_position,
        map: map,
    });
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
    var marker_spp = new google.maps.Marker({
        position: init_position,
        map: map,
    });
    marker_spp.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png')
    var base_marker = new google.maps.Marker({
        position: new google.maps.LatLng(states.base_position[0], states.base_position[1]),
        map: map,
    });
    base_marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
    var circle = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map: map,
        center: init_position,
        radius: 5
    });
    states.marker = marker;
    states.marker_spp = marker_spp;
    states.circle = circle;

    google.maps.event.addListener(map, 'click', function(event) {
        alert(event.latLng);
    });
}

function set_marker(data) {
    if (!states.ready)
        return;
    var position = new google.maps.LatLng(data.lat, data.lng);
    if (data.type == 'spp')
        states.marker_spp.setPosition(position);
    else
        states.marker.setPosition(position);
}

function set_circle(data) {
    if (!states.ready)
        return;
    if (data.type != 'rtk')
        return;
    var position = new google.maps.LatLng(data.lat, data.lng);
    states.circle.setCenter(position);
    states.circle.setRadius(data.radius);
}

function setImuData(data) {
    console.log(data);
    document.getElementById("roll").innerHTML = data[0].toFixed(2);
    document.getElementById("pitch").innerHTML = data[1].toFixed(2);
    document.getElementById("yaw").innerHTML = data[2].toFixed(2);
}

function connect() {
    var socket = new WebSocket('ws://localhost:9001');

    socket.onclose = function () {
        console.log("connection has been closed")

        setTimeout(function() {
            connect();
        }, 1000)
    }
    
    socket.onopen = function () {
        console.log("connection has been opened")
    }
    
    socket.onmessage = function (msg) {
        var data = JSON.parse(msg.data);
        if (data.type == 'battery') {
            setBatteryLevel(data.value);
            return;
        } else if (data.type == 'imu') {
            setImuData(data.value);
            return;
        }
        set_circle(data);
        set_marker(data);
    }
}

setTimeout(connect, 500);