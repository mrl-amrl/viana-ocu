var states = {
    'map': null,
    'robot_marker': null,
    'target_marget': null,
    'polyline': null,
    'target_path': [],
    'point_radius': 1,
    'base_position': [36.3236571617, 50.0394061638],
    'map_style': [
        {
            "stylers": [
                {
                    "hue": "#ff1a00"
                },
                {
                    "invert_lightness": true
                },
                {
                    "saturation": -100
                },
                {
                    "lightness": 33
                },
                {
                    "gamma": 0.5
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#2D333C"
                }
            ]
        }
    ],
    'circles': [],
}

$(document).ready(function() {
    $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCs1ef3Y3WR0mB07kzGDQ9lRBeii2GpN-E&callback=map_callback", function(){
        $(".container").fadeIn().promise().then(function() {
            setTimeout(function() {
                $(".spinner").fadeOut()
            }, 1000);
        });
    });

    $(".button-reset").click(function() {
        states.target_path = [];
        updateUserPath();
        for (var i = 0;i < states.circles.length;i++) 
            states.circles[i].setMap(null);        
        
        states.circles = [];
        states.target_marget.setMap(null);
    });
});

function setBatteryLevel(level) {
    document.getElementById("battery_level").style.width = level + "%";
    document.getElementById("battery_level").classList.remove('high');
    document.getElementById("battery_level").classList.remove('medium');
    document.getElementById("battery_level").classList.remove('low');
    if (level > 66) document.getElementById("battery_level").classList.add('high');
    else if (level >= 33) document.getElementById("battery_level").classList.add('medium');
    else document.getElementById("battery_level").classList.add('low');
}

function rotateIcon(marker, angle) {
    angle = -angle;
    angle = angle - 90;    
    var icon = marker.getIcon();
    icon.rotation = angle;
    marker.setIcon(icon);
}

function updateUserPath() {
    for (var i=0;i<states.target_path.length;i++) {
        var point = states.target_path[i];                
    }
    states.polyline.setPath(states.target_path);  
}

function map_callback() {
    var init_position = new google.maps.LatLng(states.base_position[0], states.base_position[1]);

    var mapProp = {
        center: init_position,
        disableDefaultUI: true,
        zoom: 20,
        styles: states.map_style,        
    };
    var map = new google.maps.Map(document.getElementById("google_map"), mapProp);
    states.map = map;
    
    states.robot_marker = new google.maps.Marker({
        position: init_position,
        map: map,
        icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            fillColor: '#ce93d8',
            fillOpacity: .6,
            strokeWeight: 0,
            scale: 5,           
            rotation: -90, 
            anchor: new google.maps.Point(0, -3),
        },
    });

    states.polyline = new google.maps.Polyline({        
        strokeColor: '#ffa726',
        strokeOpacity: 0.6,
        strokeWeight: 1,
        map: map,
    });    
    
    var target_marget = new google.maps.Marker({
        position: init_position,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#bf360c',
            fillOpacity: .6,
            strokeWeight: 0,
            scale: 5,           
            rotation: -90, 
        },
    });
    states.target_marget = target_marget;

    google.maps.event.addListener(map, 'click', function (event) {
        const position = event.latLng;
        states.target_marget.setPosition(position);
        states.target_marget.setMap(states.map);
        states.target_path.push(position);        
        updateUserPath();

        var pointCircle = new google.maps.Circle({
            strokeColor: '#fff176',
            strokeOpacity: 0.1,
            strokeWeight: 2,
            fillColor: '#fdd835',
            fillOpacity: 0.1,
            map: states.map,
            center: position,
            radius: states.point_radius
        });
        states.circles.push(pointCircle);
    });
}

function set_marker(data) {
    if (!states.ready)
        return;
    var position = new google.maps.LatLng(data.lat, data.lng);
    if (data.type == 'enu')
        states.enu_marker.setPosition(position);
    else
        states.robot_marker.setPosition(position);    
}

function setImuData(data) {
    document.getElementById("roll").innerHTML = data[0].toFixed(2);
    document.getElementById("pitch").innerHTML = data[1].toFixed(2);
    document.getElementById("yaw").innerHTML = data[2].toFixed(2);
    rotateIcon(states.robot_marker, data[2].toFixed(2));
}

function connect() {
    var socket = new WebSocket('ws://localhost:9001');

    socket.onclose = function () {
        console.log("connection has been closed")
        states.connected = false;

        // setTimeout(function () {
        //     connect();
        // }, 1000)
    }

    socket.onopen = function () {
        console.log("connection has been opened")
        states.connected = true;
        states.socket = socket;
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
        set_marker(data);
    }
}

setTimeout(connect, 500);